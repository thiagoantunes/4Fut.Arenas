/*global $:false */
(function () {
    'use strict';
    angular
        .module('app.arena')
        .controller('PrecosCtrl', PrecosCtrl);
    PrecosCtrl.$inject = [
        'idQuadra',
        '$scope',
        'quadraService',
        'funcionamentoService',
        'uiCalendarConfig',
        '$popover',
        'blockUI',
        '$window',
        'logger',
        '$modal'
    ];

    /* @ngInject */
    function PrecosCtrl(
        idQuadra,
        $scope,
        quadraService,
        funcionamentoService,
        uiCalendarConfig,
        $popover,
        blockUI,
        $window,
        logger,
        $modal) {
        var vm = this;

        vm.emptyList = false;
        vm.quadras = quadraService.getQuadras();
        vm.quadraSelecionada = {};
        vm.precos = [];
        vm.eventSources = [[]];
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.salvarNovoPreco = salvarNovoPreco;
        vm.salvarNovoPrecoModal = salvarNovoPrecoModal;
        vm.selecionaQuadra = selecionaQuadra;
        vm.showNovoPrecoModal = showNovoPrecoModal;
        vm.hideNovoPrecoModal = hideNovoPrecoModal;
        vm.uiConfig = {};

        activate();

        function activate() {

            vm.novoPrecoModal = $modal({
                scope: $scope,
                templateUrl: 'app/arena/precos/modal-novo-preco.html',
                animation: 'am-fade-and-slide-top',
                show: false
            });

            vm.quadras.$loaded()
                .then(function (q) {
                    if (q.length > 0) {
                        if (idQuadra) {
                            vm.quadraSelecionada = _.find(q, {$id: idQuadra});
                        }
                        else {
                            vm.quadraSelecionada = q[0];
                            getPrecos();
                        }
                    }
                    else {
                        vm.emptyList = true;
                    }
                })
                .catch(function (error) {
                    logger.error('Error:', error);
                });

            vm.uiConfig = {
                calendar: {
                    lang: 'pt-br',
                    height: 'auto',
                    timeFormat: 'H(:mm)',
                    header: false,
                    defaultView: 'agendaWeek',
                    scrollTime: '09:00:00',
                    allDaySlot: false,
                    timezone: 'local',
                    axisFormat: 'H:mm',
                    columnFormat: {
                        week: 'dddd'
                    },
                    editable: true,
                    eventOverlap: false,
                    selectable: true,
                    selectOverlap: false,
                    selectHelper: true,
                    viewRender: viewRender,
                    eventResize: eventResize,
                    eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender,
                    unselectCancel: '.precoForm',
                }
            };

            initDiasSemana();
        }

        function selecionaQuadra(id) {
            vm.quadraSelecionada = _.find(vm.quadras, {$id: id});
            getPrecos();
        }

        function getPrecos() {
            if (uiCalendarConfig.calendars.precoCalendar) {
                uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource', vm.precos);

                vm.precos = funcionamentoService.getPrecos(vm.quadraSelecionada.$id, mapPrecos);

                vm.precos.$watch(function (event) {
                    vm.precoMaximo = _.max(vm.precos, 'precoAvulso').precoAvulso;
                    vm.precoMinino = _.min(vm.precos, 'precoAvulso').precoAvulso;
                    vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEvents');
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource', $('.Source').val());
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('addEventSource', vm.precos);
                });
            }
        }

        function mapPrecos(val) {
            var daysToAdd = val.dow - new Date().getDay();
            var end = val.start > val.end ? moment(val.end, 'HH:mm').add(1, 'd') : moment(val.end, 'HH:mm');
            var start = moment(val.start, 'HH:mm');
            return {
                start: start.add(daysToAdd, 'd')._d.getTime(),
                end: end.add(daysToAdd, 'd')._d.getTime(),
                title: val.title,
                precoAvulso: val.precoAvulso,
                precoMensalista: val.precoMensalista,
                $id: val.$id,
                dayOfWeek: val.dow
            };
        }

        function viewRender(view, element) {
            getPrecos();
        }

        function eventResize(event, delta, revertFunc) {
            var preco = _.find(vm.precos, {
                $id: event.$id
            });
            var updData = {
                end: moment(preco.end).add(delta._milliseconds, 'milliseconds').format('HH:mm'),
                start: moment(preco.start).format('HH:mm'),
                dow: preco.dayOfWeek,
                quadra: vm.quadraSelecionada.$id,
                id: preco.$id
            };
            funcionamentoService.updateHorarioPreco(updData).then(function (ref) {
                logger.success('Preço editado com sucesso.');
                getPrecos();
            });
        }

        function eventDrop(event, delta, revertFunc) {
            var preco = _.find(vm.precos, {
                $id: event.$id
            });

            var updData = {
                start: moment(preco.start).add(delta._milliseconds, 'milliseconds').format('HH:mm'),
                end: moment(preco.end).add(delta._milliseconds, 'milliseconds').format('HH:mm'),
                dow: moment(preco.dayOfWeek[0], 'd').add(delta._days, 'days').format('d'),
                quadra: vm.quadraSelecionada.$id,
                id: preco.$id
            };

            funcionamentoService.updateHorarioPreco(updData).then(function (ref) {
                logger.success('Preço editado com sucesso.');
                getPrecos();
            });
        }

        function eventSelect(start, end, jsEvent, view) {
            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

            if (element.length > 0) {
                var popover = $popover(element, {
                    placement: placement,
                    title: '',
                    templateUrl: 'app/arena/precos/novo-preco.html',
                    container: '#precos',
                    autoClose: 1,
                    scope: $scope
                });

                vm.novoPreco = {
                    start: moment(start._d).format('HH:mm'),
                    end: moment(end._d).format('HH:mm'),
                    dow: start._d.getDay().toString(),
                    precoAvulso: '',
                    precoMensalista: ''
                };
                vm.dataLabel = moment(start).format('ddd') + ' de ' +
                    moment(start._d).format('HH:mm') + ' às ' + moment(end._d).format('HH:mm');

                popover.$promise.then(popover.show);
            }
        }

        function eventClick(calEvent, jsEvent, view) {
            var preco = _.find(vm.precos, {'$id': calEvent.$id});
            vm.novoPreco = preco;

            var left = jsEvent.pageX - ($('.popover').width() / 2);
            var top = (jsEvent.pageY);
            $('.popover').attr('style', 'top: ' +
                top + 'px; left: ' +
                left + 'px; display: block; visibility: visible; background:#fff');
        }

        function eventRender(event, element) {
            var quadraColor = vm.quadraSelecionada.color;
            var barato = Math.abs(event.precoAvulso - vm.precoMinino);
            var medio = Math.abs(event.precoAvulso - vm.precoMedio);
            var caro = Math.abs(event.precoAvulso - vm.precoMaximo);
            event.id = event.$id;

            element.css('color', '#fff');
            element.css('border-radius', '4px');
            element.css('font-weight', 'bold');
            element.css('margin-top', '2px');

            if (barato < medio && barato < caro) {
                element.context.classList.add(quadraColor + '-l');
            } else if (medio < barato && medio < caro) {
                element.context.classList.add(quadraColor);
            } else {
                element.context.classList.add(quadraColor + '-d');
            }

            $popover(element, {
                placement: 'bottom',
                title: '',
                templateUrl: 'app/arena/precos/novo-preco.html',
                container: 'body',
                autoClose: 1,
                scope: $scope
            });
        }

        function salvarNovoPreco() {
            vm.novoPreco.title = 'A:  R$ ' +
                vm.novoPreco.precoAvulso +
                '  |  ' + 'M: R$ ' + vm.novoPreco.precoMensalista;

            if (vm.novoPreco.$id) {
                var updData = {
                    precoAvulso: vm.novoPreco.precoAvulso,
                    precoMensalista: vm.novoPreco.precoMensalista,
                    quadra: vm.quadraSelecionada.$id,
                    id: vm.novoPreco.$id,
                    title: vm.novoPreco.title
                };
                funcionamentoService.updatePreco(updData).then(function (ref) {
                    logger.success('Preço editado com sucesso.');
                    getPrecos();
                });
            }
            else {

                uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource', vm.precos);
                vm.precos.$add(vm.novoPreco).then(function (ref) {
                    logger.success('Preço criado com sucesso.');
                    vm.novoPreco = {};
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('unselect');
                });
            }
        }

        function salvarNovoPrecoModal() {
            var dow = _.pluck(_.filter(vm.diasSemana, {
                'ativo': true
            }), 'dia');

            funcionamentoService.salvarNovoPreco(vm.novoPrecoModal, dow, vm.precos)
                .then(function () {
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('unselect');
                    logger.success('Preço criado com sucesso.');
                    hideNovoPrecoModal();
                    vm.novoPreco = {};
                },
                function (err) {
                    logger.error(err);
                });
        }

        function initDiasSemana() {
            vm.diasSemana = [
                {dia: 0, ativo: false},
                {dia: 1, ativo: false},
                {dia: 2, ativo: false},
                {dia: 3, ativo: false},
                {dia: 4, ativo: false},
                {dia: 5, ativo: false},
                {dia: 6, ativo: false}
            ];
        }

        function showNovoPrecoModal() {
            vm.novoPrecoModal.$promise.then(vm.novoPrecoModal.show);
        }

        function hideNovoPrecoModal() {
            vm.novoPrecoModal.$promise.then(vm.novoPrecoModal.hide);
        }

    }
})();
