//this file contains services which will be used to communicate across various apps of atelier
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, ["ngResource"], ["$provide", function ($provide) {
        $provide.provider("anduril", andurilForger);

    }]);
    var _cache = {};

    var andurilForger = function () {
        var injectors = {};
        //given a question fetches the images for the presentation
        var _fetchImages = function (questionId) {
            var deferred = injectors.$q.defer();
            injectors.$http.get("/related-images/" + questionId, {cache: true})
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function () {
                    deferred.resolve([]);
                });
            return deferred.promise;
        };

        var _recordScript = function (presentation, tuple) {
            if (!!tuple) {
                presentation.script.push(tuple);
            }
        };

        var _insertScript = function (presentation, script) {
            presentation.script = script;
            return presentation;
        };
        var _postScript = function (presentation) {
            //noinspection JSUnresolvedFunction
            _cache[presentation._id] = presentation;
            presentation.recorded = true;
            return presentation.$update();
        };
        var sanitizeRequestBody = function (presentation) {
            var script = _.without(presentation.script, null);
            var presentationData = _.without(presentation.presentationData,null);
            var retVal = _.chain(presentation).omit('__v').extend({script: script, presentationData: presentationData}).value();
            return retVal;
        };
        this.$get = ["$http", "$log", "$q", "$resource", function ($http, $log, $q, $resource) {
            injectors.$http = $http;
            injectors.$log = $log;
            injectors.$q = $q;
            injectors.$resource = $resource;
            //declaring the resource
            var presentation = $resource('/presentation/:presentationId', {
                presentationId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });

            return {
                put: function (presentation, page, presentationMap) {
                    //noinspection JSUnresolvedVariable
                    var templateFragment = presentation.presentationData;
                    templateFragment[page] = _.clone(presentationMap);
                    return presentation;
                },
                insert: function (presentation, page, presentationMap) {
                    "use strict";
                    var templateFragment = presentation.presentationData;
                    templateFragment.splice(page, 0, presentationMap);
                    return presentation;

                },
                changeTemplate: function (presentation, page, templateName) {
                    "use strict";
                    var templateFragment = presentation.presentationData;
                    templateFragment[page].templateName = templateName;
                    return presentation;
                },
                remove: function (presentation, page) {
                    "use strict";
                    var templateFragment = presentation.presentationData;
                    templateFragment.splice(page, 1);
                    return presentation;
                },
                post: function (presentation) {
                    //noinspection JSUnresolvedFunction
                    var deferred = $q.defer();
                    var sanitizedPresentation = sanitizeRequestBody(presentation);
                    _cache[presentation._id] = sanitizedPresentation;
                    sanitizedPresentation.$update(function () {
                        deferred.resolve(sanitizedPresentation);

                    });
                    return deferred.promise;
                },
                fetchImages: _fetchImages,
                fetchPresentation: function (presentationId) {
                    var deferred = $q.defer();
                    if (_cache[presentationId]) {
                        deferred.resolve(_cache[presentationId]);
                    } else {
                        presentation.get({presentationId: presentationId}, function (presentation) {
                            _cache[presentationId] = presentation;
                            deferred.resolve(presentation);
                        });
                    }
                    return deferred.promise;

                },
                recordAction: _recordScript,
                completeRecord: _postScript,
                insertScript: _insertScript,
                clearCache: function () {
                    _cache = {};
                }
            };
        }
        ]
        ;
    };
})(angular, "sokratik.atelier.istari.services");
