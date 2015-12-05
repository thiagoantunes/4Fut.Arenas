

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('filteredArray', filteredArray)
        .factory('arenaService', arenaService)
        .factory('quadraService' , quadraService)
        .factory('funcionamentoService' , funcionamentoService)
        .factory('reservasService', reservasService)
        .factory('contatosService', contatosService)
        .factory('escolinhaService', escolinhaService);

    function filteredArray($firebaseArray) {
        function filteredArray(ref, filterFn) {
            this.filterFn = filterFn;
            return $firebaseArray.call(this, ref);
        }
        filteredArray.prototype.$$added = function(snap) {
            var rec = $firebaseArray.prototype.$$added.call(this, snap);
            if (!this.filterFn || this.filterFn(rec)) {
                return rec;
            }
        };
        return $firebaseArray.$extend(filteredArray);
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
              'quadra.coberta',
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

    function reservasService(Ref, $firebaseArray, $firebaseObject, subdomainService, filteredArray, $q) {
        var service = {
            getRef: getRef,

            getAll : getAll,
            getFilteredArray : getFilteredArray,
            getReserva: getReserva,

            verificaHorarioPeriodo: verificaHorarioPeriodo,
            verificaHorario : verificaHorario
        };

        return service;

        function getRef() {
            return Ref.child('reservas');
        }

        function getFilteredArray(fn, start, end) {
            var ref = getRef().child(subdomainService.arena).orderByChild('start').startAt(start).endAt(end);
            return new filteredArray(ref, fn);
        }

        function getAll() {
            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function getReserva(id) {
            return $firebaseArray(getRef().child(subdomainService.arena + '/' + id));
        }

        function verificaHorarioPeriodo(reserva){
            var deferred = $q.defer();

            var result = true;
            var ref = getRef().child(subdomainService.arena)
                .orderByChild('start').startAt(reserva.dataInicio).endAt(reserva.dataFim);

            ref.once('value', function(data) {
                _.forEach(data.val(), function(data){
                    var dow = moment(data.start)._d.getDay();
                    var start = moment(data.start).format('HHmm');
                    var end = moment(data.end).format('HHmm');
                    if(_.some(reserva.dow, dow) && ( ( reserva.start <= end <= reserva.end) || (reserva.start <= start <= reserva.end) ){
                        result = false;
                    }
                });
                deferred.resolve(result); 
            }); 
            return deferred.promise;  
        }

        function verificaHorario(inicio, fim, quadra){

        }
    }

    function contatosService(Ref, $firebaseArray, $firebaseObject, subdomainService, filteredArray) {
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
            return new filteredArray(ref, fn);
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

    function escolinhaService(Ref, $firebaseArray, $firebaseObject, subdomainService, reservasService, $q) {
        var service = {
            getRef : getRef,
            getTurmas : getTurmas,
            criarTurma : criarTurma
        };

        return service;

        function getRef() {

            return Ref.child('turmas');
        }

        function getTurmas() {

            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function criarTurma(turmas, novaTurma) {

            var deferred = $q.defer();

            reservasService.verificaHorarioPeriodo(novaTurma).then(function(horarioValido){

                if(horarioValido){
                    turmas.$add(novaTurma).then(function(ref) {
                        var turmaID = ref.key();
                        var reservasTurma = {};

                        _.forEach(novaTurma.dow, function(d) {
                            var dataReserva = moment(novaTurma.dataInicio).day(d);

                            while (dataReserva <= novaTurma.dataFim) {
                                var reservaID = reservasService.getRef().child(subdomainService.arena).push().key();

                                var dataF = moment(dataReserva).format('DD/MM/YYYY');
                                var start = moment(dataF + novaTurma.horaInicio , 'DD/MM/YYYYHHmm')._d.getTime();
                                var end = moment(dataF + novaTurma.horaFim , 'DD/MM/YYYYHHmm')._d.getTime();

                                var reserva = {
                                    turma : turmaID,
                                    tipo : 2,
                                    quadra: novaTurma.quadra,
                                    start : start,
                                    end : end,
                                    responsavel : novaTurma.professor
                                };

                                reservasTurma['reservas/' + subdomainService.arena + '/' + reservaID] = reserva;
                                reservasTurma['turmas/' + subdomainService.arena + '/' + turmaID + '/reservas/' +  reservaID] = true;

                                dataReserva = moment(dataReserva).add(7,'days')._d;
                            }
                        });

                        Ref.update(reservasTurma, function(error) {
                            if (error) {
                                deferred.reject('Erro ao cadastrar reservas');
                            }
                            else {
                                deferred.resolve();
                            }
                        });
                    }, function() {
                        deferred.reject('Erro ao cadastrar nova turma');
                    });
                }
                else{
                    deferred.reject('Horário Ocupado!');
                }

            });

            return deferred.promise;
        }

    }

})();
