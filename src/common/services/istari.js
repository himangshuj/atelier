//this file contains services which will be used to communicate across various apps of KAMillion
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, [], function ($provide) {
        $provide.provider("anduril", andurilForger);

    });

    var andurilForger = function () {
        var fragments = {};
        var scripts = {};
        var fetchVariablesForPresentationId = function (presentationId, $http, $log) {
            if (fragments[presentationId] == null) {
                return     $http.get("assets/presentations/data/" + presentationId + ".json", {cache: true})
                    .success(function (data, status, headers, config) {
                        return fragments[presentationId] = data;
                    })
                    .error(function (data, status, headers, config) {
                        $log.info("call failed getting default data");
                        return fragments[presentationId] = {};
                    });
            } else {
                return fragments[presentationId];
            }
        };

        var _fetchPlayScriptForScriptId = function (scriptId, $http, $log) {
            if (scripts[scriptId] == null) {
                return     $http.get("assets/presentations/script/" + scriptId + ".json", {cache: true})
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

        var _getAllTemplates = function ($http, $log) {
            return $http.get("assets/presentations/data/templates.json", {cache: true})
                .success(function (data, status, headers, config) {
                    return data;
                })
                .error(function (data, status, headers, config) {
                    $log.info("call failed getting default data");
                    return [];
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
        this.$get = ["$http", "$log", function ($http, $log) {
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
                    return fetchVariablesForPresentationId(presentationId, $http, $log);
                },
                getAllTemplates: function () {
                    return   _getAllTemplates($http, $log);
                },
                fetchScriptInstructions: function (scriptId) {
                    return _fetchPlayScriptForScriptId(scriptId, $http, $log);
                },
                recordAction: _recordScript,
                completeRecord: _postScript


            };
        }
        ]
        ;
    };
})(angular, "sokratik.kamillion.services.istari");
