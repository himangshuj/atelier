(function (ng, app) {
  ng.module(app, ['ngResource'], [
    '$provide',
    function ($provide) {
      $provide.provider('anduril', andurilForger);
    }
  ]);
  var andurilForger = function () {
    var injectors = {};
    var _getAllTemplates = function () {
      var deferred = injectors.$q.defer();
      injectors.$http.get('/templates/list', { cache: true }).success(function (data) {
        deferred.resolve(_.pluck(data, 'name'));
      }).error(function (data) {
        injectors.$log.info('call failed getting default data');
        deferred.resolve([]);
      });
      return deferred.promise;
    };
    var _fetchImages = function (questionId) {
      var deferred = injectors.$q.defer();
      injectors.$http.get('/related-images/' + questionId, { cache: true }).success(function (data) {
        deferred.resolve(data);
      }).error(function () {
        injectors.$log.info('call failed getting images');
        deferred.resolve([]);
      });
      return deferred.promise;
    };
    var _recordScript = function (answer, tuple) {
      answer.script.push(tuple);
    };
    var _insertScript = function (answer, script) {
      answer.script = script;
    };
    var _postScript = function (answer) {
      return answer.$update();
    };
    this.$get = [
      '$http',
      '$log',
      '$q',
      '$resource',
      function ($http, $log, $q, $resource) {
        injectors.$http = $http;
        injectors.$log = $log;
        injectors.$q = $q;
        injectors.$resource = $resource;
        var Answer = $resource('/answer/:answerId', { answerId: '@_id' }, { update: { method: 'PUT' } });
        return {
          put: function (answer, page, presentationMap) {
            var templateFragment = answer.presentationData;
            templateFragment[page] = presentationMap;
            return answer;
          },
          insert: function (answer, page, presentationMap) {
            'use strict';
            var templateFragment = answer.presentationData;
            templateFragment.splice(page, 0, presentationMap);
            return answer;
          },
          remove: function (answer, page) {
            'use strict';
            var templateFragment = answer.presentationData;
            templateFragment.splice(page, 1);
            return answer;
          },
          post: function (answer) {
            return answer.$update(function (resp) {
              'use strict';
              console.log('I have updated' + ng.toJson(resp));
            });
          },
          getAllTemplates: _getAllTemplates,
          fetchImages: _fetchImages,
          fetchAnswer: function (answerId) {
            var deferred = $q.defer();
            Answer.get({ answerId: answerId }, function (answer) {
              deferred.resolve(answer);
            });
            return deferred.promise;
          },
          recordAction: _recordScript,
          completeRecord: _postScript,
          insertScript: _insertScript
        };
      }
    ];
    ;
  };
}(angular, 'sokratik.atelier.services.istari'));