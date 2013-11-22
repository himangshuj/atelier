var atelierPlayer = function (ng, app, answer) {
  console.log(answer._id);
  var _injectors = {};
  var fragmentFn = ng.noop;
  var _executeInstruction = function (instructions, dialogue, $state, scriptIndex, timeStamp, $q) {
    'use strict';
    if (scriptIndex < _.size(instructions)) {
      var index = scriptIndex || 0;
      var instruction = instructions[index];
      var delay = instructions[index].actionInitiated - (timeStamp || instructions[index].actionInitiated);
      var intraState = function () {
        _executeInstruction(instructions, dialogue, $state, scriptIndex++, instructions[index].actionInitiated, $q);
      };
      _.delay(function () {
        var params = _.extend({
            scriptIndex: ++scriptIndex,
            timeStamp: instruction.actionInitiated
          }, (instruction.args || {}).params);
        var postExecute = ng.equals(instruction.fnName, 'changeState') ? ng.noop : intraState;
        console.log(instruction);
        $q.when(dialogue[instruction.fnName](_.extend(instruction.args || {}, {
          'params': params,
          fragments: fragmentFn()
        }), $q.defer())).then(postExecute);
      }, delay);
    }
  };
  ng.module(app, [
    'ui.router',
    'ui.route',
    'sokratik.atelier.services.istari',
    ,
    'sokratik.atelier.services.dialogue',
    'sokratik.atelier.directives.minerva',
    'ui.bootstrap',
    'ngSanitize',
    'ngAnimate'
  ]).config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider.state('play', {
        url: '/play/:scriptIndex/:timeStamp',
        abstract: true,
        resolve: {
          instructionDetails: [
            '$stateParams',
            function ($stateParams) {
              'use strict';
              var index = $stateParams.scriptIndex || 0;
              var instruction = answer.script[index];
              var delay = answer.script[index].actionInitiated - ($stateParams.timeStamp || answer.script[index].actionInitiated);
              return {
                instruction: instruction,
                delay: delay
              };
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
      }).state('play.master', {
        url: '/master',
        views: {
          'screen': {
            templateUrl: 'play/master.tpl.html',
            controller: 'PlayMaster'
          }
        }
      }).state('play.activate', {
        url: '/activate/:page',
        views: {
          'screen': {
            templateUrl: 'play/activate.tpl.html',
            controller: 'PlayActive'
          }
        }
      }).state('play.init', {
        url: '/init',
        views: { 'audio': { controller: 'PlayAudio' } }
      });
      ;
    }
  ]).controller('PlayCtrl', [
    '$scope',
    '$stateParams',
    'dialogue',
    function ($scope, $stateParams, dialogue) {
      $scope.presentations = answer.presentationData;
      $scope.presentationId = answer._id;
      _injectors.dialogue = dialogue;
      console.log('parent');
    }
  ]).controller('PlayMaster', [
    '$scope',
    '$state',
    'dialogue',
    '$stateParams',
    '$q',
    function ($scope, $state, dialogue, $stateParams, $q) {
      'use strict';
      console.log('master');
      _executeInstruction(answer.script, dialogue, $state, $stateParams.scriptIndex, $stateParams.timeStamp, $q);
    }
  ]).controller('PlayAudio', [
    '$scope',
    '$state',
    'dialogue',
    '$stateParams',
    '$q',
    function ($scope, $state, dialogue, $stateParams, $q) {
      'use strict';
      console.log('init');
      var timeToSkip = answer.script[$stateParams.scriptIndex].actionInitiated - $stateParams.timeStamp;
      console.log(timeToSkip);
      _executeInstruction(answer.script, dialogue, $state, $stateParams.scriptIndex, $stateParams.timeStamp, $q);
    }
  ]).controller('PlayActive', [
    '$scope',
    '$state',
    '$stateParams',
    'dialogue',
    '$q',
    function ($scope, $state, $stateParams, dialogue, $q) {
      'use strict';
      var page = parseInt($stateParams.page, 10);
      console.log('activate');
      $scope.presentation = answer.presentationData[page];
      $scope.presentationId = answer._id;
      $scope.addFragment = function (fragment) {
        fragmentFn = fragment;
        function resetFragments() {
          dialogue.resetFragments({ fragments: fragmentFn() }, $q.defer());
          _executeInstruction(answer.script, dialogue, $state, $stateParams.scriptIndex, $stateParams.timeStamp, $q);
        }
        if (_.size(fragment()) > 0) {
          resetFragments();
        } else {
          _.delay(resetFragments, 1000);
        }
      };
    }
  ]);
};