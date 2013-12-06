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
        $scope.selectedMedia = "http://www.youtube.com/watch?v=" + ((existingVideo || {}).params || {}).videoId;
        _.defer(function () {
            player = new YT.Player("player", {
                playerVars: { 'autoplay': 1, 'controls': 0 },
                videoId: existingVideo.params.videoId,
                height: '300',
                width: '640'
            });
        });


        $scope.renderYT = function (selectedMedia) {
            var videoId = (selectedMedia || "watch?v=").split("watch?v=")[1];
            _.defer(function () {
                console.log(videoId);
                player.loadVideoById(videoId, 0, "large");
            });
        };

    }];
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.directives.minerva',
            'sokratik.atelier.services.istari',
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
                    answer: ["anduril", "$stateParams", function (anduril, $stateParams) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }],
                    images: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchImages($stateParams.questionId);
                    }]
                },
                data: {
                    mode: "edit"
                },
                views: {
                    "main": {
                        templateUrl: "edit/edit.tpl.html",
                        controller: 'EditCtrl'
                    }
                }
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

        .controller('EditCtrl',
            ["$scope", "page", "$stateParams", "answer", "anduril", "$state", "$modal", "$log",
                function ($scope, page, $stateParams, answer, anduril, $state, $modal, $log) {
                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
                    var presentationId = $stateParams.presentationId;
                    $scope.presentationId = presentationId;
                    var activePresentation = $scope.presentation = answer.presentationData[page] || ng.copy(answer.presentationData[page - 1]);
                    $scope.totalPages = _.size(answer.presentationData);
                    $scope.presentation.keyVals = _.extend({}, $scope.presentation.keyVals);
                    anduril.put(answer, page, $scope.presentation);
                    var images = $stateParams.images || 1;
                    $scope.images = images;
                    $scope.presentation.templateName = $scope.presentation.templateName || (images + $stateParams.templateName);
                    $scope.presentation.css = [""];
                    $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    page = parseInt(page, 10);
                    $scope.resume = function () {
                        anduril.post(answer);
                        $state.go("record.master");

                    };

                    $scope.goToPage = function (page) {
                        "use strict";
                        anduril.post(answer);
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    };
                    $scope.remove = function () {
                        "use strict";
                        anduril.post(anduril.remove(answer, page));
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page - 1});
                    };
                    var changeTemplates = function (images) {
                        anduril.changeTemplate(answer, page, images + "imageText");
                        anduril.post(answer);
                        $state.go("edit", { images: images, templateName: "imageText"});
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
                        anduril.insert(answer, page + 1, {templateName: '1imageText'});
                        anduril.post(answer);
                        console.log("hello");
                        $state.go("edit", { "page": page + 1, templateName: 'imageText', images: 1});
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
                            answer = anduril.put(answer, page, activePresentation);
                        }, function () {
                            //noinspection JSUnresolvedFunction
                            $log.info('Modal dismissed at: ' + new Date());
                        });

                    };
                }])
        .controller('TemplateCtrl', function TemplateController() {
        });
})(angular, "sokratik.atelier.edit");



