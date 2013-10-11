(function (ng, app) {
    var _extractFunctionName = function (fnName, delay, args, $scope, $q) {
        return function () {
            var deferred = $q.defer();
            deferred.notify("update");
            _.delay(function () {
                $scope.script = fnName;
                deferred.resolve(" Funcation : " + fnName + " Delay: " + delay);
            }, delay);
            return deferred.promise;
        };
    };

    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'orodruin.services.istari',
            'orodruin.services.dialogue',
            'ngSanitize' ])
        .config(function config($stateProvider) {
            $stateProvider.state('play', {
                url: '/play/:presentationId/:scriptId',
                resolve: {
                    presentationVars: function ($stateParams, anduril) {
                        return anduril.fetchVariablesForPresentationId($stateParams.presentationId);
                    },
                    scriptInstructions: function ($stateParams, anduril) {
                        return anduril.fetchScriptInstructions($stateParams.scriptId);
                    }
                },
                data: {
                    mode: "play"
                },
                views: {
                    "main": {
                        controller: 'PlayCtrl',
                        templateUrl: 'play/play.tpl.html'
                    }
                }
            });
        })
        .controller("PlayCtrl", function PlayController($stateParams, anduril, $scope, $q, $log) {
            var scriptInstructions =
                _.chain(anduril.fetchScriptInstructions($stateParams.scriptId))
                    .map(function (tuple) {
                        return  _extractFunctionName(tuple.fn, tuple.delay, tuple.args, $scope, $q);
                    }).value();
             var deferred = scriptInstructions[0]();
            var reducedForm = _.reduce(_.toArray(scriptInstructions).slice(1),function (promiseTillNow, nextPromise) {
                return promiseTillNow.then(
                    function (resp) {
                        $log.info("Executed" + resp);
                        return nextPromise();
                    }
                );
            },deferred);

            console.log(reducedForm);
            $scope.script = "starting";


        });

})(angular, "sokratik.orodruin.player");