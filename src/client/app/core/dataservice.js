(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('FilteredArray', FilteredArray)
        .factory('ScrollArray', ScrollArray)
        .factory('PageArray', PageArray)
        .factory('usersService', usersService)
        .factory('arenaService', arenaService)
        .factory('quadraService' , quadraService)
        .factory('funcionamentoService' , funcionamentoService)
        .factory('reservasService', reservasService)
        .factory('contatosService', contatosService);

    FilteredArray.$inject = ['$firebaseArray'];
    ScrollArray.$inject = ['$firebaseArray'];
    PageArray.$inject = ['$firebaseArray'];
    quadraService.$inject = ['Ref' , '$firebaseArray' , '$firebaseObject' , 'subdomainService'];
    arenaService.$inject = ['Ref' , '$firebaseArray' , '$firebaseObject' , 'subdomainService'];
    funcionamentoService.$inject = ['Ref' , '$firebaseArray' , '$firebaseObject' , 'subdomainService'];
    reservasService.$inject =
        ['Ref' , '$firebaseArray' , '$firebaseObject' , 'subdomainService', 'FilteredArray' , '$q', 'ScrollArray'];
    contatosService.$inject = ['Ref' , '$firebaseArray' , '$firebaseObject' , 'subdomainService', 'FilteredArray'];

    function FilteredArray($firebaseArray) {
        /*jshint -W004 */
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
    }

    function ScrollArray($firebaseArray) {
        return function(ref, field) {
            var scrollRef = new Firebase.util.Scroll(ref, field);
            var list = $firebaseArray(scrollRef);
            list.scroll = scrollRef.scroll;
            return list;
        };
    }

    function PageArray($firebaseArray) {
        return function(ref, field) {
            // create a Paginate reference
            var pageRef = new Firebase.util.Paginate(ref, field, {maxCacheSize: 250});
            // generate a synchronized array using the special page ref
            var list = $firebaseArray(pageRef);
            // store the "page" scope on the synchronized array for easy access
            list.page = pageRef.page;

            // when the page count loads, update local scope vars
            pageRef.page.onPageCount(function(currentPageCount, couldHaveMore) {
                list.pageCount = currentPageCount;
                list.couldHaveMore = couldHaveMore;
            });

            // when the current page is changed, update local scope vars
            pageRef.page.onPageChange(function(currentPageNumber) {
                list.currentPageNumber = currentPageNumber;
            });

            // load the first page
            pageRef.page.next();
            return list;
        };
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

    function reservasService(Ref, $firebaseArray, $firebaseObject, subdomainService, FilteredArray, $q , ScrollArray) {
        var service = {
            getRef: getRef,

            getAll : getAll,
            getFilteredArray : getFilteredArray,
            getReserva: getReserva,
            getTurmas : getTurmas,
            getMensalistas : getMensalistas,
            getAvulsar : getAvulsar,

            verificaHorarioPeriodo: verificaHorarioPeriodo,

            criarReservaAvulsa : criarReservaAvulsa,
            criarReservaRecorrente : criarReservaRecorrente
        };

        return service;

        function getRef() {
            return Ref.child('reservas');
        }

        function getFilteredArray(fn, start, end) {
            var ref = getRef().child(subdomainService.arena).orderByChild('start').startAt(start).endAt(end);
            return new FilteredArray(ref, fn);
        }

        function getAll() {
            return $firebaseArray(getRef().child(subdomainService.arena));
        }

        function getReserva(id) {
            return $firebaseArray(getRef().child(subdomainService.arena + '/' + id));
        }

        function getTurmas() {
            var joinedRef = new Firebase.util.NormalizedCollection(
              [Ref.child('/turmas/' + subdomainService.arena + ''), 'turma'],
              [Ref.child('/quadras/' + subdomainService.arena), 'quadra', 'turma.quadra'],
              [Ref.child('/perfil/'), 'professor', 'turma.responsavel']
            ).select(
              'turma.quadra',
              'turma.dataInicio',
              'turma.dataFim',
              'turma.horaInicio',
              'turma.horaFim',
              'turma.responsavel',
              'turma.dow',
              {'key':'quadra.nome','alias':'nomeQuadra'},
              {'key':'professor.nome','alias':'nomeProfessor'}
            ).ref();

            return new ScrollArray(joinedRef, 'dataInicio');
        }

        function getMensalistas() {
            var joinedRef = new Firebase.util.NormalizedCollection(
              [Ref.child('/mensalistas/' + subdomainService.arena + ''), 'mensalista'],
              [Ref.child('/quadras/' + subdomainService.arena), 'quadra', 'mensalista.quadra'],
              [Ref.child('/perfil/'), 'responsavel', 'mensalista.responsavel']
            ).select(
            'mensalista.quadra',
              'mensalista.dataInicio',
              'mensalista.dataFim',
              'mensalista.horaInicio',
              'mensalista.horaFim',
              'mensalista.responsavel',
              'mensalista.dow',
              {'key':'quadra.nome','alias':'nomeQuadra'},
              {'key':'responsavel.nome','alias':'nomeResponsavel'}
            ).ref();

            return new ScrollArray(joinedRef, 'dataInicio');
        }

        function getAvulsar() {
            var joinedRef = new Firebase.util.NormalizedCollection(
              [Ref.child('/reservas/' + subdomainService.arena + ''), 'avulsa'],
              [Ref.child('/quadras/' + subdomainService.arena), 'quadra', 'avulsa.quadra'],
              [Ref.child('/perfil/'), 'responsavel', 'avulsa.responsavel']
            ).select(
            'avulsa.quadra',
              'avulsa.start',
              'avulsa.end',
              'avulsa.responsavel',
              'avulsa.tipo',
              {'key':'quadra.nome','alias':'nomeQuadra'},
              {'key':'responsavel.nome','alias':'nomeResponsavel'}
            ).ref();

            return new ScrollArray(joinedRef, 'start');
        }

        function verificaHorarioPeriodo(reserva) {
            var deferred = $q.defer();

            var result = true;
            var ref = getRef().child(subdomainService.arena)
                .orderByChild('start').startAt(reserva.dataInicio).endAt(reserva.dataFim);

            ref.once('value', function(data) {
                _.forEach(data.val(), function(data) {
                    var dow = moment(data.start)._d.getDay();
                    var start = moment(data.start).format('HHmm');
                    var end = moment(data.end).format('HHmm');
                    if (reserva.quadra === data.quadra && _.contains(reserva.dow, dow) &&
                        (
                            reserva.horaInicio === start ||
                            reserva.horaFim === end ||
                            (reserva.horaInicio < start && start < reserva.horaFim) ||
                            (reserva.horaInicio > start && end > reserva.horaInicio)
                        )
                    )
                    {
                        result = false;
                    }
                });
                deferred.resolve(result);
            });
            return deferred.promise;
        }

        function criarReservaAvulsa(novaReserva) {
            var deferred = $q.defer();

            verificaHorarioPeriodo(novaReserva).then(function(horarioValido) {

                if (horarioValido) {
                    var list = $firebaseArray(getRef().child(subdomainService.arena));
                    var reserva = {
                        quadra: novaReserva.quadra,
                        responsavel: novaReserva.responsavel,
                        start : moment(moment(novaReserva.dataInicio).format('DDMMYYYY') +
                            novaReserva.horaInicio, 'DDMMYYYYHH:mm')._d.getTime() ,
                        end : moment(moment(novaReserva.dataFim).format('DDMMYYYY') +
                            novaReserva.horaFim, 'DDMMYYYYHH:mm')._d.getTime(),
                    };

                    list.$add(reserva).then(function(ref) {
                        deferred.resolve();
                    }, function() {
                        deferred.reject('Erro ao cadastrar nova turma');
                    });
                }
                else {
                    deferred.reject('Horário Ocupado!');
                }

            });

            return deferred.promise;
        }

        function criarReservaRecorrente(novaReserva, tipo) {
            var deferred = $q.defer();

            verificaHorarioPeriodo(novaReserva).then(function(horarioValido) {

                if (horarioValido) {
                    var list = $firebaseArray(Ref.child(tipo).child(subdomainService.arena));
                    list.$add(novaReserva).then(function(ref) {
                        var turmaID = ref.key();
                        var reservasTurma = {};

                        _.forEach(novaReserva.dow, function(d) {
                            var dataReserva = moment(novaReserva.dataInicio).day(d);

                            while (dataReserva <= novaReserva.dataFim) {
                                var reservaID = getRef().child(subdomainService.arena).push().key();

                                var dataF = moment(dataReserva).format('DD/MM/YYYY');
                                var start = moment(dataF + novaReserva.horaInicio , 'DD/MM/YYYYHHmm')._d.getTime();
                                var end = moment(dataF + novaReserva.horaFim , 'DD/MM/YYYYHHmm')._d.getTime();

                                var reserva = {
                                    turma : turmaID,
                                    tipo : 2,
                                    quadra: novaReserva.quadra,
                                    start : start,
                                    end : end,
                                    responsavel : novaReserva.responsavel
                                };

                                reservasTurma['reservas/' + subdomainService.arena + '/' + reservaID] = reserva;
                                reservasTurma[ tipo + '/' + subdomainService.arena + '/' + turmaID + '/reservas/' +  reservaID] = true;

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
                        deferred.reject('Erro ao cadastrar nova ' + tipo);
                    });
                }
                else {
                    deferred.reject('Horário Ocupado!');
                }

            });

            return deferred.promise;
        }
    }

    function contatosService(Ref, $firebaseArray, $firebaseObject, subdomainService, FilteredArray) {
        var service = {
            getRef : getRef,
            getContato: getContato,
            getContatos: getContatos,
            searchContatos: searchContatos,
            getContatosArena: getContatosArena,
            getContatosArenaLight : getContatosArenaLight,
            addNovoContato : addNovoContato
        };

        return service;

        function getRef() {
            return Ref.child('perfil');
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

        function addNovoContato(novoContato) {
            novoContato.fkArena = true;
            getContatosArena().$add(novoContato);

        }
    }

    function usersService(Ref, $firebaseArray, $firebaseObject, subdomainService) {
        var service = {
            getRef : getRef,
            getUserProfile: getUserProfile,
        };

        return service;

        function getRef() {
            return Ref.child('users');
        }

        function getUserProfile(id) {
            return $firebaseObject(getRef().child(id));
        }
    }

})();
