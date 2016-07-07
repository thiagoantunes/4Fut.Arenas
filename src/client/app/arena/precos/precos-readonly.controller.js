/*global $:false */
(function() {
    'use strict';
    angular
    .module('app.arena')
    .controller('PrecosReadOnlyCtrl', PrecosReadOnlyCtrl);
    PrecosReadOnlyCtrl.$inject = ['$scope', 'quadra' , 'funcionamentoService', 'uiCalendarConfig'  ,'$window'];
    /* @ngInject */
    function PrecosReadOnlyCtrl($scope, quadra, funcionamentoService, uiCalendarConfig,  $window) {
        var vm = this;
        vm.quadra = quadra;
        vm.precosReadOnly = [];
        vm.eventSources = [[]];
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.uiConfig = {};

        activate();

        function activate() {

            vm.uiConfig = {
                calendar: {
                    lang:'pt-br',
                    firstDay: 1,
                    height: $window.innerHeight - 180,
                    timeFormat: 'H(:mm)',
                    header: false,
                    defaultView: 'agendaWeek',
                    scrollTime :  '09:00:00',
                    allDaySlot: false,
                    timezone: 'local',
                    axisFormat: 'H:mm',
                    columnFormat: {
                        week: 'dddd'
                    },
                    editable: false,
                    eventOverlap: false,
                    selectable: false,
                    selectOverlap: false,
                    selectHelper: true,
                    viewRender : viewRender,
                    eventRender: eventRender,
                    unselectCancel: '.precoForm',
                }
            };
        }

        function getPrecos() {
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precosReadOnly);

            vm.precosReadOnly = funcionamentoService.getPrecos(vm.quadra.id, mapPrecos);

            vm.precosReadOnly.$watch(function(event) {
                vm.precoMaximo = _.max(vm.precosReadOnly, 'precoAvulso').precoAvulso;
                vm.precoMinino = _.min(vm.precosReadOnly, 'precoAvulso').precoAvulso;
                vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precosReadOnly);
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.precosReadOnly);
            });
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

        function eventRender(event, element) {
            var quadraColor = vm.quadra.color;
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
    }
})();
