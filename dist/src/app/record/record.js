(function (ng, app) {
  ng.module(app, [
    'ui.router',
    'titleService',
    'plusOne',
    'sokratik.atelier.services.istari',
    'sokratik.atelier.services.dialogue',
    'sokratik.atelier.services.acoustics',
    'ngSanitize',
    'ngAnimate'
  ]).config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider.state('record', {
        url: '/record/:presentationId',
        resolve: {
          answer: [
            '$stateParams',
            'anduril',
            function ($stateParams, anduril) {
              return anduril.fetchAnswer($stateParams.presentationId);
            }
          ],
          audioNode: [
            'acoustics',
            function (acoustics) {
              return acoustics.getAudioNode();
            }
          ],
          stream: [
            'acoustics',
            '$stateParams',
            function (acoustics, $stateParams) {
              return acoustics.stream($stateParams.presentationId);
            }
          ]
        },
        data: { mode: 'record' },
        views: {
          'main': {
            controller: 'RecordCtrl',
            templateUrl: 'record/record.tpl.html'
          }
        }
      });
      $stateProvider.state('record.master', {
        url: '/master',
        views: {
          'workspace': {
            controller: 'RecordMaster',
            templateUrl: 'record/master.tpl.html'
          }
        }
      });
      $stateProvider.state('record.activate', {
        url: '/activate/:page',
        views: {
          'workspace': {
            controller: 'RecordDialogue',
            templateUrl: 'record/active.tpl.html'
          }
        }
      });
    }
  ]).controller('RecordCtrl', [
    '$scope',
    'acoustics',
    'audioNode',
    '$state',
    'anduril',
    '$q',
    'stream',
    function ($scope, acoustics, audioNode, $state, anduril, $q, stream) {
      $scope.record = function () {
        $scope.recording = true;
        acoustics.resume(audioNode, stream);
      };
      $scope.play = function () {
        acoustics.stopRecording(audioNode, stream, answer._id);
        $q.when(anduril.completeRecord(answer._id)).then(function (resp) {
        });
        $state.go('play', { presentationId: answer._id });
      };
      $scope.pause = function () {
        acoustics.pause(audioNode, stream);
        $scope.recording = false;
      };
      $scope.recording = true;
    }
  ]).controller('RecordMaster', [
    '$scope',
    'answer',
    'acoustics',
    'audioNode',
    'stream',
    function ($scope, answer, acoustics, audioNode, stream) {
      $scope.presentations = _.map(answer.presentationData, function (obj) {
        obj.templateName = obj.templateName || 'master';
        return obj;
      });
      $scope.presentationId = answer._id;
      acoustics.resume(audioNode, stream);
    }
  ]).controller('RecordDialogue', [
    '$scope',
    'answer',
    'anduril',
    'dialogue',
    '$stateParams',
    '$q',
    function ($scope, answer, anduril, dialogue, $stateParams, $q) {
      $scope.presentation = answer.presentationData[parseInt($stateParams.page || 0, 10)];
      dialogue.resetFragments({ fragments: $scope.presentation }, $q.defer()).then(function (resp) {
        console.log(resp);
      });
    }
  ]);
  ;
}(angular, 'sokratik.atelier.record'));