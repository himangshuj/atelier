/**
 * This file defines all the directives used to construct the html for the app
 */
(function (ng, app) {
    'use strict';

    var _injectors = {};

    /*   */
    /**
     * the modal which will be used to populate images
     * @type {Array} the list of angular dependencies and the modal controller
     * @private
     */
    var _imageSelectionModal = ["$scope", "$modalInstance", "images", "initImage", "initCaption",
        function ($scope, $modalInstance, images, initImage, initCaption) {
            $scope.selected = {
                image: initImage || (((images || [
                    {}
                ])[0]) || {}).url,
                caption: initCaption
            };
            $scope.imageGroups = _.chain(images).
                groupBy(function (image, index) {
                    //noinspection JSUnresolvedVariable
                    return Math.floor(index / 5);//splitting images into groups of 5
                })
                .values()
                .value();
            var ok = $scope.ok = function (selectedImage, selectedCaption) {
                $modalInstance.close({selectedImage: selectedImage, selectedCaption: selectedCaption});
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.storeImage = function ($event) {
                $event.preventDefault();
                ok($scope.selected.image, $scope.selected.caption);
            };
        }];

    /**
     * Common actions performed by all post link functions of sokratik fragment
     * @param scope the scope for the directive , this is isolated
     * @param attrs the attrs of the element
     * @param sokratikDialogueCtrl the controller of encapsulating directive
     * @private
     */
    var _fragmentCommonLink = function (scope, attrs, sokratikDialogueCtrl) {
        scope.model = {};
        scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);
        scope.model.caption = sokratikDialogueCtrl.getProperty(attrs.model + '_Caption');
        scope.model.css = ["fragment"];
        if (!_.str.isBlank(scope.model.value)) {
            sokratikDialogueCtrl.addFragment(scope.model);
        }
    };

    var editCommonLink = function (scope, attrs) {
        scope.model.value = scope.model.value || attrs.default;
        scope.model.placeholder = attrs.placeholder;
    };

    var _fragmentLink = {
        "edit": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                // Listen for change events to enable binding

                // Write data to the model
                scope.read = function () {
                    sokratikDialogueCtrl.setProperty(attrs.model, scope.model.value);
                };
                editCommonLink(scope, attrs);

            },
            "image": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                //registers the current value in the parent dialogue which is aware of the entire presentation
                editCommonLink(scope, attrs);
                scope.addImage = function () {
                    var modalInstance = _injectors.$modal.open({
                        templateUrl: 'edit/image.modal.tpl.html',
                        controller: _imageSelectionModal,
                        resolve: {
                            initCaption: function () {
                                return sokratikDialogueCtrl.getProperty(attrs.model + '_Caption');
                            },
                            initImage: function () {
                                return sokratikDialogueCtrl.getProperty(attrs.model);
                            },
                            images: function () {
                                return _injectors.anduril.fetchImages(_injectors.$stateParams.questionId);
                            }
                        }
                    });

                    modalInstance.result.then(function (selected) {
                        scope.model.value = _injectors.$sce.trustAsHtml(selected.selectedImage);
                        scope.model.caption = selected.selectedCaption;
                        sokratikDialogueCtrl.setProperty(attrs.model, selected.selectedImage);
                        sokratikDialogueCtrl.setProperty(attrs.model + '_Caption', selected.selectedCaption);
                    }, function () {
                        //noinspection JSUnresolvedFunction
                        _injectors.$log.info('Modal dismissed at: ' + new Date());
                    });
                    return modalInstance;
                };

            }

        },
        "record": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);

            },
            image: function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }
        },
        "play": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);

            },
            image: function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }

        }
    };

    var _dialogueLink = {
        "edit": function (scope) {
        },
        "record": function (scope) {
            //noinspection JSUnresolvedVariable
            (scope.addFragment || ng.noop)({fragment: scope.dialogueCtrl.getFragments });


        },
        "play": function (scope) {
            //noinspection JSUnresolvedVariable
            (scope.addFragment || ng.noop)({fragment: scope.dialogueCtrl.getFragments });

        }

    };

    var linkFn = function (scope, _element) {
        var element = _element.children()[0];
        var _stage, _splineLayer,
            _background; //only needed to listen to mouseevents
        var tension = 0.5; //controls the 'curviness' of the spline
        // refer: http://scaledinnovation.com/analytics/splines/splines.html

        var enabled = false;

        var isMouseDown = false;
        var pointStream = [];
        var intervalId, //stores result of setInterval call
            lastPoint, lastToLastPoint, //last 2 points when drawing spline
            pointCount, //increases as points are added to spline
            lastControlPoint, //meh, moar spline state
            drawingStarted; //sent as actionInitiated to recordAction

        function _onMousedown(event) {
            if (event.button === 0 && !isMouseDown && _injectors.$state.current.data.mode == "record") {
                isMouseDown = true;
                intervalId = setInterval(_extendSpline, 50);
                lastPoint = _stage.getPointerPosition();
                pointCount = 1;
                drawingStarted = new Date().getTime();
            }
        }

        function _onMouseup(event) {
            if (event.button === 0 && _injectors.$state.current.data.mode == "record") {
                isMouseDown = false;
                clearInterval(intervalId);
                _finishSpline(_stage.getPointerPosition());
            }
        }

        function _addPointToSpline(point, lastPoint, lastToLastPoint, pointCount) {
            var context = _splineLayer.getContext();

            var cp = _getControlPoints(lastPoint, lastToLastPoint, point);

            if (pointCount == 3) {
                context.beginPath();
                context.moveTo(lastToLastPoint.x, lastToLastPoint.y);
                context.quadraticCurveTo(cp[0].x, cp[0].y, lastPoint.x, lastPoint.y);
                context.setAttr('strokeStyle', 'blue');
                context.setAttr('lineWidth', 4);
                context.stroke();
            }
            else {
                context.beginPath();
                context.moveTo(lastToLastPoint.x, lastToLastPoint.y);
                context.bezierCurveTo(lastControlPoint[1].x, lastControlPoint[1].y, cp[0].x, cp[0].y, lastPoint.x, lastPoint.y);
                context.setAttr('strokeStyle', 'blue');
                context.setAttr('lineWidth', 4);
                context.stroke();
            }
            lastControlPoint = cp;
        }

        function _extendSpline() {
            if (isMouseDown) {
                var point = _stage.getPointerPosition();
                if (!!point) {
                    if (++pointCount > 2) {
                        pointStream.push({time: new Date().getTime(),
                            point: lastToLastPoint});
                        _addPointToSpline(point, lastPoint, lastToLastPoint, pointCount);
                    }
                    lastToLastPoint = lastPoint;
                    lastPoint = point;
                }
            }
        }

        function _finishSpline(point) {
            if (++pointCount > 2) {
                pointStream.push({time: new Date().getTime(),
                    point: lastPoint});
                pointStream.push({time: new Date().getTime(),
                    point: point});
                scope.recordAction({"fnName": "renderPointStream",
                    "args": {pointStream: pointStream},
                    actionInitiated: drawingStarted,
                    module: "canvas"});
                pointStream = [];
                _addPointToSpline(point, lastPoint, lastToLastPoint, pointCount);
            }
            lastToLastPoint = lastPoint;
            lastPoint = point;
        }

        function _renderSpline(pointStream, actionInitiated) {
            var lastToLastPoint = pointStream[0];
            var lastPoint = pointStream[1];
            var pointCount = 2;
            var extendSpline = function (point) {
                ++pointCount;
                _addPointToSpline(point, lastPoint, lastToLastPoint, pointCount);
                lastToLastPoint = lastPoint;
                lastPoint = point;
            };

            _.each(_.rest(pointStream, 2), function (obj) {
                _.delay(extendSpline, obj.time - actionInitiated, obj.point);
            });
        }

        function _getControlPoints(point, prevPoint, nextPoint) {
            var x1 = point.x;
            var x0 = prevPoint.x;
            var x2 = nextPoint.x;
            var y1 = point.y;
            var y0 = prevPoint.y;
            var y2 = nextPoint.y;

            var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
            var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            var fa = tension * d01 / (d01 + d12);
            var fb = tension - fa;

            var p1x = x1 + fa * (x0 - x2);
            var p1y = y1 + fa * (y0 - y2);

            var p2x = x1 - fb * (x0 - x2);
            var p2y = y1 - fb * (y0 - y2);

            return [
                {x: p1x, y: p1y},
                {x: p2x, y: p2y}
            ];
        }

        element.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        _stage = new Kinetic.Stage({
            container: element,
            width: window.innerWidth,
            height: window.innerHeight
        });

        _splineLayer = new Kinetic.Layer();
        _stage.add(_splineLayer);

        _background = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: _stage.getWidth(),
            height: _stage.getHeight(),
            opacity: 0
        });

        _splineLayer.add(_background);
        _splineLayer.draw();

        _background.on('click', function (e) {
            if (!enabled && _injectors.$state.current.data.mode == "record") {
                scope.makeVisible();
            }
        });

        _injectors.canvas.registerMethods(
            {enableCanvas: function (enable) {
                enabled = enable;
                if (enable) {
                    _background.on('mousedown', _onMousedown);
                    _background.on('mouseup', _onMouseup);
                } else {
                    _background.off('mousedown');
                    _background.off('mouseup');
                }
            },

                renderPointStream: function (args) {
                    _renderSpline(args.pointStream, args.params.timeStamp);
                }
            });
    };

    var _canvasLink = {
        "record": linkFn,
        "play": linkFn
    };

    var _sokratikFragmentDirective = ["$state", "$sce", "anduril", "$stateParams", "$modal",
        function ($state, $sce, anduril, $stateParams, $modal) {
            _injectors.$sce = $sce;
            _injectors.anduril = anduril;
            _injectors.$modal = $modal;
            _injectors.$stateParams = $stateParams;
            return {
                "restrict": "E",
                "transclude": true,
                "templateUrl": function (tElement, tAttrs) {
                    return $state.current.data.mode + "/" + ng.lowercase(tAttrs.type || "text") + ".fragment.tpl.html";
                },
                require: "^sokratikDialogue",
                "scope": {
                    "model": "="
                },
                compile: function (tElement, tAttrs) {
                    return {pre: _fragmentLink[$state.current.data.mode][ng.lowercase(tAttrs.type || "text")]};
                }

            };

        }];
    var _sokratikDialogueContainerDirective = ["$state", "dialogue", "$q", "anduril",
        function ($state, dialogue, $q, anduril) {
            _injectors.$q = $q;
            _injectors.dialogue = dialogue;
            _injectors.anduril = anduril;
            _injectors.$state = $state;
            return {
                restrict: "E",
                templateUrl: function () {
                    return $state.current.data.mode + "/dialogue.tpl.html";
                },
                scope: {
                    makeVisible: "=",
                    recordAction: "=",
                    presentation: "=",
                    index: "@",
                    presentationId: "@",
                    addFragment: "&?",
                    questionId: "@?"
                },

                controller: "DialogueController",
                controllerAs: "dialogueCtrl",
                compile: function () {
                    return _dialogueLink[$state.current.data.mode];
                }
            };

        }];

    var _sokratikCanvasDirective = ["$state", "canvas", function ($state, canvas) {
        _injectors.canvas = canvas;
        _injectors.$state = $state;
        return {
            restrict: "E",
            templateUrl: function () {
                return $state.current.data.mode + "/canvas.tpl.html";
            },
            compile: function () {
                return _canvasLink[$state.current.data.mode];
            }
        };

    }];

    ng.module(app, ['sokratik.atelier.istari.services',
            'sokratik.atelier.minerva.services',
            'sokratik.atelier.canvas.services',
            'ui.bootstrap',
            'templates-app'
        ])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective)
        .directive("sokratikCanvas", _sokratikCanvasDirective)
        .controller("DialogueController", ["$scope", function ($scope) {
            $scope.templateName = "templates/" + ($scope.presentation.templateName || "imageText") + ".tpl.html";
            $scope.currentFragmentIndex = 0;
            var dialogueFragments = [];
            this.addFragment = function (dialogueFragment) {
                dialogueFragments = _.chain(dialogueFragments)
                    .union(dialogueFragment)
                    .flatten()
                    .value();
            };
            this.getProperty = function (propertyKey, defaultValue) {
                return ($scope.presentation.keyVals || {})[propertyKey] || defaultValue;
            };

            this.setProperty = function (propertyKey, value) {
                ($scope.presentation.keyVals || {})[propertyKey] = value;
            };
            this.getFragments = function () {
                return dialogueFragments;//returns a shallow copy
            };
        }]);
})(angular, "sokratik.atelier.minerva.directives");
