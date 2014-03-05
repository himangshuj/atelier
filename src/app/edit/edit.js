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
                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
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
                        $window.hopscotch.endTour(false);
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
                    var tour = {
                        id: "edit-tutorial",
                        steps: [
                            {
                                title: "Title",
                                content: "This is a blank slide.  Click here to type the title",
                                target: "title",
                                placement: "bottom",
                                xOffset: 400,
                                yOffset: 80
                            },
                            {
                                title: "Choose image",
                                content: "Click on this icon to edit the image. upload pictures from your machine or use internet images",
                                target: '.image-placeholder',
                                placement: "right"
                            } ,
                            {
                                title: "Add more images",
                                content: "Click here to add more images",
                                target: "addImage",
                                placement: "right"
                            } ,
                            {
                                title: "Delete images",
                                content: "Click here to delete an image",
                                target: "decreaseImage",
                                placement: "left",
                                xOffset: 40
                            }  ,
                            {
                                title: "Add a video",
                                content: "Click here and input URL of the youtube video you want",
                                target: "addVideo",
                                placement: "right"
                            }    ,
                            {
                                title: "Add text",
                                content: "Click here and type text",
                                target: "text1",
                                placement: "top"
                            },
                            {
                                title: "Add another slide",
                                content: "Click here to add a new blank slide",
                                target: "next",
                                placement: "left"
                            },
                            {
                                title: " fullScreen images",
                                content: "Upload an image. Then click here to make it full-screen",
                                target: "toggleFullScreen",
                                placement: "right"
                            }  ,

                            {
                                title: "Delete slide",
                                content: "Click here to delete current slide",
                                target: "deleteSlide",
                                placement: "right"
                            }  ,

                            {
                                title: "Start recording",
                                content: "Once you have filled in the slide(s), click here to start recording your voice",
                                target: "recordVoice",
                                placement: "left"
                            }
                        ],
                        showPrevButton: false,
                        showNextButton: false
                    };
                    $scope.$emit('variablePropagation',page, _.size(presentation.presentationData),tour);

                }]);
})(angular, 'sokratik.atelier.edit');



