/* This file contains our canvas' dom manipulation code
 */
(function (ng, app) {
    'use strict';

    var canvasService = function () {
        var _methods;

        this.$get = function () {
            return {
                registerMethods: function (methods) {
                    _methods = methods;
                },

                enableCanvas: function (enable) {
                    _methods.enableCanvas(enable);
                },

                renderPointStream: function (args) {
                    console.log("renderPointStream called with ",
                                args.pointStream.length, " points.");
                    _methods.renderPointStream(args);
                }
            };
        };
    };

    ng.module(app, [], ["$provide", function ($provide) {

        $provide.provider("canvas", canvasService);
    }]);
})(angular, "sokratik.atelier.canvas.services");
