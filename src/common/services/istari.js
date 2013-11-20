//this file contains services which will be used to communicate across various apps of atelier
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, ["ngResource"], ["$provide", function ($provide) {
        $provide.provider("anduril", andurilForger);

    }]);

    var andurilForger = function () {
        var fragments = {};
        var injectors = {};

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
        //given a question fetches the images for the answer
        var _fetchImages = function (questionId) {
            var deferred = injectors.$q.defer();
            injectors.$http.get("/related-images/" + questionId, {cache: true})
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function () {
                    injectors.$log.info("call failed getting images");
                    deferred.resolve([]);
                });
            return deferred.promise;
        };

        var _recordScript = function (presentationId, tuple) {
            fragments[presentationId].script.push(tuple);
        };
        var _postScript = function (presentationId) {
            //noinspection JSUnresolvedFunction
            return fragments[presentationId].$update();
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
                    //noinspection JSUnresolvedVariable
                    var templateFragment = fragments[presentationId].presentationData;   //TODO fix this in a cleaner way
                    templateFragment[page] = presentationMap;
                },
                post: function (presentationId) {
                    //noinspection JSUnresolvedFunction
                    return fragments[presentationId].$update();
                },
                getAllTemplates: _getAllTemplates,
                fetchImages: _fetchImages,
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
