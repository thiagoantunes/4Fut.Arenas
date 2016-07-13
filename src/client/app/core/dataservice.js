(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('FilteredArray', FilteredArray)
        .factory('MappedArray', MappedArray)
        .factory('usersService', usersService)
        .factory('arenaService', arenaService)
        .factory('quadraService', quadraService)
        .factory('funcionamentoService', funcionamentoService)
        .factory('reservasService', reservasService)
        .factory('contatosService', contatosService)
        .factory('financeiroService', financeiroService);

    FilteredArray.$inject = ['$firebaseArray'];
    MappedArray.$inject = ['$firebaseArray'];
    quadraService.$inject = ['Ref', '$firebaseArray', '$firebaseObject', 'arenaService'];
    arenaService.$inject = ['Auth', '$q', 'Ref', '$firebaseArray', '$firebaseObject', '$state'];
    funcionamentoService.$inject = ['Ref', '$firebaseArray', '$firebaseObject', 'arenaService', '$q', 'MappedArray'];
    reservasService.$inject =
        ['Ref', '$firebaseArray', '$firebaseObject', 'arenaService', 'FilteredArray', '$q'];
    contatosService.$inject = ['Ref', '$q', '$firebaseArray', '$firebaseObject', 'arenaService', 'FilteredArray'];
    financeiroService.$inject = ['Ref', '$firebaseArray', '$firebaseObject', 'arenaService'];

    function FilteredArray($firebaseArray) {
        /*jshint -W004 */
        function FilteredArray(ref, filterFn) {
            this.filterFn = filterFn;
            return $firebaseArray.call(this, ref);
        }
        FilteredArray.prototype.$$added = function (snap) {
            var rec = $firebaseArray.prototype.$$added.call(this, snap);
            if (!this.filterFn || this.filterFn(rec)) {
                return rec;
            }
        };
        return $firebaseArray.$extend(FilteredArray);
    }

    function MappedArray($firebaseArray) {
        /*jshint -W004 */
        function MappedArray(ref, mapFn) {
            this.mapFn = mapFn;
            return $firebaseArray.call(this, ref);
        }
        MappedArray.prototype.$$added = function (snap) {
            var rec = $firebaseArray.prototype.$$added.call(this, snap);
            return this.mapFn(rec);
        };
        MappedArray.prototype.$$updated = function (snap) {
            var rec = $firebaseArray.prototype.$$updated.call(this, snap);
            return this.mapFn(rec);
        };
        return $firebaseArray.$extend(MappedArray);
    }

    function quadraService(Ref, $firebaseArray, $firebaseObject, arenaService) {
        var service = {
            getRef: getRef,
            //queryQuadra: queryQuadra,

            getQuadra: getQuadra,
            getQuadras: getQuadras
        };

        return service;

        function getRef() {
            return Ref.child('arenasQuadras');
        }

        function getQuadra(id) {
            return $firebaseObject(getRef().child(arenaService.idArena + '/' + id));
        }

        function getQuadras() {
            return $firebaseArray(getRef().child(arenaService.idArena));
        }
    }

    function arenaService(Auth, $q, Ref, $firebaseArray, $firebaseObject, $state) {

        var service = {
            getIdArena: getIdArena,
            getRef: getRef,

            getArena: getArena,
            getAlbum: getAlbum,
            getEstrutura: getEstrutura,
            getNotificacoes: getNotificacoes,
            getNotificacoesNaoLidas: getNotificacoesNaoLidas,

            isValidArenaName: isValidArenaName,
            setLocation: setLocation
        };

        service.idArena = '';

        return service;

        function getIdArena() {
            var deferred = $q.defer();
            Auth.onAuthStateChanged(function(user) {
                if (user) {
                    Ref.child('users/' + user.uid).once('value', function (snap) {
                        if (snap.val() === null || snap.val().arena === null) {
                            deferred.reject();
                        }
                        else {
                            service.idArena = snap.val().arena;
                            deferred.resolve(service.idArena);
                        }
                    });
                }
                else {
                    deferred.reject();
                    $state.go('login');
                }
            });

            return deferred.promise;
        }

        function getRef() {
            return Ref.child('arenas');
        }

        function getArena() {
            /*jshint validthis: true */
            return $firebaseObject(getRef().child(this.idArena));
        }

        function isValidArenaName(arenaName) {
            return getRef().child(arenaName).once('value', function (snap) {
                return snap.val() === null;
            });
        }

        function getAlbum() {
            /*jshint validthis: true */
            return $firebaseArray(Ref.child('arenasAlbuns').child(this.idArena));
        }

        function getEstrutura() {
            /*jshint validthis: true */
            return $firebaseArray(Ref.child('arenasEstrutura').child(this.idArena));
        }

        function getNotificacoes() {
            /*jshint validthis: true */
            var ref = Ref.child('arenasNotificacoes').child(this.idArena)
                .limitToLast(5);
            return $firebaseArray(ref);
        }

        function getNotificacoesNaoLidas() {
            /*jshint validthis: true */
            var ref = Ref.child('arenasNotificacoes').child(this.idArena)
                .orderByChild('lida').startAt(false).endAt(false);
            return $firebaseArray(ref);
        }

        function setLocation(lat, lng) {
            var geo = new GeoFire(Ref.child('arenasLocalizacao'));

            geo.set(this.idArena, [lat, lng]);
        }
    }

    function funcionamentoService(Ref, $firebaseArray, $firebaseObject, arenaService, $q, MappedArray) {
        var service = {
            getPreco: getPreco,
            getPrecos: getPrecos,

            salvarNovoPreco: salvarNovoPreco,
            updateHorarioPreco: updateHorarioPreco,
            updatePreco: updatePreco
        };

        return service;

        function getPreco(quadraId, id) {
            return $firebaseObject(
                Ref.child('arenasQuadras/' + arenaService.idArena + '/' + quadraId + '/funcionamento/' + id)
            );
        }

        function getPrecos(quadraId, fn) {
            var ref = Ref.child('arenasQuadras/' + arenaService.idArena + '/' + quadraId + '/funcionamento/');
            return new MappedArray(ref, fn);
        }

        function updateHorarioPreco(preco) {
            var update = {};
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/start'] = preco.start;
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/end'] = preco.end;
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/dow'] = preco.dow;
            return Ref.update(update);
        }

        function updatePreco(preco) {
            var update = {};
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/precoAvulso'] = preco.precoAvulso;
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/precoMensalista'] = preco.precoMensalista;
            update['/arenasQuadras/' +
                arenaService.idArena + '/' +
                preco.quadra + '/funcionamento/' +
                preco.id + '/title'] = preco.title;
            return Ref.update(update);
        }

        function salvarNovoPreco(novoPrecoModal, dow, precos) {
            var deferred = $q.defer();

            var novoPreco = {
                title: 'A:  R$ ' +
                novoPrecoModal.precoAvulso +
                '  |  ' + 'M: R$ ' + novoPrecoModal.precoMensalista,
                start: moment(novoPrecoModal.inicio).format('HH:mm'),
                end: moment(novoPrecoModal.fim).format('HH:mm'),
                //dow: start._d.getDay().toString(),
                precoMensalista: novoPrecoModal.precoMensalista,
                precoAvulso: novoPrecoModal.precoAvulso
            };

            if (dow.length > 0) {
                if (isValidPrice(precos, novoPreco, dow)) {
                    _.forEach(dow, function (d) {
                        novoPreco.dow = '' + d;
                        precos.$add(novoPreco).then(function (ref) {
                            deferred.resolve();
                        });
                    });
                }
                else {
                    deferred.reject('Conflito de horários!');
                }
            }
            else {
                deferred.reject('Selecione pelo menos um dia da semana.');
            }

            return deferred.promise;
        }

        function isValidPrice(precos, eventData, dow) {
            return _.every(dow, function (d) {
                return _.every(precos, function (f) {
                    return f.dow !== ('' + d) ||
                        (eventData.start >= f.end || eventData.end <= f.start);
                });
            });
        }
    }

    function reservasService(Ref, $firebaseArray, $firebaseObject, arenaService, FilteredArray, $q) {
        var service = {
            getRef: getRef,

            getAll: getAll,
            getFilteredArray: getFilteredArray,
            getReserva: getReserva,
            getTurmas: getTurmas,

            verificaHorarioPeriodo: verificaHorarioPeriodo,

            criarReservaAvulsa: criarReservaAvulsa,
            criarReservaRecorrente: criarReservaRecorrente
        };

        return service;

        function getRef() {
            return Ref.child('reservas');
        }

        function getFilteredArray(fn, start, end) {
            var ref = getRef().child(arenaService.idArena).orderByChild('start').startAt(start).endAt(end);
            return new FilteredArray(ref, fn);
        }

        function getAll() {
            return $firebaseArray(getRef().child(arenaService.idArena));
        }

        function getReserva(id) {
            return $firebaseArray(getRef().child(arenaService.idArena + '/' + id));
        }

        function getTurmas() {
            return $firebaseArray(Ref.child('arenasTurmas/' + arenaService.idArena));
        }

        function verificaHorarioPeriodo(reserva) {
            var deferred = $q.defer();

            var result = true;
            var ref = getRef().child(arenaService.idArena)
                .orderByChild('start').startAt(reserva.dataInicio).endAt(reserva.dataFim);

            ref.once('value', function (data) {
                _.forEach(data.val(), function (data) {
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
                    ) {
                        result = false;
                    }
                });
                deferred.resolve(result);
            });
            return deferred.promise;
        }

        function criarReservaAvulsa(novaReserva) {
            var deferred = $q.defer();

            verificaHorarioPeriodo(novaReserva).then(function (horarioValido) {

                if (horarioValido) {
                    var list = $firebaseArray(getRef().child(arenaService.idArena));
                    var reserva = {
                        tipo: novaReserva.tipo,
                        quadra: novaReserva.quadra,
                        responsavel: novaReserva.responsavel,
                        start: moment(moment(novaReserva.dataInicio).format('DDMMYYYY') +
                            novaReserva.horaInicio, 'DDMMYYYYHH:mm')._d.getTime(),
                        end: moment(moment(novaReserva.dataFim).format('DDMMYYYY') +
                            novaReserva.horaFim, 'DDMMYYYYHH:mm')._d.getTime(),
                        title: novaReserva.title,
                        saldoDevedor: novaReserva.saldoDevedor,
                        saldoQuitado: 0
                    };

                    list.$add(reserva).then(function (ref) {
                        deferred.resolve();
                    }, function (err) {
                        console.log(err);
                        deferred.reject('Erro ao cadastrar nova reserva');
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

            verificaHorarioPeriodo(novaReserva).then(function (horarioValido) {

                if (horarioValido) {
                    var list = $firebaseArray(Ref.child(tipo).child(arenaService.idArena));
                    list.$add(novaReserva).then(function (ref) {
                        var turmaID = ref.key;
                        var reservasTurma = {};

                        _.forEach(novaReserva.dow, function (d) {
                            var dataReserva = moment(novaReserva.dataInicio).day(d);

                            while (dataReserva <= novaReserva.dataFim) {
                                var reservaID = getRef().child(arenaService.idArena).push().key;

                                var dataF = moment(dataReserva).format('DD/MM/YYYY');
                                var start = moment(dataF + novaReserva.horaInicio, 'DD/MM/YYYYHHmm')._d.getTime();
                                var end = moment(dataF + novaReserva.horaFim, 'DD/MM/YYYYHHmm')._d.getTime();

                                var reserva = {
                                    turma: turmaID,
                                    tipo: novaReserva.tipo,
                                    quadra: novaReserva.quadra,
                                    start: start,
                                    end: end,
                                    responsavel: novaReserva.responsavel,
                                    title: novaReserva.title,
                                };

                                if (novaReserva.saldoDevedor) {
                                    reserva.saldoDevedor = novaReserva.saldoDevedor;
                                    reserva.saldoQuitado = 0;
                                }

                                reservasTurma['reservas/' + arenaService.idArena + '/' + reservaID] = reserva;
                                reservasTurma[tipo + '/' + arenaService.idArena + '/' + turmaID + '/reservas/' + reservaID] = true;

                                dataReserva = moment(dataReserva).add(7, 'days')._d;
                            }
                        });

                        Ref.update(reservasTurma, function (error) {
                            if (error) {
                                deferred.reject('Erro ao cadastrar reservas');
                            }
                            else {
                                deferred.resolve();
                            }
                        });
                    }, function () {
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

    function contatosService(Ref, $q, $firebaseArray, $firebaseObject, arenaService, FilteredArray) {
        var service = {
            getRef: getRef,
            refContatosArena: refContatosArena,
            getContato: getContato,
            getContatos: getContatos,
            searchContatos: searchContatos,
            getContatosArena: getContatosArena,
            getContatosArenaLight: getContatosArenaLight,
            addNovoContato: addNovoContato,
            refContatos: refContatos
        };

        return service;

        function getRef() {
            return Ref.child('users');
        }

        function refContatos() {
            return Ref.child('arenasContatos/' + arenaService.idArena);
        }

        function getContato(id) {
            return $firebaseObject(getRef().child(id));
        }

        function getContatos() {
            return $firebaseArray(getRef());
        }

        function searchContatos(fn) {
            var ref = getRef().child(arenaService.idArena);
            return new FilteredArray(ref, fn);
        }

        function refContatosArena() {
            var norm = new firebase.util.NormalizedCollection(
                [Ref.child('/users/'), 'perfil'],
                [Ref.child('/arenasContatos/' + arenaService.idArena), 'arena']
            ).select(
                'perfil.nome',
                'perfil.telefone',
                'perfil.email',
                'perfil.fotoPerfil',
                'perfil.dataNascimento',
                'perfil.cpf',
                'arena.$value',
                {'key': 'arena.$value', 'alias': 'fkArena'}
                );

            norm.filter(
                function (data, key, priority) { return data.fkArena === true; }
            );

            return norm.ref();
        }

        function getContatosArena() {
            var ref = refContatosArena();
            return $firebaseArray(ref);
        }

        function getContatosArenaLight() {
            var norm = new firebase.util.NormalizedCollection(
                [Ref.child('/users/'), 'perfil'],
                [Ref.child('/arenasContatos/' + arenaService.idArena), 'arena']
            ).select(
                'perfil.nome',
                'perfil.telefone',
                'perfil.fotoPerfil',
                'arena.$value',
                {'key': 'arena.$value', 'alias': 'fkArena'}
                );

            norm.filter(
                function (data, key, priority) { return data.fkArena === true; }
            );

            var joinedRef = norm.ref();

            return $firebaseArray(joinedRef);
        }

        function addNovoContato(novoContato) {
            var deferred = $q.defer();
            var contatoId = Ref.child('users').push().key;
            var contatoData = {};
            contatoData['arenasContatos/' + arenaService.idArena + '/' + contatoId] = true;
            contatoData['users/' + contatoId] = novoContato;

            Ref.update(contatoData, function(error) {
                deferred.resolve(contatoId);
            });
            return deferred.promise;
        }
    }

    function usersService(Ref, $firebaseArray, $firebaseObject, arenaService) {
        var service = {
            getRef: getRef,
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

    function financeiroService(Ref, $firebaseArray, $firebaseObject, arenaService) {
        var service = {
            getRef: getRef,
            getPagamentosReserva: getPagamentosReserva,
        };

        return service;

        function getRef() {
            return Ref.child('arenasPagamentos');
        }

        function getPagamentosReserva(reservaId) {
            return $firebaseArray(getRef().child(arenaService.idArena + '/' + reservaId));
        }
    }

})();
