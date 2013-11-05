(function (ng, app) {
  var dialogueService = function () {
    var _changeSingleDialogue = function (presentationDialogues, index, classToAdd, classToRemove) {
      _.each(presentationDialogues, function (presentationDialog) {
        presentationDialog.css = _.without(presentationDialog.css, classToAdd);
      });
      presentationDialogues[index].css = _.chain(presentationDialogues[index].css).union([classToAdd]).without(classToRemove).value();
      return presentationDialogues;
    };
    var _changeAllDialogues = function (presentationDialogues, classToAdd, classToRemove) {
      return _.map(presentationDialogues, function (presentationDialog) {
        presentationDialog.css = _.chain(presentationDialog.css).without(classToRemove).union([classToAdd]).value();
      });
    };
    var _changeFragmentClass = function (fragment, classToAdd, classToRemove) {
      fragment.css = _.chain(fragment.css).without(classToRemove).union(classToAdd).value();
      return fragment;
    };
    this.$get = function () {
      return {
        zoom: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _.delay(function () {
            _changeSingleDialogue(context.dialogues, context.page, 'zoom-in', 'zoom-out');
            deferred.resolve({
              'fnName': 'zoom',
              'args': [{ 'page': context.page }],
              delay: actionInitiated,
              presentationIndex: context.page
            });
          });
          return deferred.promise;
        },
        showAllDialogues: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _.delay(function () {
            _changeAllDialogues(context.dialogues, 'zoom-out', 'zoom-in');
            deferred.resolve({
              'fnName': 'showAllDialogues',
              'args': [],
              delay: actionInitiated,
              presentationIndex: context.presentationIndex
            });
          });
          return deferred.promise;
        },
        nextFragment: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _changeFragmentClass(context.fragments[context.index], 'visible', '');
          _.delay(function () {
            deferred.resolve({
              'fnName': 'nextFragment',
              'args': [{ 'index': context.index }],
              delay: actionInitiated,
              presentationIndex: context.presentationIndex
            });
          });
          return deferred.promise;
        },
        prevFragment: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _changeFragmentClass(context.fragments[context.index], 'fragment', 'visible');
          _.delay(function () {
            deferred.resolve({
              'fnName': 'prevFragment',
              'args': [{ 'index': context.index }],
              delay: actionInitiated,
              presentationIndex: context.presentationIndex
            });
          });
          return deferred.promise;
        },
        resetFragments: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _changeAllDialogues(context.fragments, 'fragment', 'visible');
          _.delay(function () {
            deferred.resolve({
              'fnName': 'resetFragments',
              'args': [],
              delay: actionInitiated,
              presentationIndex: context.presentationIndex
            });
          });
          return deferred.promise;
        }
      };
    };
  };
  ng.module(app, [], [
    '$provide',
    function ($provide) {
      $provide.provider('dialogue', dialogueService);
    }
  ]);
}(angular, 'sokratik.atelier.services.dialogue'));