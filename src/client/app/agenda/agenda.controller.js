/*global $:false */
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
        'cfpLoadingBar'
    ];

    function ReservasCtrl(
        $scope,
        quadraService,
        reservasService,
        contatosService,
        uiCalendarConfig ,
        $popover,
        blockUI,
        $modal,
        cfpLoadingBar) {

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
                    minTime:'10:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    maxTime:'24:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    height: 'auto',
                    timeFormat: 'H(:mm)',
                    timezone:'local',
                    header:{left:'month agendaWeek agendaDay',center: 'title'},
                    defaultView:'agendaWeek',
                    firstHour: 9,
                    allDaySlot: false,
                    defaultEventMinutes: 60,
                    axisFormat: 'H:mm',  //,'h(:mm)tt',
                    dayClick: dayClick,
                    editable: true,
                    selectable: true,
                    selectHelper: true,
                    unselectCancel: '.reservasForm',
                    //eventResize: eventResize,
                    //  eventDrop: eventDrop,
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
            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

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

        function eventRender(event, element) {
            element.attr('class' , element.attr('class') +  ' ' +
                _.pluck(_.filter(vm.quadras,'$id', event.quadra), 'color'));
            $popover(element, {
                placement: 'bottom',
                title:'',
                templateUrl: 'popupReserva.html',
                container: '#reservas',
                autoClose: 1,
                scope: $scope
            });
        }

        function eventClick(calEvent) {
            var reserva = _.find(vm.reservas , {'$id' : calEvent.$id});
            var responsavel = _.result(_.find(vm.contatos , {'$id' : reserva.responsavel}), 'nome');
            var color = _.result(_.find(vm.quadras , {'$id' : reserva.quadra}), 'color');

            vm.reservaSelecionada = {
                responsavel: responsavel,
                quando: moment(reserva.start).format('ddd, DD [de] MMMM') + ', ' +
                    moment(reserva.start).format('HH:mm') + ' às ' +
                    moment(reserva.end).format('HH:mm'),
                quadra: reserva.quadra,
                color: color,
                varlor: 'R$ 150,00'
            };
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
                        _.any(f.dow , function(n) {
                            return n === vm.novaReserva.start.getDay();
                        });
            });

            vm.horarioLivre = _.every(_.filter(vm.reservas, 'quadra', vm.novaReserva.quadra.$id), function(f) {
                return (vm.novaReserva.start >= moment(f.end) || vm.novaReserva.end <= moment(f.start));
            });
        }

        function salvarReservaAvulsa() {
            vm.reservas.$add({
                tipo : 1,
                quadra: vm.novaReserva.quadra.$id,
                start : vm.novaReserva.start.getTime(),
                end : vm.novaReserva.end.getTime(),
                responsavel : vm.novaReserva.responsavel.$id
            }).then(function(ref) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('unselect');
            });
        }

        function openPrecosModal(q) {
            $modal({
                scope : $scope,
                controllerAs: 'vm',
                controller: 'PrecosCtrl',
                templateUrl: 'app/arena/quadras/precos/precos.html',
                resolve: {
                    quadra: function() {
                        return {
                            id: q.$id,
                            color: q.color
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
