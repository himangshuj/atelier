(function (ng, app) {
  ng.module(app, ['ngResource'], [
    '$provide',
    function ($provide) {
      $provide.provider('anduril', andurilForger);
    }
  ]);
  var andurilForger = function () {
    var fragments = {};
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
    var _recordScript = function (presentationId, tuple) {
      fragments[presentationId].script.push(tuple);
    };
    var _postScript = function (presentationId) {
      var script = _.sortBy(fragments[presentationId].script, function (tuple) {
          return tuple.delay;
        });
      var offset = script[0].delay;
      _.each(script, function (tuple) {
        tuple.delay = tuple.delay - offset;
        offset = tuple.delay + offset;
        console.log('original :' + offset + 'delay :' + tuple.delay);
      });
      fragments[presentationId].script = script;
      return fragments[presentationId].$update();
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
          put: function (presentationId, page, presentationMap) {
            var templateFragment = fragments[presentationId].presentationData;
            templateFragment[page] = presentationMap;
          },
          post: function (presentationId) {
            return fragments[presentationId].$update();
          },
          getAllTemplates: _getAllTemplates,
          fetchImages: _fetchImages,
          fetchAnswer: function (answerId) {
            var deferred = $q.defer();
            Answer.get({ answerId: answerId }, function (answer) {
              fragments[answerId] = _.extend(fragments[answerId] || answer, answer);
              deferred.resolve(fragments[answerId]);
            });
            return deferred.promise;
          },
          recordAction: _recordScript,
          completeRecord: _postScript
        };
      }
    ];
    ;
  };
}(angular, 'sokratik.atelier.services.istari'));