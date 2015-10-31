(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('ReservasCtrl', ReservasCtrl)
        .controller('ModalReservaCtrl', ModalReservaCtrl)   ;

    function ReservasCtrl($scope, quadraService, reservasService, contatosService, uiCalendarConfig, $uibModal ,Auth, $popover, blockUI){
    	var vm = this; 
        vm.quadras = quadraService.getQuadras();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.selecaoQuadras = [];
        vm.eventSources = [[]];
        vm.reservas = [];
        vm.uiConfig = {};
        vm.loadReservas = loadReservas;
        vm.atualizaDisponibilidade = atualizaDisponibilidade;
        vm.horarioLivre = false;
        vm.salvarReservaAvulsa = salvarReservaAvulsa;

        activate();

        function activate(){
            blockUI.start();
            vm.quadras.$loaded(loadQuadras); 

            vm.uiConfig = {
                calendar:{
                    minTime:'10:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    maxTime:'24:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    height: 'auto',
                    editable: true,
                    timeFormat: 'H(:mm)',
                    timezone:'local',
                    header:{ left:'month agendaWeek agendaDay',center: 'title'},
                    defaultView:'agendaWeek',
                    firstHour: 9,
                    allDaySlot: false,
                    defaultEventMinutes: 60,
                    axisFormat: 'H:mm',  //,'h(:mm)tt',
                    dayClick: dayClick,
                    editable: true,
                    selectable: true,
                    selectHelper: true,
                    unselectCancel: ".reservasForm",
                    //eventResize: eventResize,
                    //  eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender
                }
            };
        }

    	vm.logout = function() { Auth.$unauth(); };


        function loadQuadras(){
            _.forEach(vm.quadras, function(q){
                vm.selecaoQuadras.push({
                    quadra: q,
                    ativa: true
                });
            })
            blockUI.stop();
            loadReservas();
        }

        function loadReservas(){
            blockUI.start();
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.reservas);

            vm.reservas = reservasService.getFilteredArray(function(rec) {
                var qdrs = _.pluck(_.filter(vm.selecaoQuadras, 'ativa', true), 'quadra');

                return _.some(qdrs, { '$id': rec.quadra});
            });

            vm.reservas.$loaded(function() {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.reservas);
                blockUI.stop();
            }); 
        }

        function eventSelect(start, end, jsEvent, view){
            var element = $(jsEvent.target).closest('.fc-event');
            var popover = $popover(element, {
                placement: 'bottom',
                title:"",
                templateUrl: 'popupReserva.html',
                container: '#reservas',
                autoClose: 1, 
                scope: $scope
            });
            vm.novaReserva = {
                responsavel : {},
                quadra : vm.quadras[0],
                dataLabel : moment(start).format('ddd, DD [de] MMMM') + ", " + moment(start._d).format('HH:mm') + " às " + moment(end._d).format('HH:mm'),
                start : start._d,
                end : end._d
            }

            atualizaDisponibilidade();
            popover.$promise.then(popover.show);
        }

        function eventRender(event, element){
            element.attr("class" , element.attr("class") +  " " + _.pluck(_.filter(vm.quadras,'$id', event.quadra), 'color'));
            $popover(element, {
                placement: 'top',
                title:"Teste",
                contentTemplate: 'popupReserva.html',
                container: '#reservas   ',
                autoClose: 1, 
                scope: $scope
            });
        }
	
    	function eventClick(calEvent){
    	    //var pelada = _.find(vm.reservas , {'id' : calEvent.id });
    	    //vm.openNovaPeladaModal(pelada);
    	}
	
    	function dayClick(date, jsEvent, view){
    	    if(view.name == 'month' ){
    	        uiCalendarConfig.calendars.myCalendar.fullCalendar('changeView', 'agendaDay');
    	        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', date);
    	    }
    	    //else{
    	    //    vm.openNovaPeladaModal(date);
    	    //}	
    	}

        function atualizaDisponibilidade(){
            vm.novaReserva.preco = _.find(vm.novaReserva.quadra.funcionamento  , function(f){
                return f.start <= moment(vm.novaReserva.start).format("HH:mm") && 
                        f.end >= moment(vm.novaReserva.end).format("HH:mm") && 
                        _.any(f.dow , function(n){return n == vm.novaReserva.start.getDay()})  
            });

            vm.horarioLivre = _.every(_.filter(vm.reservas, 'quadra', vm.novaReserva.quadra.$id), function(f){
                return  (vm.novaReserva.start >= moment(f.end) || vm.novaReserva.end <= moment(f.start));
            })
        }

        function salvarReservaAvulsa(){
            vm.reservas.$add({
                tipo : 1,
                quadra: vm.novaReserva.quadra.$id,
                start : vm.novaReserva.start.getTime(),
                end : vm.novaReserva.end.getTime(),
                responsavel : vm.novaReserva.responsavel.$id
            }).then(function(ref) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.reservas);
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.reservas);
                uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
            });
        }
	
    	vm.openNovaPeladaModal = function(date) {
    	    var modalInstance = $uibModal.open({
    	        	animation: true,
    	        	templateUrl: 'modalPelada.html',
    	        	controller: 'ModalReservaCtrl',
    	        	controllerAs:'vm',
    	        	resolve: {
    	        	  data: function () {
    	        	    return {
    	        	        title : "Nova Pelada",
    	        	        date : date,
    	        	    }
    	        	}
    	    	}
    		});
	
    	  	modalInstance.result.then(function (selectedItem) {
    	  		}, function () {
    	  	});
  		};
    }

    function ModalReservaCtrl($scope, $modalInstance, data, quadraFactory, peladaFactory){
    	var vm = this;   

    	vm.quadras = quadraFactory('-K1BcDhprlXkXEo18kbq');
	
    	vm.quadras.$loaded(function() {
    	    vm.reservaRadio = 1;
    	    vm.title = data.title;
    	    vm.date = data.date._d;
    	    vm.duracao =  1;
    	    vm.quadraSelecionada = vm.quadras[0];
    	    vm.getPreco();
    	});
	
        vm.diasSemana = [
            {dia: 0, ativo:false},
            {dia: 1, ativo:false},
            {dia: 2, ativo:false},
            {dia: 3, ativo:false},
            {dia: 4, ativo:false},
            {dia: 5, ativo:false},
            {dia: 6, ativo:false} 
        ];
    	
	
    	vm.getPreco = function(){
    	    vm.funcionamento =  _.find(vm.quadraSelecionada.funcionamento , function(f){
    	        return f.start <= moment(vm.date).format("HH:mm") && 
    	                f.end >= moment(vm.date).add(vm.duracao,'hours').format("HH:mm") && 
    	                _.any(f.dow , function(n){return n==vm.date.getDay()})  
    	    });
    	}
    	
    	vm.salvar = function () {
	
	
	
    	    peladaFactory('-K1BcDhprlXkXEo18kbq').avulsas.$add({
    	        tipo: vm.reservaRadio,
    	        quadra: vm.quadraSelecionada.$id,
    	        start: moment(vm.date).format('YYYY-MM-DDTHH:mm:ss'),
    	        end:  moment(vm.date).add(vm.duracao,'hours').format('YYYY-MM-DDTHH:mm:ss'),
    	        title: vm.quadraSelecionada.nome
    	    });
	
    	    $modalInstance.close();
    	};
	
    	vm.cancel = function () {
    	    $modalInstance.dismiss('cancel');
    	};
	
	
    	vm.openDatepicker = function($event, opened) {
    	    $event.preventDefault();
    	    $event.stopPropagation();
    	
    	    $scope[opened] = true;
    	};
    }

})();