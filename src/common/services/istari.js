//this file contains services which will be used to communicate across various apps of atelier
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, ["ngResource"], ["$provide", function ($provide) {
        $provide.provider("anduril", andurilForger);

    }]);

    var andurilForger = function () {
        var fragments = {};
        var scripts = {};
        var injectors = {};

        var _fetchPlayScriptForScriptId = function (scriptId, $http, $log) {
            if (scripts[scriptId] == null) {
                return     $http.get("static/presentations/script/" + scriptId + ".json", {cache: true})
                    .success(function (data) {
                        return scripts[scriptId] = data;
                    })
                    .error(function (data) {
                        $log.info("call failed getting default data");
                        return scripts[scriptId] = {};
                    });
            } else {
                return scripts[scriptId];
            }
        };

        var _getAllTemplates = function () {
            var deferred = injectors.$q.defer();
            injectors.$http.get("/templates/list", {cache: true})
                .success(function (data) {
                    deferred.resolve(_.pluck(data, "name"));
                })
                .error(function (data) {
                    injectors.$log.info("call failed getting default data");
                    deferred.resolve([]);
                });
            return deferred.promise;
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
        this.$get = ["$http", "$log", "$q", "$resource", function ($http, $log, $q, $resource) {
            injectors.$http = $http;
            injectors.$log = $log;
            injectors.$q = $q;
            injectors.$resource = $resource;
            //declaring the resource
            var Answer = $resource('/answer/:answerId', {
                answerId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });

            return {
                put: function (presentationId, page, presentationMap) {
                    var templateFragment = fragments[presentationId].presentationData;   //TODO fix this in a cleaner way
                    templateFragment[page] = presentationMap;
                },
                post: function (presentationId) {
                    fragments[presentationId].$update(function (resp) {
                    });
                },
                getVar: function (presentationId, page, variable, defaultValue) {
                    var templateFragment = fragments[presentationId].presentationData;   //TODO fix this in a cleaner way
                    return (templateFragment[page].keyVals || {})[variable] || defaultValue;
                },
                getAllTemplates: _getAllTemplates,
                fetchScriptInstructions: function (scriptId) {
                    return _fetchPlayScriptForScriptId(scriptId, $http, $log);
                },
                fetchAnswer: function (answerId) {

                    var deferred = $q.defer();
                    Answer.get({answerId: answerId}, function (answer) {
                        fragments[answerId] = _.extend(fragments[answerId] || answer, answer); //remote version wins
                        deferred.resolve(fragments[answerId]);
                    });
                    return deferred.promise;

                },
                recordAction: _recordScript,
                completeRecord: _postScript

            };
        }
        ]
        ;
    };
})(angular, "sokratik.atelier.services.istari");
