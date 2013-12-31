(function (ng, app) {


    var _videoModalCtrl = ["$scope", "$modalInstance", "$sce", "existingVideo", function ($scope, $modalInstance, $sce, existingVideo) {


        $scope.ok = function (selectedMedia) {
            var videoId = (selectedMedia || "watch?v=").split("watch?v=")[1];
            $modalInstance.close(videoId);
        };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


        var player;
        var videoId = ((existingVideo || {}).params || {}).videoId;

        $scope.selectedMedia = "http://www.youtube.com/watch?v=" + videoId;

        _.defer(function () {
            player = new YT.Player("player", {
                playerVars: { 'autoplay': 1, 'controls': 0 },
                height: '300',
                width: '640',
                videoId: videoId
            });
        });

        $scope.renderYT = function (selectedMedia) {
            var videoId = (selectedMedia || "watch?v=").split("watch?v=")[1];
            _.defer(function () {
                player.loadVideoById(videoId, 0, "large");
            });
        };

    }];
    ng.module(app, [
            'ui.router',
            'sokratik.atelier.minerva.directives',
            'ngSanitize'
        ])

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('edit', {
                url: '/edit/:questionId/:templateName/:presentationId/:page/:images',
                resolve: {

                    page: ["$stateParams", function ($stateParams) {
                        //noinspection JSUnresolvedFunction
                        return parseInt($stateParams.page ? $stateParams.page : 0, 10);
                    }],
                    presentation: ["anduril", "$stateParams", function (anduril, $stateParams) {
                        return anduril.fetchPresentation($stateParams.presentationId);
                    }],
                    images: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return [];
                        // return anduril.fetchImages($stateParams.questionId);
                    }]
                },
                data: {
                    mode: "edit"
                },
                views: {
                    "main": {
                        templateUrl: "edit/edit.tpl.html",
                        controller: 'EditController'
                    }
                },
                parent: 'root'
            })
                .state("edit.template", {
                    url: '/',
                    views: {
                        "template": {
                            templateUrl: "edit/template.tpl.html",
                            controller: 'TemplateCtrl'
                        }
                    }
                });

        }])

        .controller('EditController',
            ["$scope", "page", "$stateParams", "presentation", "anduril", "$state", "$modal", "$log",
                function ($scope, page, $stateParams, presentation, anduril, $state, $modal, $log) {
                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
                    var presentationId = $stateParams.presentationId;
                    $scope.presentationId = presentationId;
                    var activePresentation = $scope.presentation = presentation.presentationData[page] || ng.copy(presentation.presentationData[page - 1]);
                    $scope.totalPages = _.size(presentation.presentationData);
                    $scope.presentation.keyVals = _.extend({}, $scope.presentation.keyVals);
                    anduril.put(presentation, page, $scope.presentation);
                    var images = $stateParams.images || 1;
                    $scope.images = images;
                    $scope.presentation.templateName = $scope.presentation.templateName || (images + $stateParams.templateName);
                    page = parseInt(page, 10);
                    $scope.record = function () {
                        anduril.post(presentation);
                        $state.go("record.activate",{page:0});

                    };

                    $scope.goToPage = function (page) {
                        "use strict";
                        anduril.post(presentation);
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    };
                    $scope.remove = function () {
                        "use strict";
                        anduril.post(anduril.remove(presentation, page));
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page - 1});
                    };
                    var changeTemplates = function (images) {
                        anduril.changeTemplate(presentation, page, images + "imageText");
                        anduril.post(presentation);
                        $state.go("edit.template", { images: images, templateName: "imageText"});

                    };
                    $scope.increaseImages = function () {
                        changeTemplates((++images) % 5);
                    };
                    $scope.decreaseImages = function () {
                        if (images > 0) {
                            changeTemplates(--images);
                        }
                    };
                    $scope.add = function () {
                        anduril.insert(presentation, page + 1, {templateName: '1imageText'});
                        anduril.post(presentation);
                        $state.go("edit.template", { "page": page + 1, templateName: 'imageText', images: 1});
                    };

                    $scope.addVideo = function () {
                        var modalInstance = $modal.open({
                            templateUrl: 'edit/yt.modal.tpl.html',
                            controller: _videoModalCtrl,
                            resolve: {
                                existingVideo: function () {
                                    activePresentation.apps = activePresentation.apps || [];
                                    return _.findWhere(activePresentation.apps, {name: "YT"});
                                }
                            }
                        });
                        activePresentation.apps = activePresentation.apps || {};
                        var existingVideo = _.findWhere(activePresentation.apps, {name: "YT"}) || {name: "YT"};
                        modalInstance.result.then(function (ytEmbedUrl) {
                            activePresentation.apps = _.without(activePresentation.apps, existingVideo);
                            existingVideo.params = {"videoId": ytEmbedUrl};
                            activePresentation.apps = _.union(activePresentation.apps, existingVideo);
                            presentation = anduril.put(presentation, page, activePresentation);
                        }, function () {
                            //noinspection JSUnresolvedFunction
                        });
                        return modalInstance;
                    };
                }])
        .controller('TemplateCtrl', ['$rootScope', function TemplateController($rootScope) {
            $rootScope.showCase = false;
            $rootScope.hideMenu = true;
        }]);
})(angular, "sokratik.atelier.edit");



