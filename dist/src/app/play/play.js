(function (ng, app) {
  var _executeScriptInstruction = function (fnName, delay, args, $q, presentations, fragmentsFns, dialogue) {
    return function (presentationIndex) {
      var deferred = $q.defer();
      deferred.notify('update');
      var context = { presentationIndex: presentationIndex };
      var recordedAction = function () {
        var fragments = fragmentsFns[presentationIndex]();
        _.extend(context, { dialogues: presentations }, { fragments: fragments });
        _.each(args, function (val) {
          _.extend(context, val);
        });
        if (_.size(fragments) > 0) {
          dialogue[fnName](context, deferred);
        } else {
          _.delay(recordedAction, 1000);
        }
      };
      _.delay(recordedAction, delay);
      return deferred.promise;
    };
  };
  function _executeScript(answer, $q, presentations, fragmentFns, dialogue, $log) {
    var totalSteps = _.size(answer.script);
    var currentStep = 0;
    var scriptInstructions = _.chain(answer.script).map(function (tuple) {
        return _executeScriptInstruction(tuple.fnName, tuple.delay, tuple.args, $q, presentations, fragmentFns, dialogue);
      }).value();
    var init = dialogue.showAllDialogues({
        dialogues: presentations,
        presentationIndex: 0
      }, $q.defer());
    return _.reduce(scriptInstructions, function (promiseTillNow, nextPromise) {
      return promiseTillNow.then(function (resp) {
        $log.info('Response: ' + ng.toJson(resp));
        console.log('Css' + ng.toJson(_.pluck(presentations, 'css')));
        $log.info('Remaining steps' + (totalSteps - ++currentStep));
        return nextPromise(resp.presentationIndex);
      });
    }, init);
  }
  ng.module(app, [
    'ui.router',
    'titleService',
    'plusOne',
    'sokratik.atelier.services.istari',
    'sokratik.atelier.services.dialogue',
    'ngSanitize',
    'ngAnimate'
  ]).config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider.state('play', {
        url: '/play/:presentationId',
        resolve: {
          answer: [
            '$stateParams',
            'anduril',
            function ($stateParams, anduril) {
              return anduril.fetchAnswer($stateParams.presentationId);
            }
          ]
        },
        data: { mode: 'play' },
        views: {
          'main': {
            controller: 'PlayCtrl',
            templateUrl: 'play/play.tpl.html'
          }
        }
      });
    }
  ]).controller('PlayCtrl', [
    '$stateParams',
    'anduril',
    '$scope',
    '$q',
    '$log',
    'dialogue',
    'answer',
    function ($stateParams, anduril, $scope, $q, $log, dialogue, answer) {
      $scope.presentations = answer.presentationData;
      $scope.presentationId = $stateParams.presentationId;
      $scope.audioLocation = '/recordings/' + $stateParams.presentationId + '.wav';
      var fragmentFns = [];
      var executeScript = _.after(_.size($scope.presentations), _executeScript);
      $scope.addFragment = function (fragment) {
        fragmentFns.push(fragment);
        executeScript(answer, $q, $scope.presentations, fragmentFns, dialogue, $log);
      };
    }
  ]);
}(angular, 'sokratik.atelier.player'));