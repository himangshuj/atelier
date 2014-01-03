/* This file contains our canvas' dom manipulation code
 */
(function (ng, app) {
    'use strict';

    var canvasService = function () {
        var _methods = {enableCanvas: ng.noop, renderPointStream: ng.noop};

        this.$get = function () {
            return {
                registerMethods: function (methods) {
                    _methods = methods;
                },

                enableCanvas: function (enable) {
                    _methods.enableCanvas(enable);
                },

                renderPointStream: function (args) {
                    _methods.renderPointStream(args);
                },
                deRegisterMethods: function () {
                    _methods = {enableCanvas: ng.noop, renderPointStream: ng.noop};
                }
            };
        };

    };

    ng.module(app, [], ["$provide", function ($provide) {

        $provide.provider("canvas", canvasService);
    }]);
})(angular, "sokratik.atelier.canvas.services");
