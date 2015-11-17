var app = angular.module('app.core');

app.factory('FilteredArray', function($firebaseArray) {
    function FilteredArray(ref, filterFn) {
        this.filterFn = filterFn;
        return $firebaseArray.call(this, ref);
    }
    FilteredArray.prototype.$$added = function(snap) {
        var rec = $firebaseArray.prototype.$$added.call(this, snap);
        if (!this.filterFn || this.filterFn(rec)) {
            return rec;
        }
    };
    return $firebaseArray.$extend(FilteredArray);
});

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('arenaService', arenaService)
        .factory('quadraService' , quadraService)
        .factory('funcionamentoService' , funcionamentoService)
        .factory('reservasService', reservasService)
        .factory('contatosService', contatosService)
        .factory('repository', repository)
        .factory('peladaFactory', peladaFactory)
        .factory('quadraFactory', quadraFactory)
        .factory('arenaFactory', arenaFactory);

    function cache($cacheFactory) {
        return $cacheFactory('appCache');
    }

    function quadraService(Ref, $firebaseArray, $firebaseObject, subdomainService) {
        var service = {
            getRef: getRef,
            //queryQuadra: queryQuadra,

            getQuadra: getQuadra,
            getQuadras: getQuadras,
            getQuadrasArena : getQuadrasArena,
            getQuadrasLight : getQuadrasLight
        };

        return service;

        function getRef() {
            return Ref.child('quadras');
        }

        function getQuadra(id) {
            return $firebaseObject(getRef().child(subdomainService.arena + '/' + id));
        }

        function getQuadras() {
            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function getQuadrasArena() {
            var joinedRef = new Firebase.util.NormalizedCollection(
              [Ref.child('/quadras/' + subdomainService.arena + ''), 'quadra'],
              [Ref.child('/arenas/' + subdomainService.arena + '/quadras'), 'arena']
            ).select(
              'quadra.nome',
              'quadra.color',
              'quadra.tipo',
              'quadra.capacidade',
              'arena.$value',
              {'key':'arena.$value','alias':'fkArena'}
            ).ref();

            return $firebaseArray(joinedRef);
        }

        function getQuadrasLight() {
            var joinedRef = new Firebase.util.NormalizedCollection(
              [Ref.child('/quadras/' + subdomainService.arena + ''), 'quadra'],
              [Ref.child('/arenas/' + subdomainService.arena + '/quadras'), 'arena']
            ).select(
              'quadra.nome',
              'quadra.color',
              'arena.$value'
            ).ref();

            return $firebaseArray(joinedRef);
        }
    }

    function arenaService(Ref, $firebaseArray, $firebaseObject, subdomainService) {

        var service = {
            getRef : getRef,

            getArena : getArena,
            getQuadras : getQuadras,

            isValidArenaName: isValidArenaName
        };

        return service;

        function getRef() {
            return Ref.child('arenas');
        }

        function getArena() {
            return $firebaseObject(getRef().child(subdomainService.arena));
        }

        function getQuadras() {
            return $firebaseArray(getRef().child(subdomainService.arena + '/quadras'));
        }

        function isValidArenaName(arenaName) {
            return getRef().child(arenaName).once('value', function(snap) {
                return snap.val() === null;
            });
        }
    }

    function funcionamentoService(Ref,$firebaseArray, $firebaseObject, subdomainService) {
        var service = {
            getPreco: getPreco,
            getPrecos: getPrecos,
        };

        return service;

        function getPreco(quadraId, id) {
            return $firebaseObject(
                Ref.child('quadras/' + subdomainService.arena + '/' + quadraId + '/funcionamento/' + id)
            );
        }

        function getPrecos(quadraId) {
            return $firebaseArray(Ref.child('quadras/' + subdomainService.arena + '/' + quadraId + '/funcionamento/'));
        }
    }

    function reservasService(Ref, $firebaseArray, $firebaseObject, subdomainService, FilteredArray) {
        var service = {
            getRef: getRef,

            getAll : getAll,
            getFilteredArray : getFilteredArray,
            getReserva: getReserva,
            getByQuadra : getByQuadra,
            getByType : getByType,

            getAvulsas : getAvulsas,
            getMensalistas : getMensalistas,
            getEscolinhas : getEscolinhas
        };

        return service;

        function getRef() {
            return Ref.child('reservas');
        }

        function getFilteredArray(fn) {
            var ref = getRef().child(subdomainService.arena);
            return new FilteredArray(ref, fn);
        }

        function getAll() {
            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function getReserva(id) {
            return $firebaseArray(getRef().child(subdomainService.arena + '/' + id));
        }

        function getByQuadra(quadraId) {
            var ref = getRef().child(subdomainService.arena).orderByChild('quadra').startAt(quadraId).endAt(quadraId);
            return $firebaseArray(ref);
        }

        function getByType() {
            var refAvulsas = new Firebase('https://pelapp.firebaseio.com/reservas/' +
                subdomainService.arena).orderByChild('tipo').equalTo(1);
            var refMensalistas = new Firebase('https://pelapp.firebaseio.com/reservas/' +
                subdomainService.arena).orderByChild('tipo').equalTo(2);
            var refEscolinha = new Firebase('https://pelapp.firebaseio.com/reservas/' +
                subdomainService.arena).orderByChild('tipo').equalTo(3);

            return {
                avulsas: $firebaseArray(refAvulsas),
                mensalistas: $firebaseArray(refMensalistas),
                escolinhas: $firebaseArray(refEscolinha)
            };
        }

        function getAvulsas() {
            var refAvulsas = getRef().child(subdomainService.arena).orderByChild('tipo').equalTo(1);
            return $firebaseArray(refAvulsas);
        }

        function getMensalistas() {
            var refMensalistas = getRef().child(subdomainService.arena).orderByChild('tipo').equalTo(2);
            return $firebaseArray(refMensalistas);
        }

        function getEscolinhas() {
            var refEscolinha = getRef().child(subdomainService.arena).orderByChild('tipo').equalTo(3);
            return $firebaseArray(refEscolinha);
        }
    }

    function contatosService(Ref, $firebaseArray, $firebaseObject, subdomainService, FilteredArray) {
        var service = {
            getRef : getRef,
            getContato: getContato,
            getContatos: getContatos,
            searchContatos: searchContatos,
            getContatosArena: getContatosArena,
            getContatosArenaLight : getContatosArenaLight
        };

        return service;

        function getRef() {
            return Ref.child('contatos');
        }

        function getContato(id) {
            return $firebaseObject(getRef().child(subdomainService.arena + '/' + id));
        }

        function getContatos() {
            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function searchContatos(fn) {
            var ref = getRef().child(subdomainService.arena);
            return new FilteredArray(ref, fn);
        }

        function getContatosArena() {
            var norm = new Firebase.util.NormalizedCollection(
              [Ref.child('/perfil/'), 'perfil'],
              [Ref.child('/arenas/' + subdomainService.arena + '/contatos'), 'arena']
            ).select(
              'perfil.nome',
              'perfil.telefone',
              'perfil.email',
              'perfil.fotoPerfil',
              'arena.$value',
              {'key':'arena.$value','alias':'fkArena'}
            );

            norm.filter(
                function(data, key, priority) { return data.fkArena === true; }
            );

            var joinedRef = norm.ref();

            return $firebaseArray(joinedRef);
        }

        function getContatosArenaLight() {
            var norm = new Firebase.util.NormalizedCollection(
              [Ref.child('/perfil/'), 'perfil'],
              [Ref.child('/arenas/' + subdomainService.arena + '/contatos'), 'arena']
            ).select(
              'perfil.nome',
              'arena.$value',
              {'key':'arena.$value','alias':'fkArena'}
            );

            norm.filter(
                function(data, key, priority) { return data.fkArena === true; }
            );

            var joinedRef = norm.ref();

            return $firebaseArray(joinedRef);
        }
    }

    function repository(Ref, $firebaseArray, $firebaseObject, subdomainService) {
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

        function getArena() {
            return $firebaseObject(Ref.child('arenas/' + subdomainService.arena));
        }

        function getQuadra(id) {
            return $firebaseObject(Ref.child('quadras/' + subdomainService.arena + '/' + id));
        }

        function getQuadras() {
            return $firebaseArray(Ref.child('quadras/' + subdomainService.arena));
        }

        function getReserva(id) {
            return $firebaseObject(Ref.child('pelada/' + subdomainService.arena + '/' + id));
        }

        function getReservas() {
            return $firebaseArray(Ref.child('pelada/' + subdomainService.arena));
        }

        function getReservasAvulsas() {
            return $firebaseArray(Ref.child('pelada/' + subdomainService.arena).orderByChild('tipo').equalTo(1));
        }

        function getReservasMensais() {
            return $firebaseArray(Ref.child('pelada/' + subdomainService.arena).orderByChild('tipo').equalTo(2));
        }

        function getReservasEscola() {
            return $firebaseArray(Ref.child('pelada/' + subdomainService.arena).orderByChild('tipo').equalTo(3));
        }

        function getPreco(quadraId, id) {
            return $firebaseObject(
                Ref.child('quadras/' + subdomainService.arena + '/' + quadraId + '/funcionamento/' + id));
        }

        function getPrecos(quadraId) {
            return $firebaseArray(Ref.child('quadras/' + subdomainService.arena + '/' + quadraId + '/funcionamento/'));
        }
    }

    function peladaFactory($firebaseArray) {
        return function(arena) {
            var refAvulsas = new Firebase('https://pelapp.firebaseio.com/reservas/' + arena)
            .orderByChild('tipo').equalTo(1);
            var refMensalistas = new Firebase('https://pelapp.firebaseio.com/reservas/' + arena)
            .orderByChild('tipo').equalTo(2);
            var refEscolinha = new Firebase('https://pelapp.firebaseio.com/reservas/' + arena)
            .orderByChild('tipo').equalTo(3);

            return {
                avulsas: $firebaseArray(refAvulsas),
                mensalistas: $firebaseArray(refMensalistas),
                escolinhas: $firebaseArray(refEscolinha)
            };
        };
    }

    function quadraFactory($firebaseArray) {
        return function(arena) {
            var ref = new Firebase('https://pelapp.firebaseio.com/quadras/' + arena);

            return $firebaseArray(ref);
        };
    }

    function arenaFactory($firebaseObject) {
        return function(arena) {
            var ref = new Firebase('https://pelapp.firebaseio.com/arenas/cesar');

            return $firebaseObject(ref);
        };
    }

})();
