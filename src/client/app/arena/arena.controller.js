(function() {
    'use strict';

    angular
        .module('app.arena')
        .controller('ArenaCtr', ArenaCtr)
        .controller('QuadraCtrl' , QuadraCtrl)
        .controller('FuncionamentoCtrl', FuncionamentoCtrl)
        .controller('ModalPrecoCtrl', ModalPrecoCtrl);

    function ArenaCtr($scope, arenaFactory, quadraFactory, maps, currentPosition, $timeout){
        arenaFactory('cesar').$bindTo($scope, "arena").then(function() {
          activate();
        });
    
        $scope.map = {
            center: {
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude
            },
            zoom:15
        };
    
        $scope.marker = {
            id: 1,
            coords: {
                latitude: $scope.map.center.latitude,
                longitude: $scope.map.center.longitude
            },
           //options:{
           //    title: $scope.arena.endereco
           //}
        };
    
        $scope.searchbox = {
            template:'searchbox.tpl.html',
          options: {
            autocomplete:true,
          },
          events: {
            place_changed: function (autocomplete){
                
              var place = autocomplete.getPlace()
              $scope.arena.endereco = place.name;
    
              if (place.address_components) {
                $scope.map.center = {
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng(),
                };
    
                $scope.marker = {
                    id: 1,
                    coords: {
                        latitude: $scope.map.center.latitude,
                        longitude: $scope.map.center.longitude
                    },
                    options:{
                        title: $scope.arena.endereco
                    }
                };
    
              } 
              else {
                refreshMap();
              }
              $scope.arena.coords = {
                latitude: $scope.map.center.latitude,
                longitude: $scope.map.center.longitude
              }
            }
          }
        };
    
        function activate(){
            if($scope.arena.endereco){
                refreshMap();
            }
        }
    
        function refreshMap(){
            var geocoder = new maps.Geocoder();
            geocoder.geocode({address : $scope.arena.endereco}, function(result){
                if(result.length > 0) {
                    var addrLocation = result[0].geometry.location;
                    $timeout(function(){
                        $scope.map.center = {
                            latitude: addrLocation.lat(),
                            longitude: addrLocation.lng()
                        };
    
                        $scope.marker = {
                            id: 1,
                            coords: {
                                latitude: $scope.map.center.latitude,
                                longitude: $scope.map.center.longitude
                            },
                            options:{
                                title: $scope.arena.endereco
                            }
                        };
    
                    }, 0);
    
                }
            });
        }
    }

    function QuadraCtrl(repository){
        var vm = this;
    
        vm.novaQuadra = false;   
        vm.listaVazia = false;
        vm.quadras = repository.getQuadras();
        vm.originalRow = {};
        vm.addQuadra = addQuadra;
        vm.cancel = cancel;

        activate();

        function activate(){
            vm.quadras.$loaded(function() {
                if (vm.quadras.length === 0) {
                     vm.listaVazia = true;
                    }
            }); 
        }
    
        function addQuadra() {
            vm.quadras.$add({
                nome: vm.nome,
                capacidade: vm.capacidade,
                tipo: vm.tipo,
            });
    
            vm.nome = "";
            vm.capacidade = "";
            vm.tipo = "";
    
            vm.novaQuadra = !vm.novaQuadra
        };

        function cancel(){
            vm.nome = "";
            vm.capacidade = "";
            vm.tipo = "";
    
            vm.novaQuadra = !vm.novaQuadra
        }             
    }
    
    function FuncionamentoCtrl(uiCalendarConfig, $uibModal, repository, blockUI){
        var vm = this;

        vm.precos = [];
        vm.eventSources = [[]];
        vm.openModalPreco = openModalPreco;
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.uiConfig = {
            calendar:{
                minTime:'10:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                maxTime:'24:00',//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                businessHours : { start:'10:00', end: '24:00', dow: [0, 1, 2, 3, 4,5,6 ]},
                height: 'auto',
                timeFormat: 'H(:mm)',
                header:false,
                defaultView:'agendaWeek',
                firstHour: 9,
                allDaySlot: false,
                timezone:'local',
                axisFormat: 'H:mm', 
                columnFormat: { week: 'dddd'},
                editable: true,
                eventOverlap :false,
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

        var quadraId = '-K-6yCu_ALiqSYVYHDZP';

        activate();

        function activate(){
            blockUI.start();
            vm.precos = repository.getPrecos(quadraId);

            vm.precos.$loaded(function() {
                vm.eventSources.push(vm.precos);
        
                vm.precoMaximo = _.max(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMinino = _.min(vm.precos, 'precoAvulso').precoAvulso;
                vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;
                blockUI.stop();
            });    
        }

        function eventResize(event, delta, revertFunc){
            blockUI.start();
            var preco = _.find(vm.precos , {$id: event.$id});
            preco.end = moment(preco.end , "HH:mm").add(delta._milliseconds, 'milliseconds').format("HH:mm");
            vm.precos.$save(preco).then(function(ref) {
                blockUI.stop();
            });      
        }

        function eventDrop(event, delta, revertFunc){
            blockUI.start();
            var preco = _.find(vm.precos , {$id: event.$id});
            preco.start =  moment(preco.start , "HH:mm").add(delta._milliseconds, 'milliseconds').format("HH:mm");
            preco.end = moment(preco.end , "HH:mm").add(delta._milliseconds, 'milliseconds').format("HH:mm");
            preco.dow = moment(preco.dow[0] , "d").add(delta._days, 'days').format('d');
            vm.precos.$save(preco).then(function(ref) {
                blockUI.stop();
            }); 
        }

        function eventSelect(start, end){
            if(end._d.getDate() != start._d.getDate()){
                uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
            }
            else{
                var eventData = {
                    id: Math.round(Math.random() * 100000000),
                    start:  moment(start._d).format('HH:mm'),
                    end:  moment(end._d).format('HH:mm'),
                    dow: [ start._d.getDay() ]
                };
                uiCalendarConfig.calendars.myCalendar.fullCalendar('renderEvent', eventData, true);    
                vm.openModalPreco(eventData);  
            }
        }

        function eventClick(calEvent, jsEvent, view){

            vm.openModalPreco(_.find(vm.precos , {$id: calEvent.$id}), true);
        }

        function eventRender(event, element){
            var barato = Math.abs(event.precoAvulso - vm.precoMinino);
            var medio = Math.abs(event.precoAvulso - vm.precoMedio);
            var caro = Math.abs(event.precoAvulso - vm.precoMaximo);
            event.id = event.$id;
    
            element.css('color', '#fff');
            element.css('border-radius', '4px');
            element.css('font-weight', 'bold');
            element.css('margin-top', '2px');
    
            if(barato < medio && barato < caro){
                element.css('background-color', '#01bfac');
            }
            else if(medio < barato && medio < caro){
                element.css('background-color', '#009587');
            }
            else{
                element.css('background-color', '#017c70');
            } 
        }

        function isValidPrice(eventData, end, dow){
            return _.every(dow , function(d){
                return _.every(vm.precos, function(f){
                    return f.$id != eventData.$id || f.dow[0] != d || (eventData.start >= f.end || eventData.end <= f.start );
                });
           })
        }
    
        function openModalPreco(eventData, edicao) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modalPreco.html',
                controller: 'ModalPrecoCtrl',
                backdrop: 'static',
                keyboard: false,
                controllerAs:'vm',
                resolve: {
                  data: function () {
                    return {
                        edicao : edicao,
                        eventData : eventData
                        }
                    }
                }
            });
    
            modalInstance.result.then(function (data) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents', [data.id]);
                
                if(isValidPrice(data.eventData, data.dow)){
                    if(data.edicao){
                        var preco = _.find(vm.precos , {$id: data.eventData.$id});
                        preco.start = data.eventData.start;
                        preco.end = data.eventData.end;
                        preco.precoAvulso = data.eventData.precoAvulso;
                        preco.precoMensalista = data.eventData.precoMensalista;
                        preco.title = data.eventData.title;

                        vm.precos.$save(preco).then(function(ref) {
                            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEventSource', vm.precos);
                            uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', vm.precos);
                        });      
                    }
                    else{
                        _.forEach(data.dow, function(d) {
                            data.eventData.dow = [d];
                            vm.precos.$add(data.eventData);
                        });
                    }
                }
                else
                    alert("erro!!");
    
            }, function (data) {
                if(!data.edicao)
                    uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents', [data.id]);
            });
        }
    }

    function ModalPrecoCtrl($modalInstance, data){
        var vm = this;   

        vm.edicao = data.edicao;
        vm.eventData = {};
        vm.diasSemana = [];
        vm.salvar = salvar;
        vm.cancel = cancel;
        vm.idProvisorio = data.eventData.id

        activate();

        function activate(){

            vm.eventData = {
                $id : data.eventData.$id,
                start : data.eventData.start,
                end : data.eventData.end,
                precoAvulso : data.eventData.precoAvulso,
                precoMensalista : data.eventData.precoMensalista,
                dow: [],
                title :""
            }

            if(vm.edicao)
                vm.title = "Editar Preço";
            else
                vm.title = "Novo Preço";

            vm.diasSemana = [
                {dia: 0, ativo:false},
                {dia: 1, ativo:false},
                {dia: 2, ativo:false},
                {dia: 3, ativo:false},
                {dia: 4, ativo:false},
                {dia: 5, ativo:false},
                {dia: 6, ativo:false} 
            ];
            vm.diasSemana[data.eventData.dow[0]].ativo = true;
        }

        function salvar(){
            vm.eventData.title = "A:  R$ " + vm.eventData.precoAvulso + "  |  " + "M: R$ " + vm.eventData.precoMensalista;
            $modalInstance.close({
                id : vm.idProvisorio,
                eventData : vm.eventData, 
                dow:_.pluck( _.filter(vm.diasSemana , {'ativo' : true}) , 'dia'), 
                edicao : vm.edicao
            });
        }

        function cancel(){
            $modalInstance.dismiss({
                id : vm.idProvisorio, 
                edicao : vm.edicao
            });
        }
    }
    
})();






