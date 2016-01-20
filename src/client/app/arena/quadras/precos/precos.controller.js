/*global $:false */
(function() {
    'use strict';
    angular
    .module('app.arena')
    .controller('PrecosCtrl', PrecosCtrl);
    PrecosCtrl.$inject = ['$scope', 'quadra' , 'funcionamentoService', 'uiCalendarConfig'  , '$popover' , 'blockUI'];
    /* @ngInject */
    function PrecosCtrl($scope, quadra, funcionamentoService, uiCalendarConfig, $popover , blockUI) {
        var vm = this;

        vm.precos = [];
        vm.eventSources = [[]];
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.salvarNovoPreco = salvarNovoPreco;
        vm.uiConfig = {};

        activate();

        function activate() {

            vm.uiConfig = {
                calendar: {
                    minTime: '10:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    maxTime: '24:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    businessHours: {
                        start: '10:00',
                        end: '24:00',
                        dow: [0, 1, 2, 3, 4, 5, 6]
                    },
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
                    viewRender : viewRender,
                    eventResize: eventResize,
                    eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender,
                    unselectCancel: '.precoForm',
                }
            };
        }

        function getPrecos() {
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precos);

            vm.precos = funcionamentoService.getPrecos(quadra.id);

            vm.precos.$watch(function(event) {
                vm.precoMaximo = _.max(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMinino = _.min(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precos);
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.precos);
            });
        }

        function viewRender(view, element) {
            getPrecos();
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

        function eventSelect(start, end, jsEvent, view) {
            var element = $(jsEvent.target).closest('.fc-event');
            var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

            var popover = $popover(element, {
                placement: placement,
                title:'',
                templateUrl: 'app/arena/quadras/precos/novo-preco.html',
                container: '#mdlPreco',
                autoClose: 1,
                scope: $scope
            });

            vm.novoPreco = {
                start : moment(start._d).format('HH:mm'),
                end : moment(end._d).format('HH:mm'),
                dow: start._d.getDay().toString(),
                precoAvulso : '',
                precoMensalista : ''
            };
            vm.dataLabel = moment(start).format('ddd') + ' de ' +
            moment(start._d).format('HH:mm') + ' às ' + moment(end._d).format('HH:mm');

            popover.$promise.then(popover.show);
        }

        function eventClick(calEvent, jsEvent, view) {
            var preco = _.find(vm.precos , {'$id' : calEvent.$id});
            vm.novoPreco = preco;

            var left =  jsEvent.pageX - $('.modal-dialog').css('margin-left').replace('px', '') -  ($('.popover').width() / 2) ;
            var top = (jsEvent.pageY - 15);
            $('.popover').attr('style' , 'top: ' +
                top + 'px; left: ' +
                left + 'px; display: block; visibility: visible; background:#fff');
        }

        function eventRender(event, element) {
            var quadraColor = quadra.color;
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
                title:'',
                templateUrl: 'app/arena/quadras/precos/novo-preco.html',
                container: '#mdlPreco',
                autoClose: 1,
                scope: $scope
            });
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

        function salvarNovoPreco() {
            vm.novoPreco.title = 'A:  R$ ' +
            vm.novoPreco.precoAvulso +
            '  |  ' + 'M: R$ ' + vm.novoPreco.precoMensalista;

            if (vm.novoPreco.$id) {
                vm.precos.$save(vm.novoPreco);
            }
            else {
                vm.precos.$add(vm.novoPreco).then(function(ref) {
                    uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
                });
            }
        }

    }
})();
