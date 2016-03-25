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
                    // minTime: '10:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // maxTime: '24:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // businessHours: {
                    //     start: '10:00',
                    //     end: '24:00',
                    //     dow: [0, 1, 2, 3, 4, 5, 6]
                    // },
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

            vm.precosReadOnly = funcionamentoService.getPrecos(vm.quadra.id);

            vm.precosReadOnly.$watch(function(event) {
                vm.precoMaximo = _.max(vm.precosReadOnly, 'precoAvulso').precoAvulso;
                vm.precoMinino = _.min(vm.precosReadOnly, 'precoAvulso').precoAvulso;
                vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precosReadOnly);
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.precosReadOnly);
            });
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
