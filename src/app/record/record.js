(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.kamillion.services.istari',
            'sokratik.kamillion.services.dialogue',
            'ngSanitize',
            'ngAnimate'])

        .config(function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId/:scriptId',
                resolve: {
                    presentationVars: function ($stateParams, anduril) {
                        return anduril.fetchVariablesForPresentationId($stateParams.presentationId);
                    },
                    scriptId: function ($stateParams) {
                        return $stateParams.scriptId || "init";
                    },
                    scriptVars: function (anduril, scriptId) {
                        return anduril.fetchScriptInstructions(scriptId);
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
        .controller('RecordCtrl', function RecordController($scope, titleService, anduril, $stateParams, dialogue, $q, scriptId, $state) {
            titleService.setTitle("Sokratik | " + (anduril.fetchVariablesForPresentationId($stateParams.presentationId).title || "Lets Learn"));
            var presentations = _.map(anduril.fetchVariablesForPresentationId($stateParams.presentationId), function (obj) { //todo move to clojure script
                obj.templateName = obj.templateName || "master";
                obj.css = ["slide", "base"];
                return obj;
            });
            $scope.presentations = presentations;
            $scope.scriptId = scriptId;
            $scope.play = function () {
                $q.when(anduril.completeRecord(scriptId))
                    .then(function (resp) {
                        $state.go("play", {presentationId: $stateParams.presentationId,
                            scriptId: resp.scriptId});
                    });
            };
            dialogue.showAllDialogues({"dialogues": presentations}, $q.defer());
        });
})(angular, "sokratik.kamillion.record");
