(function () {
    'use strict';

    angular
        .module('app.core')
        .constant('ARENA', 'cesar')
        .factory('repository', repository)
        .factory('peladaFactory', peladaFactory)
        .factory('quadraFactory', quadraFactory)
        .factory('arenaFactory', arenaFactory);

    function repository(Ref, $firebaseArray , $firebaseObject , ARENA ){
        var service = {
            getArena: getArena,

            getQuadra: getQuadra,
            getQuadras: getQuadras,

            getReserva: getReserva,
            getReservas: getReservas,

            getPreco: getPreco,
            getPrecos: getPrecos,
        };

        return service;

        function getArena(){ return $firebaseObject(Ref.child('arenas/'+ARENA)); }

        function getQuadra(id){ return $firebaseObject(Ref.child('quadras/'+ARENA +'/'+id)); }
        function getQuadras(){ return $firebaseArray(Ref.child('quadras/'+ARENA)); }

        function getReserva(id){ return $firebaseObject(Ref.child('pelada/'+ARENA +'/'+id)); }
        function getReservas(){ return $firebaseArray(Ref.child('pelada/'+ARENA)); }
        function getReservasAvulsas(){ return $firebaseArray(Ref.child('pelada/'+ARENA).orderByChild("tipo").equalTo(1)); }
        function getReservasMensais(){ return $firebaseArray(Ref.child('pelada/'+ARENA).orderByChild("tipo").equalTo(2)); }
        function getReservasEscola(){ return $firebaseArray(Ref.child('pelada/'+ARENA).orderByChild("tipo").equalTo(3)); }

        function getPreco(quadraId, id){ return $firebaseObject(Ref.child('quadras/'+ARENA +'/'+ quadraId + '/funcionamento/' + id)); }
        function getPrecos(quadraId){return $firebaseArray(Ref.child('quadras/'+ARENA+'/'+ quadraId + '/funcionamento/'));}

    }

    function peladaFactory($firebaseArray){
        return function(arena){
            var refAvulsas = new Firebase("https://pelapp.firebaseio.com/pelada/" + arena ).orderByChild("tipo").equalTo(1);
            var refMensalistas = new Firebase("https://pelapp.firebaseio.com/pelada/" + arena ).orderByChild("tipo").equalTo(2);
            var refEscolinha = new Firebase("https://pelapp.firebaseio.com/pelada/" + arena ).orderByChild("tipo").equalTo(3);

            return{
                avulsas : $firebaseArray(refAvulsas),
                mensalistas : $firebaseArray(refMensalistas),
                escolinhas : $firebaseArray(refEscolinha)
            }
        }
    }

    function quadraFactory($firebaseArray){
        return function(arena){
            var ref = new Firebase("https://pelapp.firebaseio.com/quadras/" + arena);

            return $firebaseArray(ref);
        }
    }

    function arenaFactory($firebaseObject){
        return function(arena){
            var ref = new Firebase("https://pelapp.firebaseio.com/arenas/cesar");

            return $firebaseObject(ref);
        }
    }

})();
