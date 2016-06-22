(function() {
    'use strict';

    angular
    .module('app.arena')
    .controller('FuncionamentoCtrl', FuncionamentoCtrl);

    FuncionamentoCtrl.$inject = ['quadraService' , 'funcionamentoService' ,'uiCalendarConfig', 'blockUI'];

    function FuncionamentoCtrl(quadraService, funcionamentoService, uiCalendarConfig, blockUI) {
        var vm = this;

        vm.quadras = [];
        vm.precos = [];
        vm.quadraSelecionada = {};
        vm.eventSources = [[]];
        vm.selectQuadra = selectQuadra;
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.uiConfig = {
            calendar: {
                height: 'auto',
                timeFormat: 'H(:mm)',
                header: false,
                defaultView: 'agendaWeek',
                firstHour: 9,
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
                eventResize: eventResize,
                eventDrop: eventDrop,
                select: eventSelect,
                eventClick: eventClick,
                eventRender: eventRender
            }
        };

        activate();

        function activate() {
            vm.quadras = quadraService.getQuadras();
        }

        function selectQuadra(id) {
            vm.quadraSelecionada  = id;
            blockUI.start();
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precos);
            vm.precos = funcionamentoService.getPrecos(id);

            vm.precos.$loaded(function() {

                vm.precoMaximo = _.max(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMinino = _.min(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.precos);

                blockUI.stop();
            });
        }

        function eventResize(event, delta, revertFunc) {
            blockUI.start();
            var preco = _.find(vm.precos, {
                $id: event.$id
            });
            preco.end = moment(preco.end, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            vm.precos.$save(preco).then(function(ref) {
                blockUI.stop();
            });
        }

        function eventDrop(event, delta, revertFunc) {
            blockUI.start();
            var preco = _.find(vm.precos, {
                $id: event.$id
            });
            preco.start = moment(preco.start, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            preco.end = moment(preco.end, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            preco.dow = moment(preco.dow[0], 'd').add(delta._days, 'days').format('d');
            vm.precos.$save(preco).then(function(ref) {
                blockUI.stop();
            });
        }

        function eventSelect(start, end) {
            if (end._d.getDate() !== start._d.getDate()) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
            } else {
                var eventData = {
                    id: Math.round(Math.random() * 100000000),
                    start: moment(start._d).format('HH:mm'),
                    end: moment(end._d).format('HH:mm'),
                    dow: [start._d.getDay()]
                };
                uiCalendarConfig.calendars.myCalendar.fullCalendar('renderEvent', eventData, true);
                vm.openModalPreco(eventData);
            }
        }

        function eventClick(calEvent, jsEvent, view) {

            vm.openModalPreco(_.find(vm.precos, {
                $id: calEvent.$id
            }), true);
        }

        function eventRender(event, element) {
            var quadraColor = _.find(vm.quadras, '$id', vm.quadraSelecionada).color;
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
        }

        function isValidPrice(eventData, end, dow) {
            return _.every(dow, function(d) {
                return _.every(vm.precos, function(f) {
                    return f.$id !== eventData.$id ||
                    f.dow[0] !== d ||
                    (eventData.start >= f.end || eventData.end <= f.start);
                });
            });
        }
    }
})();
