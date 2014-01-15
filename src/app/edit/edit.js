(function (ng, app) {

    var _videoModalCtrl = ['$scope', '$modalInstance', '$sce', 'existingVideo', function ($scope, $modalInstance, $sce, existingVideo) {

        $scope.ok = function (selectedMedia, selectedMediaStart) {
            var videoId = (selectedMedia || 'watch?v=').split('watch?v=')[1];
            $modalInstance.close({videoId: videoId, startTime: selectedMediaStart});
        };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


        var player;
        var videoId = ((existingVideo || {}).params || {}).videoId;

        $scope.selectedMedia = 'http://www.youtube.com/watch?v=' + videoId;
        $scope.selectedMediaStart = ((existingVideo || {}).params || {}).startTime;

        _.defer(function () {
            player = new YT.Player('player', {
                playerVars: { 'autoplay': 1, 'controls': 0},
                height: '540',
                width: '960',
                videoId: videoId
            });
        });

        $scope.renderYT = function (selectedMedia) {
            var videoId = (selectedMedia || 'watch?v=').split('watch?v=')[1];
            _.defer(function () {
                player.loadVideoById(videoId, 0, 'large');
            });
        };

    }];
    ng.module(app, [
            'ui.router',
            'sokratik.atelier.minerva.directives',
            'ngSanitize'
        ])

        .config(['$stateProvider', function config($stateProvider) {
            $stateProvider.state('edit', {
                url: '/edit/:templateName/:presentationId/:page/:images',
                resolve: {

                    page: ['$stateParams', function ($stateParams) {
                        //noinspection JSUnresolvedFunction
                        return parseInt($stateParams.page ? $stateParams.page : 0, 10);
                    }],
                    presentation: ['anduril', '$stateParams', function (anduril, $stateParams) {
                        return anduril.fetchPresentation($stateParams.presentationId);
                    }]

                },
                data: {
                    mode: 'edit'
                },
                views: {
                    'main': {
                        templateUrl: 'edit/edit.tpl.html',
                        controller: 'EditController'
                    }
                },
                parent: 'root'
            });


        }])

        .controller('EditController',
            ['$scope', 'page', '$stateParams', 'presentation', 'anduril', '$state', '$modal', '$rootScope',
                function ($scope, page, $stateParams, presentation, anduril, $state, $modal, $rootScope) {

                    $rootScope.presentationMode = true;
                    $rootScope.navigationMode = false;
                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
                    var presentationId = $stateParams.presentationId;
                    $scope.presentationId = presentationId;
                    var activePresentation = $scope.presentation = presentation.presentationData[page];
                    $scope.totalPages = _.size(presentation.presentationData);
                    $scope.presentation.keyVals = _.extend({}, $scope.presentation.keyVals);
                    anduril.put(presentation, page, $scope.presentation);
                    var images = $stateParams.images || 1;
                    $scope.images = images;
                    $scope.presentation.templateName = $scope.presentation.templateName || (images + 'imageText');
                    page = parseInt(page, 10);

                    $scope.record = function () {
                        anduril.put(presentation, page, activePresentation);
                        anduril.post(presentation);
                        $state.go('record.activate', {page: 0});
                    };

                    $scope.goToPage = function (page) {
                        'use strict';
                        presentation = anduril.put(presentation, $scope.page, activePresentation);
                        anduril.post(presentation);
                        $state.go('edit', {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    };
                    $scope.remove = function () {
                        'use strict';
                        anduril.post(anduril.remove(presentation, page));
                        $state.go('edit', {templateName: $stateParams.templateName, presentationId: presentationId, page: page - 1});
                    };

                    var _changeTemplates = function (templateName) {
                        presentation = anduril.put(presentation, $scope.page, activePresentation);
                        anduril.changeTemplate(presentation, page, templateName);
                        anduril.post(presentation);
                        $state.go('edit', { images: images, templateName: templateName});

                    };
                    var changeTemplates = _.once(_changeTemplates);
                    $scope.increaseImages = function () {
                        if (images < 5) {
                            changeTemplates((++images) + 'imageText');
                        }
                    };
                    $scope.decreaseImages = function () {
                        if (images > 0) {
                            changeTemplates((--images) + 'imageText');
                        }
                    };
                    $scope.isFullImageTemplate = _.isEqual('fullImage', $scope.presentation.templateName);

                    $scope.toggleFullScreenImage = function () {
                        if ($scope.isFullImageTemplate) {
                            images = 1;
                            changeTemplates('1imageText');
                        } else {
                            changeTemplates('fullImage');
                        }
                    };
                    $scope.add = function () {
                        presentation = anduril.put(presentation, $scope.page, activePresentation);
                        anduril.insert(presentation, page + 1, {templateName: '1imageText'});
                        anduril.post(presentation);
                        $state.go('edit', { 'page': page + 1, templateName: 'imageText', images: 1});
                    };

                    $scope.addVideo = function () {
                        var modalInstance = $modal.open({
                            templateUrl: 'edit/yt.modal.tpl.html',
                            controller: _videoModalCtrl,
                            resolve: {
                                existingVideo: function () {
                                    activePresentation.apps = activePresentation.apps || [];
                                    return _.findWhere(activePresentation.apps, {name: 'YT'});
                                }
                            }
                        });
                        activePresentation.apps = activePresentation.apps || {};
                        presentation = anduril.put(presentation, page, activePresentation);
                        var existingVideo = _.findWhere(activePresentation.apps, {name: 'YT'}) || {name: 'YT'};
                        modalInstance.result.then(function (params) {
                            activePresentation.apps = _.without(activePresentation.apps, existingVideo);
                            existingVideo.params = params;
                            activePresentation.apps = _.union(activePresentation.apps, existingVideo);
                            presentation = anduril.put(presentation, page, activePresentation);
                        }, function () {
                            //noinspection JSUnresolvedFunction
                        });
                        return modalInstance;
                    };
                }]);
})(angular, 'sokratik.atelier.edit');



