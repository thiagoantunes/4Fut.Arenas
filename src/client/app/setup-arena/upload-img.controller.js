(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('UploadImgCtrl', UploadImgCtrl);

    UploadImgCtrl.$inject = ['$scope' , 'Upload', 'Auth'];

    function UploadImgCtrl($scope , Upload, Auth) {
        /*jshint ignore:start*/
        //jscs:disable maximumLineLength
        $scope.policy = 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogIjRmdXQifSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJGtleSIsICJpbWcvIl0sCiAgICB7ImFjbCI6ICJwdWJsaWMtcmVhZCJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDUyODgwMDBdCiAgXQp9';
        //jscs:enable maximumLineLength
        /*jshint ignore:end*/
        $scope.signature = 'ds0gHdmN9AdfQM5klGMHi+5X2dQ=';

        $scope.upload = function (dataUrl) {
            var file = Upload.dataUrltoBlob(dataUrl);
            file.name = Math.round(Math.random() * 100) + '_' + Auth.$getAuth().uid;
            Upload.upload({
                url: 'https://4fut.s3.amazonaws.com/',
                method: 'POST',
                data : {
                    key: 'img/${filename}',
                    AWSAccessKeyId: 'AKIAI7H2KNGKAMZK32DQ',
                    acl: 'public-read',
                    policy: $scope.policy,
                    signature: $scope.signature,
                    'Content-Type': 'image/jpeg',
                },
                file: file,
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ');
            }).then(function (data, status, headers, config) {
                console.log(data);
                console.log(headers);
                $scope.$parent.vm.saveImage(file.name);
            }).then(function (data, status, headers, config) {

            });
        };
    }

})();

