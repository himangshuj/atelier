/* This file defines all the directives used to control the audio, there are two types of audio main track and
background
*/
(function (ng, app) {
    'use strict';
    var _sokratikAudioTrack = ["apollo",
        function (apollo) {
            return {
                "restrict": "A",
                "transclude": true,
                "template":"<div ng-transclude></div>" ,
                compile: function (tElement) {
                    apollo.addMainAudio(ng.element(tElement)[0]);
                }

            };
        }];
    ng.module(app, ['sokratik.atelier.services.apollo'])
        .directive("sokratikAudioTrack", _sokratikAudioTrack);
})(angular,"sokratik.atelier.directives.apollo");