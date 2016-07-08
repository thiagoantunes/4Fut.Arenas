/*global $:false */
/*jshint quotmark: false */
(function () {
    'use strict';

    angular
        .module('app.agenda')
        .controller('ReservasCtrl', ReservasCtrl);

    ReservasCtrl.$inject = [
        '$scope',
        'quadras',
        'reservasService',
        'contatosService',
        'financeiroService',
        'uiCalendarConfig',
        '$popover',
        'blockUI',
        '$modal',
        'cfpLoadingBar',
        '$window',
        'logger'
    ];
    /*jshint maxparams: 20 */
    // jshint maxstatements:70
    function ReservasCtrl(
        $scope,
        quadras,
        reservasService,
        contatosService,
        financeiroService,
        uiCalendarConfig,
        $popover,
        blockUI,
        $modal,
        cfpLoadingBar,
        $window,
        logger) {

        var vm = this;
        vm.quadras = quadras;
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
        vm.popover = {};
        vm.popoverPosition = null;
        vm.formaPagamento = [
            {value: 1, desc: 'Dinheiro'},
            {value: 2, desc: 'Cartão  de Crédito'},
            {value: 3, desc: 'Cartão  de Débito'},
            {value: 3, desc: 'Boleto Bancário'},
            {value: 3, desc: 'Cheque'}
        ];

        vm.refreshCalendar = refreshCalendar;
        vm.atualizaDisponibilidade = atualizaDisponibilidade;
        vm.salvarReservaAvulsa = salvarReservaAvulsa;
        vm.openPrecosModal = openPrecosModal;
        vm.gotoDate = gotoDate;
        vm.showReservasModal = showReservasModal;
        vm.hidePagamentoReservaModal = hidePagamentoReservaModal;
        vm.showPagamentoReservaModal = showPagamentoReservaModal;
        vm.hideModalForm = hideModalForm;
        vm.showNovoContatoModal = showNovoContatoModal;
        vm.hideNovoContatoModal = hideNovoContatoModal;
        vm.salvarContato = salvarContato;
        vm.excluirReserva = excluirReserva;
        vm.salvarNovoPagamento = salvarNovoPagamento;
        vm.getFormaPagamentoDesc = getFormaPagamentoDesc;
        vm.showTrocaQuadraModal = showTrocaQuadraModal;
        vm.hideTrocaQuadraModal = hideTrocaQuadraModal;
        vm.trocarQuadra = trocarQuadra;
        vm.aplicaDesconto = aplicaDesconto;

        activate();

        function activate() {

            initModals();

            initCalendar();

            loadQuadras();
        }

        function initModals() {
            vm.novaReservaModal = $modal({
                scope: $scope,
                templateUrl: 'modalNovaReserva.html',
                animation: 'am-fade-and-slide-top',
                show: false
            });

            vm.trocaQuadraModal = $modal({
                scope: $scope,
                templateUrl: 'modalTrocaQuadra.html',
                animation: 'am-fade-and-slide-top',
                show: false
            });

            vm.novoContatoModal = $modal({
                scope: $scope,
                templateUrl: 'app/contatos/novo-contato.html',
                animation: 'am-fade-and-slide-top',
                show: false,
                container: 'body',
                backdrop: 'static'
            });

            vm.pagamentoReservaModal = $modal({
                scope: $scope,
                templateUrl: 'modalPagamentoReserva.html',
                animation: 'am-fade-and-slide-top',
                show: false,
                container: 'body',
                backdrop: 'static'
            });
        }

        function initCalendar() {
            vm.uiConfig = {
                calendar: {
                    lang: 'pt-br',
                    firstDay: 1,
                    height: $window.innerHeight - 120,
                    timeFormat: 'H(:mm)',
                    timezone: 'local',
                    header: {left: 'month agendaWeek agendaDay', center: 'title'},
                    defaultView: 'agendaWeek',
                    scrollTime: '17:00:00',
                    allDaySlot: false,
                    defaultEventMinutes: 60,
                    axisFormat: 'H:mm',  //,'h(:mm)tt',
                    dayClick: dayClick,
                    editable: true,
                    selectable: true,
                    selectHelper: true,
                    ignoreTimezone: false,
                    unselectCancel: '.reservasForm',
                    eventResize: eventResize,
                    eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender,
                    viewRender: viewRender,
                    gotoDate: gotoDate
                }
            };
        }

        function loadQuadras() {
            _.forEach(vm.quadras, function (q) {
                vm.selecaoQuadras.push({
                    quadra: q,
                    ativa: true
                });
            });
        }

        function getReservas(start, end) {
            cfpLoadingBar.start();

            uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
            vm.reservas = reservasService.getFilteredArray(filterFunc, start, end);

            vm.reservas.$loaded(function () {
                cfpLoadingBar.complete();
            });

            vm.reservas.$watch(function (event) {
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEvents');
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', $('.Source').val());
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
            });
        }

        function filterFunc(rec) {
            var qdrs = _.pluck(_.filter(vm.selecaoQuadras, 'ativa', true), 'quadra');
            return _.some(qdrs, {'$id': rec.quadra});
        }

        function refreshCalendar() {
            var start = moment(uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').start._d)
                .add(uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').start
                ._d.getTimezoneOffset(), 'm')._d.getTime();
            var end = moment(uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').end._d)
                .add(uiCalendarConfig.calendars.reservasCalendar.fullCalendar('getView').end
                ._d.getTimezoneOffset(), 'm')._d.getTime();

            getReservas(start, end);
        }

        function viewRender(view, element) {
            var start = moment(view.start._d).add(view.start._d.getTimezoneOffset(), 'm')._d.getTime();
            var end = moment(view.end._d).add(view.end._d.getTimezoneOffset(), 'm')._d.getTime();
            getReservas(start, end);
        }

        function eventSelect(start, end, jsEvent, view) {

            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 350) ? 'bottom' : 'top';

            if (element.length > 0) {
                vm.popover = $popover(element, {
                    placement: placement,
                    title: '',
                    templateUrl: 'popupNovaReserva.html',
                    container: '#reservas',
                    autoClose: 1,
                    scope: $scope
                });
                vm.novaReserva = {
                    responsavel: {},
                    dataLabel: moment(start).format('ddd, DD [de] MMMM') + ', ' +
                    moment(start._d).format('HH:mm') + ' às ' + moment(end._d).format('HH:mm'),
                    start: start._d,
                    end: end._d,
                    placement: placement
                };

                if (vm.quadras.length === 1) {
                    vm.novaReserva.quadra = vm.quadras[0];
                    atualizaDisponibilidade();
                }

                vm.popover.$promise.then(vm.popover.show);
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
                vm.reservas.$save(reserva).then(function (ref) {
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
                vm.reservas.$save(reserva).then(function (ref) {
                    cfpLoadingBar.complete();
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('removeEventSource', vm.reservas);
                    uiCalendarConfig.calendars.reservasCalendar.fullCalendar('addEventSource', vm.reservas);
                    logger.success('Reserva editada com sucesso!');
                });
            }
        }

        function eventRender(event, element, view) {
            if (!event.tipo) {
                event.tipo = 1;
            }
            element.find('.fc-time').prepend('<img src=\'images/icons/tipo-' + event.tipo +
                '.png\' width=\'15\' height=\'15\' style=\'margin-right: 5px; margin-top: -4px;\'>');
            element.attr('class', element.attr('class') + ' ' +
                _.pluck(_.filter(vm.quadras, '$id', event.quadra), 'color'));
        }

        function eventClick(calEvent, jsEvent) {

            var color = _.result(_.find(vm.quadras, {'$id': calEvent.quadra}), 'color');

            vm.novaReserva = {
                id: calEvent.$id,
                quadra: _.find(vm.quadras, {$id: calEvent.quadra}),
                responsavel: _.find(vm.contatos, {$id: calEvent.responsavel}),
                dataLabel: moment(calEvent.start).format('ddd, DD [de] MMMM') + ', ' +
                moment(calEvent.start).format('HH:mm') + ' às ' +
                moment(calEvent.end).format('HH:mm'),
                start: moment(calEvent.start)._d,
                end: moment(calEvent.end)._d,
                saldoDevedor: calEvent.saldoDevedor,
                saldoQuitado: calEvent.saldoQuitado,
                status: getStatusReserva(calEvent),
                tipo: calEvent.tipo
            };

            atualizaDisponibilidade();

            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

            var prevPopover = document.getElementsByClassName('popover');
            if (prevPopover) {
                _.forEach(prevPopover, function (p) {
                    if (p !== undefined) {
                        p.parentNode.removeChild(p);
                    }
                });
            }
            $('.popover').remove();
            vm.popover = $popover(element, {
                placement: placement,
                title: '',
                templateUrl: 'popupReserva.html',
                container: '#reservas',
                autoClose: 1,
                scope: $scope,
            });
            vm.popover.$promise.then(vm.popover.show);
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
            vm.novaReserva.preco = _.find(vm.novaReserva.quadra.funcionamento, function (f) {
                return f.start <= moment(vm.novaReserva.start).format('HH:mm') &&
                    (f.end > f.start && f.end >= moment(vm.novaReserva.end).format('HH:mm') ||
                     f.end >= '00:00' && f.end <= '01:00') &&
                    f.dow === ('' + vm.novaReserva.start.getDay());
            });

            vm.horarioLivre = _.every(_.filter(vm.reservas, 'quadra', vm.novaReserva.quadra.$id), function (f) {
                return ((vm.novaReserva.start >= moment(f.end) || vm.novaReserva.end <= moment(f.start)) ||
                    vm.novaReserva.id === f.$id);
            });
        }

        function conflitoHorário(reserva) {
            return !_.every(_.filter(vm.reservas, 'quadra', reserva.quadra), function (f) {
                return ((reserva.start >= moment(f.end) || reserva.end <= moment(f.start)) ||
                    reserva.$id === f.$id);
            });
        }

        function salvarReservaAvulsa() {
            var reserva = {
                tipo: 1,
                quadra: vm.novaReserva.quadra.$id,
                start: vm.novaReserva.start.getTime(),
                end: vm.novaReserva.end.getTime(),
                responsavel: (vm.novaReserva.responsavel && vm.novaReserva.responsavel.$id) ? vm.novaReserva.responsavel.$id : null,
                title: (vm.novaReserva.responsavel && vm.novaReserva.responsavel.nome) ? vm.novaReserva.responsavel.nome : null,
                saldoDevedor: vm.novaReserva.preco ? vm.novaReserva.preco.precoAvulso : 0,
                saldoQuitado: 0
            };

            vm.reservas.$add(reserva).then(function (ref) {
                logger.success('Reserva criada com sucesso!');
                uiCalendarConfig.calendars.reservasCalendar.fullCalendar('unselect');
                vm.popover.hide();
            }, function (error) {
                logger.error(error, vm.reserva, 'Ops!');
            });
        }

        function excluirReserva(id) {
            vm.reservas.$remove(_.find(vm.reservas, {$id: id}));
        }

        function getStatusReserva(reserva) {
            var dataReserva = moment(reserva.end);
            var hoje = moment();

            if (reserva.saldoDevedor > 0 && reserva.saldoQuitado === 0 && dataReserva.diff(hoje) >= 0) {
                return {
                    desc: 'Agendado',
                    class: 'label-info'
                };
            }

            if (reserva.saldoDevedor === 0 && reserva.saldoQuitado > 0) {
                return {
                    desc: 'Pago',
                    class: 'label-success'
                };
            }

            if (reserva.saldoDevedor > 0 && reserva.saldoQuitado > 0) {
                return {
                    desc: 'Pago Parcialmente',
                    class: 'label-warning'
                };
            }

            if (dataReserva.diff(hoje) < 0) {
                return {
                    desc: 'Pgto. Atrasado',
                    class: 'label-danger'
                };
            }
        }

        function openPrecosModal(q) {
            $modal({
                scope: $scope,
                controllerAs: 'vm',
                controller: 'PrecosReadOnlyCtrl',
                templateUrl: 'app/arena/precos/precos-readonly.html',
                resolve: {
                    quadra: function () {
                        return {
                            id: q.$id,
                            color: q.color,
                            nome: q.nome
                        };
                    }
                }
            });
        }

        function showReservasModal() {
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.show);
        }

        function showTrocaQuadraModal() {
            vm.popoverPosition = $('.popover').attr('style');
            vm.trocaQuadraModal.$promise.then(vm.trocaQuadraModal.show);
        }

        function hideTrocaQuadraModal() {
            vm.trocaQuadraModal.$promise.then(vm.trocaQuadraModal.hide);
            vm.popover.hide();
            vm.popover.show();
            $('.popover').attr('style', vm.popoverPosition);
        }

        function showPagamentoReservaModal() {
            vm.novoPagamento = {
                data: new Date(),
                valor: vm.novaReserva.saldoDevedor,
                desconto: 0,
                formaPagamento: vm.formaPagamento[0]
            };

            financeiroService.getPagamentosReserva(vm.novaReserva.id).$loaded().then(function (data) {
                vm.pagamentos = data;
            });

            vm.popoverPosition = $('.popover').attr('style');
            vm.pagamentoReservaModal.$promise.then(vm.pagamentoReservaModal.show);
        }

        function getFormaPagamentoDesc(value) {
            return _.find(vm.formaPagamento, {'value': value}).desc;
        }

        function hidePagamentoReservaModal() {
            vm.pagamentoReservaModal.$promise.then(vm.pagamentoReservaModal.hide);
            vm.popover.hide();
            vm.popover.show();
            $('.popover').attr('style', vm.popoverPosition);
        }

        function showNovoContatoModal() {
            vm.popoverPosition = $('.popover').attr('style');
            vm.contatoSelecionado = {};
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function hideNovoContatoModal() {
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.hide);
            vm.popover.hide();
            vm.popover.show();
            $('.popover').attr('style', vm.popoverPosition);
        }

        function salvarContato() {
            contatosService.addNovoContato(vm.contatoSelecionado).then(function(val) {
                vm.novaReserva.responsavel = _.find(vm.contatos, {$id : val});
            });
            hideNovoContatoModal();
        }

        function hideModalForm() {
            vm.reservaRadio = 2;
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.hide);
        }

        function gotoDate(date) {
            uiCalendarConfig.calendars.reservasCalendar.fullCalendar('gotoDate', date);
        }

        function salvarNovoPagamento() {
            vm.novoPagamento.formaPagamento = vm.novoPagamento.formaPagamento.value;
            vm.novoPagamento.data = vm.novoPagamento.data.getTime();
            vm.pagamentos.$add(vm.novoPagamento).then(function () {
                var reserva = _.find(vm.reservas, {'$id': vm.novaReserva.id});
                if (reserva) {
                    if (reserva.saldoQuitado) {
                        reserva.saldoQuitado += (vm.novoPagamento.valor);
                    }
                    else {
                        reserva.saldoQuitado = (vm.novoPagamento.valor);
                    }

                    if (reserva.saldoDevedor &&
                        ((reserva.saldoDevedor - (vm.novoPagamento.valor + vm.novoPagamento.desconto)) >= 0)) {
                        reserva.saldoDevedor -= (vm.novoPagamento.valor + vm.novoPagamento.desconto);
                    }
                    else {
                        reserva.saldoDevedor = 0;
                    }

                    vm.novaReserva.saldoDevedor = reserva.saldoDevedor;
                    vm.novaReserva.saldoQuitado = reserva.saldoQuitado;
                    vm.novaReserva.status = getStatusReserva(reserva);

                    vm.reservas.$save(reserva).then(function () {
                        logger.success('Pagamento realizado com sucesso');
                        vm.novoPagamento = {
                            valor: vm.novaReserva.saldoDevedor,
                            desconto: 0,
                            formaPagamento: vm.formaPagamento[0],
                            data: new Date()
                        };
                    },
                        function (err) {
                            logger.error('Erro ao realizar pagamento. ' + err);
                        });
                }
            },
                function (err) {
                    logger.error('Erro ao realizar pagamento. ' + err);
                });
        }

        function trocarQuadra(quadra) {
            vm.novaReserva.quadra = quadra;
            var reserva = _.find(vm.reservas, {$id: vm.novaReserva.id});
            reserva.quadra = quadra.$id;
            vm.reservas.$save(reserva).then(function () {
                logger.success('Quadra alterada com sucesso!');
                hideTrocaQuadraModal();
            }, function () {
                logger.error('Erro ao alterar a quadra');
            });
        }

        function aplicaDesconto() {
            var reserva = _.find(vm.reservas, {'$id': vm.novaReserva.id});
            var dif = reserva.saldoDevedor - vm.novoPagamento.desconto;
            vm.novoPagamento.valor = dif < 0 ? 0 : dif;
        }
    }

})();
