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
            ['$scope', 'page', '$stateParams', 'presentation', 'anduril', '$state', '$modal', '$rootScope', '$window',
                function ($scope, page, $stateParams, presentation, anduril, $state, $modal, $rootScope, $window) {

                    $rootScope.presentationMode = true;
                    $rootScope.navigationMode = false;

                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
                    $scope.walkthroughOverride = true;
                    $scope.walkthroughActive = true;
                    $scope.walkThroughStage = 1;
                    var walkThroughStage = 1;
                    var haltAutoAdvance = false;
                    var advanceWalkThrough = function () {
                        if (!haltAutoAdvance && $scope.walkthroughActive) {
                            walkThroughStage++;
                            console.log("broadcasting" + haltAutoAdvance + " for " + walkThroughStage);
                            console.log($scope.walkthroughActive);
                            $scope.$broadcast('showWalkThroughDirective', walkThroughStage);
                            console.log(walkThroughStage);
                            $scope.$apply(function () {
                                $scope.walkThroughStage = walkThroughStage;
                            });


                        }
                        _.delay(function () {
                            if ($scope.walkthroughActive && !haltAutoAdvance && walkThroughStage < 12) {
                                advanceWalkThrough();
                            } else {

                                $scope.$apply(function () {
                                    $scope.walkthroughActive = false;
                                });

                            }
                        }, 5000);

                    };

                    $scope.$on('showWalkThrough', function (event, data) {
                        haltAutoAdvance = false;
                        walkThroughStage = data;
                        $scope.walkthroughActive = true;
                        event.stopPropagation();
                        _.defer(advanceWalkThrough);
                    });
                    $scope.$on('haltAutoAdvance', function (event) {
                        haltAutoAdvance = true;
                        event.stopPropagation();

                    });
                    $scope.hideWalkThrough = function () {
                        $scope.walkthroughActive = false;
                        $scope.$broadcast('hideWalkThrough', $scope.walkThroughStage);
                        _.delay(function () {
                            if (!haltAutoAdvance) {
                                $scope.$apply(function () {
                                    $scope.walkthroughActive = true;
                                });
                                advanceWalkThrough();
                            }
                        }, 2000);
                    };
                    var presentationId = $stateParams.presentationId;
                    $scope.presentationId = presentationId;
                    var activePresentation = $scope.presentation = presentation.presentationData[page] || {};
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
                        $window.ga('send', 'event', 'ImportantStates', 'click', 'recordStart');
                        $state.go('record.activate', {page: 0, presentationId: presentationId});
                    };

                    $scope.walkThroughStage = $state.current.data.walkThroughStage;

                    $scope.goToPage = function (page) {
                        'use strict';
                        presentation = anduril.put(presentation, $scope.page, activePresentation);
                        anduril.post(presentation);
                        $state.go('edit', {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    };
                    $scope.remove = function () {
                        'use strict';
                        if (page == _.size(presentation.presentationData)) {

                        }
                        var targetPage = (page === 0) ? page : page - 1;
                        anduril.post(anduril.remove(presentation, page));

                        $state.go('edit', {templateName: $stateParams.templateName, presentationId: presentationId, page: targetPage },
                            {reload: true});
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
                    $scope.isTitle = _.isEqual("title", $scope.presentation.templateName);
                    $scope.cantAddImage = $scope.isTitle || _.isEqual("4imageText", $scope.presentation.templateName);
                }
            ])
    ;
})
    (angular, 'sokratik.atelier.edit');



