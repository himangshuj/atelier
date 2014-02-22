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
        //noinspection JSUnresolvedFunction
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
        scope.clicked = false;

        scope.$on('hideWalkThrough', function (event, walkThroughStage) {
            scope.walkthroughActive = false;
            scope.walkThroughStage = walkThroughStage;

        });
        var i = 0;
        scope.emitShowWalkThrough = _.once(function (stage) {
            scope.$emit('showWalkThrough', stage);
            scope.walkthroughActive = false;
        });
        scope.haltAutoAdvance = function () {
            scope.$emit('haltAutoAdvance', false);
        };
    };

    var _fragmentLink = {
        "edit": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                // Listen for change events to enable binding


                // Write data to the mode
                scope.read = function () {
                    sokratikDialogueCtrl.setProperty(attrs.model, scope.model.value);
                    if (scope.walkthroughActivated) {
                        if(attrs.model === 'title'){
                            scope.emitShowWalkThrough(1);
                        }
                    }
                };

                editCommonLink(scope, attrs);

                    scope.walkthroughActive = true;
                    scope.walkthroughActivated = true;


            },
            "image": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                //registers the current value in the parent dialogue which is aware of the entire presentation
                editCommonLink(scope, attrs);
                scope.$on('showWalkThroughDirective', function (event, stage) {
                    scope.walkthroughActive = stage == 2;
                    scope.walkthroughActivated = stage == 2 || scope.walkthroughActivated;
                });
                scope.addImage = function () {
                    scope.haltAutoAdvance();
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
                        console.log(scope.walkthroughActivated);
                        if (scope.walkthroughActivated) {
                            scope.emitShowWalkThrough(2);
                        }
                        sokratikDialogueCtrl.setProperty(attrs.model, selected.selectedImage);
                        sokratikDialogueCtrl.setProperty(attrs.model + '_Caption', selected.selectedCaption);
                    }, function () {
                        //noinspection JSUnresolvedFunction
                        if (scope.walkthroughActivated) {
                            scope.emitShowWalkThrough(2);
                        }
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

    var _sokratikFragmentDirective = ["$state", "$sce", "anduril", "$stateParams", "$modal", "$log",
        function ($state, $sce, anduril, $stateParams, $modal, $log) {
            _injectors.$sce = $sce;
            _injectors.anduril = anduril;
            _injectors.$modal = $modal;
            _injectors.$stateParams = $stateParams;
            _injectors.$log = $log;
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
    var _sokratikDialogueContainerDirective = ["$state", "dialogue", "$q", "anduril", "$log",
        function ($state, dialogue, $q, anduril, $log) {
            _injectors.$q = $q;
            _injectors.dialogue = dialogue;
            _injectors.anduril = anduril;
            _injectors.$state = $state;
            _injectors.$log = $log;
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

    var _sokratikImageUploadDirective = ['$q', '$state', '$window', '$http', '$location', function ($q, $state, $window, $http, $location) {
        var URL = $window.URL || $window.webkitURL;
        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };
        var resizeImage = function (origImage, options, canvas) {
            var maxHeight = 400;
            var maxWidth = 600;
            var quality = 0.7;
            var type = 'image/jpg';
            var deferred = $q.defer();

            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            //draw image on canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(origImage, 0, 0, width, height);
            canvas.toBlob(
                function (blob) {
                    deferred.resolve(blob);
                },
                'image/jpeg'
            );

            return deferred.promise;
        };

        var createImage = function (url, callback) {
            var image = new Image();
            image.onload = function () {
                callback(image);
            };
            image.src = url;
        };
        return {
            restrict: "E",
            templateUrl: function () {
                return $state.current.data.mode + "/image-upload.tpl.html";
            },
            scope: {
                caption: '=',
                url: '='

            },
            link: function (scope, element, attrs) {
                var canvas = ng.element(element).find('canvas')[0];
                var image = ng.element(element).find('input');
                var doResizing = function (imageResult) {
                    var deferred = $q.defer();
                    createImage(imageResult.url, function (image) {
                        resizeImage(image, scope, canvas).then(function (blob) {
                            deferred.resolve(blob);
                        });
                    });
                    return deferred.promise;
                };
                image.bind('change', function (evt) {
                    var file = evt.target.files[0];
                    var imageResult = {
                        file: file,
                        url: URL.createObjectURL(file)
                    };
                    fileToDataURL(file).then(function (dataURL) {
                        imageResult.dataURL = dataURL;
                    });
                    doResizing(imageResult).then(function (blob) {
                        var client = new BinaryClient("ws://socket." + $location.host() + ":" + $location.port() + "/image-writer");
                        client.on('open', function () {
                            var stream = client.send(blob, {size: blob.size});
                            stream.on('data', function (url) {
                                scope.$apply(function () {
                                    scope.url = url;
                                });
                            });
                            stream.on('close', function () {
                                client.close();
                            });
                        });
                    });


                });
            }
        };


    }];

    ng.module(app, ['sokratik.atelier.istari.services',
            'sokratik.atelier.minerva.services',
            'sokratik.atelier.canvas.services',
            'ui.bootstrap',
            'templates-app',
            'monospaced.elastic'
        ])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective)
        .directive("sokratikCanvas", _sokratikCanvasDirective)
        .directive('sokratikImageUpload', _sokratikImageUploadDirective)
        .controller("DialogueController", ["$scope", function ($scope) {
            $scope.templateName = "templates/" + ($scope.presentation.templateName || "imageText") + ".tpl.html";
            $scope.currentFragmentIndex = 0;
            var dialogueFragments = [];
            this.addFragment = function (dialogueFragment) {
                dialogueFragments = _.chain(dialogueFragments)
                    .union(dialogueFragment)
                    .flatten()
                    .value();
                return _.size(dialogueFragments);
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
