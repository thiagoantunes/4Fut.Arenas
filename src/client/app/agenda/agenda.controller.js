/*global $:false */
/*jshint quotmark: false */
(function() {
    'use strict';

    angular
        .module('app.agenda')
        .controller('ReservasCtrl', ReservasCtrl);

    ReservasCtrl.$inject = [
        '$scope',
        'quadraService',
        'reservasService' ,
        'contatosService' ,
        'uiCalendarConfig' ,
        '$popover' ,
        'blockUI' ,
        '$modal',
        'cfpLoadingBar',
        '$window',
        'logger'
    ];
    /*jshint maxparams: 20 */
    // jshint maxstatements:50
    function ReservasCtrl(
        $scope,
        quadraService,
        reservasService,
        contatosService,
        uiCalendarConfig ,
        $popover,
        blockUI,
        $modal,
        cfpLoadingBar,
        $window,
        logger) {

        var vm = this;
        vm.quadras = quadraService.getQuadras();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.selecaoQuadras = [];
        vm.reservas = [];
        vm.eventSources = [[]];
        vm.uiConfig = {};
        vm.novaReserva = {};
        vm.reservaSelecionada = {};
        vm.novaReservaModal = {};
        vm.horarioLivre = false;
        vm.reservaRadio = 2;

        vm.refreshCalendar = refreshCalendar;
        vm.atualizaDisponibilidade = atualizaDisponibilidade;
        vm.salvarReservaAvulsa = salvarReservaAvulsa;
        vm.openPrecosModal = openPrecosModal;
        vm.gotoDate = gotoDate;
        vm.showReservasModal = showReservasModal;
        vm.hideModalForm = hideModalForm;
        vm.showNovoContatoModal = showNovoContatoModal;
        vm.salvarContato = salvarContato;
        vm.excluirReserva = excluirReserva;

        activate();

        function activate() {
            vm.novaReservaModal = $modal({
                scope: $scope,
                templateUrl: 'modalPelada.html',
                animation:'am-fade-and-slide-top' ,
                show: false
            });

            vm.novoContatoModal = $modal({
                scope: $scope,
                templateUrl: 'app/contatos/novo-contato.html',
                animation:'am-fade-and-slide-top' ,
                show: false,
                container: 'body'
            });

            vm.uiConfig = {
                calendar:{
                    lang:'pt-br',
                    // minTime:'10:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // maxTime:'24:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    height: $window.innerHeight - 120,
                    timeFormat: 'H(:mm)',
                    timezone:'local',
                    header:{left:'month agendaWeek agendaDay',center: 'title'},
                    defaultView:'agendaWeek',
                    scrollTime :  '09:00:00',
                    allDaySlot: false,
                    defaultEventMinutes: 60,
                    axisFormat: 'H:mm',  //,'h(:mm)tt',
                    dayClick: dayClick,
                    editable: true,
                    selectable: true,
                    selectHelper: true,
                    unselectCancel: '.reservasForm',
                    eventResize: eventResize,
                    eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender,
                    viewRender: viewRender,
                    gotoDate : gotoDate
                }
            };

            vm.quadras.$loaded(loadQuadras);
        }

        function loadQuadras() {
            _.forEach(vm.quadras, function(q) {
                vm.selecaoQuadras.push({
                    quadra: q,
                    ativa: true
                });
            });
        }

        function getReservas(start, end) {
            uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
            vm.reservas = reservasService.getFilteredArray(filterFunc, start , end);

            cfpLoadingBar.start();
            vm.reservas.$loaded(function() {
                cfpLoadingBar.complete();
            });

            vm.reservas.$watch(function(event) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
            });
        }

        function filterFunc(rec) {
            var qdrs = _.pluck(_.filter(vm.selecaoQuadras, 'ativa', true), 'quadra');
            return _.some(qdrs, {'$id': rec.quadra});
        }

        function refreshCalendar() {
            var start = uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').start._d.getTime();
            var end = uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').end._d.getTime();

            getReservas(start, end);
        }

        function viewRender(view, element) {

            getReservas(view.start._d.getTime(), view.end._d.getTime());
        }

        function eventSelect(start, end, jsEvent, view) {
            if (end._d.getDay() !== start._d.getDay()) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('unselect');
            }
            else {
                var element = $(jsEvent.target).closest('.fc-event');
                var placement = (jsEvent.clientY < 350) ? 'bottom' : 'top';

                if (element.length > 0) {
                    var popover = $popover(element, {
                       placement: placement,
                       title:'',
                       templateUrl: 'popupNovaReserva.html',
                       container: '#reservas',
                       autoClose: 1,
                       scope: $scope
                   });
                    vm.novaReserva = {
                       responsavel : {},
                       dataLabel : moment(start).format('ddd, DD [de] MMMM') + ', ' +
                           moment(start._d).format('HH:mm') + ' às ' + moment(end._d).format('HH:mm'),
                       start : start._d,
                       end : end._d,
                       placement : placement
                   };

                    //atualizaDisponibilidade();
                    popover.$promise.then(popover.show);
                }
            }
        }

        function eventResize(event, delta, revertFunc) {
            if (conflitoHorário(event)) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
                logger.error('Conflito de horários!');
            }
            else {
                cfpLoadingBar.start();
                var reserva = _.find(vm.reservas, {
                    $id: event.$id
                });
                reserva.end = moment(reserva.end).add(delta._milliseconds, 'milliseconds')._d.getTime();
                vm.reservas.$save(reserva).then(function(ref) {
                    cfpLoadingBar.complete();
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
                    logger.success('Reserva editada com sucesso!');
                });
            }
        }

        function eventDrop(event, delta, revertFunc) {
            if (conflitoHorário(event)) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
                logger.error('Conflito de horários!');
            }
            else {
                cfpLoadingBar.start();
                var reserva = _.find(vm.reservas, {
                    $id: event.$id
                });
                reserva.start = moment(reserva.start).add(delta._milliseconds, 'milliseconds')._d.getTime();
                reserva.end = moment(reserva.end).add(delta._milliseconds, 'milliseconds')._d.getTime();
                reserva.start = moment(reserva.start).add(delta._days, 'days')._d.getTime();
                reserva.end = moment(reserva.end).add(delta._days, 'days')._d.getTime();
                vm.reservas.$save(reserva).then(function(ref) {
                    cfpLoadingBar.complete();
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
                    logger.success('Reserva editada com sucesso!');
                });
            }
        }

        function eventRender(event, element,view) {
            if (!event.tipo) {
                event.tipo = 1;
            }
            element.find('.fc-time').prepend('<img src=\'images/icons/tipo-' + event.tipo +
                '.png\' width=\'15\' height=\'15\' style=\'margin-right: 5px; margin-top: -4px;\'>');
            element.attr('class' , element.attr('class') +  ' ' +
                _.pluck(_.filter(vm.quadras,'$id', event.quadra), 'color'));
        }

        function eventClick(calEvent, jsEvent) {

            var color = _.result(_.find(vm.quadras , {'$id' : calEvent.quadra}), 'color');

            vm.novaReserva = {
                id: calEvent.$id,
                quadra: _.find(vm.quadras, {$id : calEvent.quadra}),
                responsavel : _.find(vm.contatos, {$id : calEvent.responsavel}),
                dataLabel : moment(calEvent.start).format('ddd, DD [de] MMMM') + ', ' +
                    moment(calEvent.start).format('HH:mm') + ' às ' +
                    moment(calEvent.end).format('HH:mm'),
                start : moment(calEvent.start)._d,
                end : moment(calEvent.end)._d
            };

            atualizaDisponibilidade();

            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

            var prevPopover = document.getElementsByClassName('popover');
            if (prevPopover) {
                _.forEach(prevPopover, function(p) {
                    if (p !== undefined) {
                        p.parentNode.removeChild(p);
                    }
                });
            }

            var popover = $popover(element, {
                placement: placement,
                title:'',
                templateUrl: 'popupNovaReserva.html',
                container: '#reservas',
                autoClose: 1,
                scope: $scope,
            });
            popover.$promise.then(popover.show);
        }

        function dayClick(date, jsEvent, view) {
            if (view.name === 'month') {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('changeView', 'agendaDay');
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('gotoDate', date);
            }
            //else{
            //    vm.openNovaPeladaModal(date);
            //}
        }

        function atualizaDisponibilidade() {
            vm.novaReserva.preco = _.find(vm.novaReserva.quadra.funcionamento  , function(f) {
                return f.start <= moment(vm.novaReserva.start).format('HH:mm') &&
                        f.end >= moment(vm.novaReserva.end).format('HH:mm') &&
                        f.dow === ('' + vm.novaReserva.start.getDay());
            });

            vm.horarioLivre = _.every(_.filter(vm.reservas, 'quadra', vm.novaReserva.quadra.$id), function(f) {
                return ((vm.novaReserva.start >= moment(f.end) || vm.novaReserva.end <= moment(f.start)) ||
                vm.novaReserva.id === f.$id);
            });
        }

        function conflitoHorário(reserva) {
            return !_.every(_.filter(vm.reservas, 'quadra', reserva.quadra), function(f) {
                return ((reserva.start >= moment(f.end) || reserva.end <= moment(f.start)) ||
                reserva.$id === f.$id);
            });
        }

        function salvarReservaAvulsa() {
            if (vm.novaReserva.id) {
                var reservaSelecionada = _.find(vm.reservas, {$id : vm.novaReserva.id});
                reservaSelecionada.responsavel = vm.novaReserva.responsavel.$id;
                reservaSelecionada.quadra = vm.novaReserva.quadra.$id;
                vm.reservas.$save(reservaSelecionada).then(function(ref) {
                    logger.success('Reserva editada com sucesso!');
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('unselect');
                }, function(error) {
                    logger.error(error, vm.reserva, 'Ops!');
                });
            }
            else {
                vm.reservas.$add({
                    tipo : 1,
                    quadra: vm.novaReserva.quadra.$id,
                    start : vm.novaReserva.start.getTime(),
                    end : vm.novaReserva.end.getTime(),
                    responsavel : vm.novaReserva.responsavel.$id,
                    title: vm.novaReserva.responsavel.nome
                }).then(function(ref) {
                    logger.success('Reserva criada com sucesso!');
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('unselect');
                }, function(error) {
                    logger.error(error, vm.reserva, 'Ops!');
                });
            }
        }

        function excluirReserva(id) {
            vm.reservas.$remove(_.find(vm.reservas, {$id: id}));
        }

        function openPrecosModal(q) {
            $modal({
                scope : $scope,
                controllerAs: 'vm',
                controller: 'PrecosReadOnlyCtrl',
                templateUrl: 'app/arena/precos/precos-readonly.html',
                resolve: {
                    quadra: function() {
                        return {
                            id: q.$id,
                            color: q.color,
                            nome : q.nome
                        };
                    }
                }
            });
        }

        function showReservasModal() {
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.show);
        }

        function showNovoContatoModal() {
            vm.contatoSelecionado = {};
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function salvarContato() {
            contatosService.addNovoContato(vm.contatoSelecionado);
        }

        function hideModalForm() {
            vm.reservaRadio = 2;
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.hide);
        }

        function gotoDate(date) {
            uiCalendarConfig.calendars.reservasCalendar.fullCalendar('gotoDate', date);
        }
    }

})();
