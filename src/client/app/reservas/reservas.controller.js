(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('ReservasCtrl', ReservasCtrl)
        .controller('ModalReservaCtrl', ModalReservaCtrl)   ;

    function ReservasCtrl(uiCalendarConfig, $uibModal, peladaFactory ,Auth){
    	var vm = this; 

    	vm.logout = function() { Auth.$unauth(); };
	
    	vm.peladas = peladaFactory('cesar');
	
    	vm.eventSources = [[]];
	
    	vm.peladas.avulsas.$loaded(function() {
    	    vm.eventSources.push({
    	        events: vm.peladas.avulsas,
    	        color : 'red'
    	    });
    	});    
	
    	vm.peladas.escolinhas.$loaded(function(){
    	    vm.eventSources.push({
    	        events: vm.peladas.escolinhas,
    	        color : 'green'
    	    });
    	});
	
    	vm.peladas.mensalistas.$loaded(function(){
    	    vm.eventSources.push({
    	        events: vm.peladas.mensalistas,
    	        color : 'blue'
    	    });
    	});
	
    	vm.uiConfig = {
    	  calendar:{
    	    minTime:'10:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    	    maxTime:'24:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    	    height: 'auto',
    	    editable: true,
    	    timeFormat: 'H(:mm)',
    	    timezone:'local',
    	    header:{
    	        left:'month agendaWeek agendaDay',
    	        center: 'title'
    	    },
    	    defaultView:'agendaWeek',
    	    firstHour: 9,
    	    allDaySlot: false,
    	    defaultEventMinutes: 60,
    	    axisFormat: 'H:mm',  //,'h(:mm)tt',
    	    dayClick: dayClick,
    	    eventClick: eventClick,
    	    }
    	};
	
    	function eventClick(calEvent){
    	    var pelada = _.find(vm.peladas , {'id' : calEvent.id });
    	    vm.openNovaPeladaModal(pelada);
    	}
	
    	function dayClick(date, jsEvent, view){
    	    if(view.name == 'month' ){
    	        uiCalendarConfig.calendars.myCalendar.fullCalendar('changeView', 'agendaDay');
    	        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', date);
    	    }
    	    else{
    	        vm.openNovaPeladaModal(date);
    	    }
	
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

    	vm.quadras = quadraFactory('cesar');
	
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
	
	
	
    	    peladaFactory('cesar').avulsas.$add({
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