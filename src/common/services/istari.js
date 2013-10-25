//this file contains services which will be used to communicate across various apps of atelier
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, [], ["$provide", function ($provide) {
        $provide.provider("anduril", andurilForger);

    }]);

    var andurilForger = function () {
        var fragments = {};
        var scripts = {};
        var _fetchVariablesForPresentationId = function (presentationId, $http, $log) {

            return fragments[presentationId];

        };

        var _initPresentation = function (presentationId, presentationMap) {
            fragments[presentationId] = presentationMap;

        };

        var _fetchPlayScriptForScriptId = function (scriptId, $http, $log) {
            if (scripts[scriptId] == null) {
                return     $http.get("static/presentations/script/" + scriptId + ".json", {cache: true})
                    .success(function (data, status, headers, config) {
                        return scripts[scriptId] = data;
                    })
                    .error(function (data, status, headers, config) {
                        $log.info("call failed getting default data");
                        return scripts[scriptId] = {};
                    });
            } else {
                return scripts[scriptId];
            }
        };

        var _getAllTemplates = function ($http, $log,deferred) {
            return $http.get("/templates/list", {cache: true})
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    $log.info("call failed getting default data");
                    deferred.resolve([]);
                });
        };

        var _recordScript = function (scriptId, tuple) {
            scripts[scriptId].push(tuple);
        };
        var _postScript = function (scriptId) {
            var script = _.sortBy(scripts[scriptId], function (tuple) {
                return tuple.delay;
            });
            var start = script[0].delay;
            _.each(script, function (tuple) {
                tuple.delay = tuple.delay - start;
            });
            scripts[scriptId] = script;
            return {scriptId: scriptId};//to do clean this up with http calls
        };
        this.$get = ["$http", "$log", "$q", function ($http, $log, $q) {
            return {
                put: function (presentationId, page, presentationMap) {
                    var templateFragment = fragments[presentationId];   //TODO fix this in a cleaner way
                    templateFragment[page] = presentationMap;
                },
                post: function (presentationId) {
//                    console.log(fragments[presentationId]);
                },
                getVar: function (presentationId, page, variable, defaultValue) {
                    var templateFragment = fragments[presentationId];   //TODO fix this in a cleaner way
                    return templateFragment[page][variable] ? templateFragment[page][variable] : defaultValue;
                },
                fetchVariablesForPresentationId: function (presentationId) {
                    return _fetchVariablesForPresentationId(presentationId, $http, $log);
                },
                getAllTemplates: function () {
                    var deferred = $q.defer();
                    _getAllTemplates($http, $log, deferred);
                    return $q.promise;
                },
                fetchScriptInstructions: function (scriptId) {
                    return _fetchPlayScriptForScriptId(scriptId, $http, $log);
                },
                recordAction: _recordScript,
                completeRecord: _postScript,
                initPresentation: _initPresentation


            };
        }
        ]
        ;
    };
})(angular, "sokratik.atelier.services.istari");
