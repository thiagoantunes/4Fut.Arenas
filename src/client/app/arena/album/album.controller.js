(function() {
    'use strict';

    angular
    .module('app.arena')
    .controller('AlbumCtrl', AlbumCtrl);

    AlbumCtrl.$inject = ['$scope' , '$modal', 'arenaService', 'Upload', '$timeout', '$sce', 'subdomainService', 'cfpLoadingBar'];

    function AlbumCtrl($scope, $modal, arenaService, Upload, $timeout, $sce, subdomainService, cfpLoadingBar) {
        var vm = this;
        vm.album = arenaService.getAlbum();
        vm.emptyList = false;
        vm.deleteFoto = deleteFoto;

        activate();

        function activate() {
            cfpLoadingBar.start();
            vm.album.$loaded(function(event) {
                if (vm.album.length === 0) {
                    vm.emptyList = true;
                }
                cfpLoadingBar.complete();
            });

            vm.album.$watch(function(event) {
                if (vm.album.length === 0) {
                    vm.emptyList = true;
                }
                else {
                    vm.emptyList = false;
                }
                cfpLoadingBar.complete();
            });
        }

        function deleteFoto($event, foto) {
            $event.stopPropagation();
            vm.album.$remove(foto);
        }

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.uploadFiles = function(files, errFiles) {
            /*jshint ignore:start*/
            //jscs:disable maximumLineLength
            $scope.policy = 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogIjRmdXQifSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJGtleSIsICIiXSwKICAgIHsiYWNsIjogInB1YmxpYy1yZWFkIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRmaWxlbmFtZSIsICIiXSwKICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgXQp9';
            //jscs:enable maximumLineLength
            /*jshint ignore:end*/
            $scope.signature = 'gSeFpMefsT7T5vkDEJ+zOkTufw0=';

            $scope.files = files;
            $scope.errFiles = errFiles;
            angular.forEach(files, function(file) {
                var fileName =  Math.round(Math.random() * 1000) + '_' + file.name;

                Upload.imageDimensions(file).then(function(dimensions) {

                    var max = _.max([dimensions.height, dimensions.height]);
                    var quality = 1;
                    var height = dimensions.height;
                    var width = dimensions.width;

                    if (max > 1022) {
                        quality = 1022 / max;
                        height = dimensions.height * quality;
                        width = dimensions.height * quality;
                    }

                    Upload.resize(file, width, height).then(function(fileOk) {

                        Upload.upload({
                            url: 'https://4fut.s3.amazonaws.com/',
                            method: 'POST',
                            data : {
                                key: subdomainService.arena + '/' + fileName,
                                AWSAccessKeyId: 'AKIAI7H2KNGKAMZK32DQ',
                                'Content-Type': fileOk.type !== '' ? fileOk.type : 'application/octet-stream',
                                acl: 'public-read',
                                policy: $scope.policy,
                                signature: $scope.signature,
                                filename: fileOk.name,
                                file: fileOk,
                            },
                        }).then(function (response) {
                            $timeout(function () {
                                fileOk.result = response.data;

                                Upload.resize(fileOk, 180, 180, null, null, null , true).then(function(thumb) {

                                    var thumbName =  subdomainService.arena + '/thumb/' + fileName;
                                    Upload.upload({
                                        url: 'https://4fut.s3.amazonaws.com/',
                                        method: 'POST',
                                        data : {
                                            key: thumbName,
                                            AWSAccessKeyId: 'AKIAI7H2KNGKAMZK32DQ',
                                            'Content-Type': thumb.type !== '' ? thumb.type : 'application/octet-stream',
                                            acl: 'public-read',
                                            policy: $scope.policy,
                                            signature: $scope.signature,
                                            filename: thumb.name,
                                            file: thumb,
                                        },
                                    }).then(function (response) {
                                        $timeout(function () {
                                            var albumItem = {
                                                img : 'https://4fut.s3.amazonaws.com/' +  subdomainService.arena + '/' + fileName,
                                                thumb : 'https://4fut.s3.amazonaws.com/'  + thumbName
                                            };
                                            vm.album.$add(albumItem);
                                            vm.emptyList = false;
                                        });
                                    });
                                });

                            });
                        }, function (response) {
                            if (response.status > 0) {
                                $scope.errorMsg = response.status + ': ' + response.data;
                            }
                        }, function (evt) {
                            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });

                    });

                });

            });
        };
    }
})();
