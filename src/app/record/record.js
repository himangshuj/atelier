(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.services.istari',
            'sokratik.atelier.services.dialogue',
            'ngSanitize',
            'ngAnimate'])

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    answer: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }]
                },
                data: {
                    mode: "record"
                },
                views: {
                    "main": {
                        controller: 'RecordCtrl',
                        templateUrl: 'record/record.tpl.html'
                    }
                }
            })

            ;


        }])
        .controller('RecordCtrl', ["$scope", "titleService", "anduril", "$stateParams", "answer", "$q", "$state", "dialogue",
            function ($scope, titleService, anduril, $stateParams, answer, $q, $state, dialogue) {
                titleService.setTitle("Sokratik | " + (answer.title || "Lets Learn"));

                var presentations = _.map(answer.presentationData, function (obj) { //todo move to clojure script
                    obj.templateName = obj.templateName || "master";
                    obj.css = ["slide"];
                    return obj;
                });
                $scope.presentations = presentations;
                $scope.presentationId = answer._id;
                $scope.play = function () {
                    $q.when(anduril.completeRecord(answer._id))
                        .then(function (resp) {
                        });
                    $state.go("play", {presentationId: answer._id});

                };
                dialogue.showAllDialogues({"dialogues": presentations}, $q.defer());
            }]);
})(angular, "sokratik.atelier.record");
