(function (ng, app) {
    var _executeScriptInstruction = function (fnName, delay, args, $q, presentations, fragmentsFns, dialogue) {
        return function (presentationIndex) {
            var deferred = $q.defer();
            deferred.notify("update");
            var context = {presentationIndex: presentationIndex};
            var recordedAction = function () {
                var fragments = fragmentsFns[presentationIndex]();
                _.extend(context, {dialogues: presentations}, {fragments: fragments});
                _.each(args, function (val) {
                        _.extend(context, val);
                    }
                );
                if (_.size(fragments) > 0) {  //TODO tie this properly with fragments in presentation
                    dialogue[fnName](context, deferred);//dialogue should resolve this
                } else {
                    _.delay(recordedAction, 1000);//dom is not yet ready retry after 1000 ms
                }
            };
            _.delay(recordedAction, delay);
            return deferred.promise;
        };
    };

    function _executeScript(anduril, $stateParams, $q, presentations, fragmentFns, dialogue, $log) {
        var scriptInstructions =
            _.chain(anduril.fetchScriptInstructions($stateParams.scriptId))
                .map(function (tuple) {
                    return  _executeScriptInstruction(tuple.fnName, tuple.delay, tuple.args, $q, presentations, fragmentFns, dialogue);
                }).value();
        var deferred = _.first(scriptInstructions)(0);
        return _.reduce(_.rest(scriptInstructions), function (promiseTillNow, nextPromise) {
            return promiseTillNow.then(
                function (resp) {
                    return nextPromise(resp.presentationIndex);
                }
            );
        }, deferred);
    }

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
        .controller("PlayCtrl", function PlayController($stateParams, anduril, $scope, $q, $log, dialogue) {
            $scope.presentations = anduril.fetchVariablesForPresentationId($stateParams.presentationId);
            $scope.scriptId = $stateParams.scriptId;
            var fragmentFns = [];
            var executeScript = _.after(_.size($scope.presentations), _executeScript); //this has to be executed only after all the fragments are populated
            $scope.addFragment = function (fragment) {
                fragmentFns.push(fragment);
                executeScript(anduril, $stateParams, $q, $scope.presentations, fragmentFns, dialogue, $log);
            };
        });

})(angular, "sokratik.orodruin.player");