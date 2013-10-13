(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'orodruin.services.istari',
            'orodruin.services.dialogue',
            'ngSanitize'    ])

        .config(function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    presentationVars: function ($stateParams, anduril) {
                        return anduril.fetchVariablesForPresentationId($stateParams.presentationId);
                    }
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


        })
        .controller('RecordCtrl', function RecordController($scope, titleService, anduril, $stateParams, dialogue) {
            titleService.setTitle("Sokratik | " + (anduril.fetchVariablesForPresentationId($stateParams.presentationId).title || "Lets Learn"));

            var presentations = _.map(anduril.fetchVariablesForPresentationId($stateParams.presentationId), function (obj) { //todo move to clojure script
                obj.templateName = obj.templateName || "master";
                obj.css = ["slide", "ng-grid"];
                return obj;
            });
            $scope.presentations = presentations;
            dialogue.showAllDialogues({"dialogues": presentations});
        });
})(angular, "sokratik.orodruin.record");
