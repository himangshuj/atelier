angular.module('templates-app', ['edit/controller.tpl.html', 'edit/dialogue.tpl.html', 'edit/edit.tpl.html', 'edit/image.tpl.html', 'edit/media.modal.tpl.html', 'edit/newslide.modal.tpl.html', 'edit/search.tpl.html', 'edit/template.tpl.html', 'edit/text.fragment.tpl.html', 'play/controller.tpl.html', 'play/dialogue.tpl.html', 'play/play.tpl.html', 'play/text.fragment.tpl.html', 'record/dialogue.tpl.html', 'record/record.tpl.html', 'record/text.fragment.tpl.html', 'start/start.tpl.html']);

angular.module("edit/controller.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/controller.tpl.html",
    "\n" +
    "<div>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"resume()\">Resume</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"add()\">Add Another Slide</button>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("edit/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/dialogue.tpl.html",
    "<div ng-class=\"presentation.css\">\n" +
    "    <div ng-include=\"templateName\"/>\n" +
    "</div>");
}]);

angular.module("edit/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/edit.tpl.html",
    "<div class=\"reveal\" ui-view=\"template\"></div>\n" +
    "\n" +
    "<div ui-view=\"control\" class=\"controlBar\"></div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("edit/image.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/image.tpl.html",
    "image");
}]);

angular.module("edit/media.modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/media.modal.tpl.html",
    "<div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "        <div class=\"modal-header\">\n" +
    "\n" +
    "            Enter the url of the {{mediaType}} you want to replace\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\">\n" +
    "\n" +
    "            <input type=\"text\" ng-model=\"selectedMedia\" maxlength=\"255\" width=\"200\"\n" +
    "                   ng-blur=\"blur(selectedMedia)\"/>\n" +
    "\n" +
    "            <div ng-if=\"YT\">\n" +
    "\n" +
    "                <iframe id=\"player\" type=\"text/html\" width=\"{{width}}\" height=\"{{height}}\"\n" +
    "                        ng-src=\"{{ytURL}}\"\n" +
    "                        frameborder=\"0\"></iframe>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"modal-footer\">\n" +
    "            <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"ok()\">Ok</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("edit/newslide.modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/newslide.modal.tpl.html",
    "<div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "        <div class=\"modal-header\">\n" +
    "\n" +
    "            Select the templateName\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\">\n" +
    "\n" +
    "            <ul>\n" +
    "                <li ng-repeat=\"template in templates\">\n" +
    "                    <a ng-click=\"selected.template = template\">{{ template }}</a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "\n" +
    "            Selected: <b>{{ selected.template }}</b>\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"modal-footer\">\n" +
    "            <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"ok()\">Ok</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("edit/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/search.tpl.html",
    "");
}]);

angular.module("edit/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/template.tpl.html",
    "<sokratik-dialogue presentation=\"presentation.keyVals\"/>\n" +
    "\n" +
    "");
}]);

angular.module("edit/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\" contenteditable=\"true\"></span>\n" +
    "");
}]);

angular.module("play/controller.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/controller.tpl.html",
    "control bar");
}]);

angular.module("play/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/dialogue.tpl.html",
    "<div ng-class=\"presentation.css\">\n" +
    "\n" +
    "    <div>\n" +
    "        <div ng-include=\"templateName\"/>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("play/play.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/play.tpl.html",
    "<div ng-repeat=\"presentation in presentations\">\n" +
    "    <div>\n" +
    "        <sokratik-dialogue presentation=\"presentation\" presentations=\"presentations\" index=\"{{$index}}\"\n" +
    "                           presentation-id=\"{{presentationId}}\" add-fragment=\"addFragment(fragment)\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div ui-view=\"control\">\n" +
    "    control\n" +
    "</div>");
}]);

angular.module("play/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\"></span>\n" +
    "");
}]);

angular.module("record/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/dialogue.tpl.html",
    "<div ng-class=\"presentation.css\">\n" +
    "    <div>\n" +
    "        <div ng-include=\"templateName\"/>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"next()\">Next</button>\n" +
    "\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"previous()\">Previous</button>\n" +
    "\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"zoom_in()\">Zoom in</button>\n" +
    "\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"zoom_out()\">Zoom out</button>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("record/record.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/record.tpl.html",
    "<!--\n" +
    "this is the place holder for all the templates which are being played\n" +
    "-->\n" +
    "\n" +
    "<div ng-repeat=\"presentation in presentations\">\n" +
    "    <div>\n" +
    "        <sokratik-dialogue presentation=\"presentation\" presentations=\"presentations\" index=\"{{$index}}\"\n" +
    "                           presentation-id=\"{{presentationId}}\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"play()\">Play</button>\n" +
    "\n" +
    "</div>");
}]);

angular.module("record/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\"></span>\n" +
    "");
}]);

angular.module("start/start.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("start/start.tpl.html",
    "<div class=\"slides\">\n" +
    "    <br/>\n" +
    "    <br/>\n" +
    "\n" +
    "    <h1>\n" +
    "        Sokratik\n" +
    "    </h1>\n" +
    "\n" +
    "    <p>\n" +
    "        Click on the right arrow to create a new slide\n" +
    "    </p>\n" +
    "    <br/>\n" +
    "\n" +
    "    <p>\n" +
    "        Use the up/down arrows to cycle between templates\n" +
    "    </p>\n" +
    "    <br/>\n" +
    "\n" +
    "    <p>\n" +
    "        Happy teaching!\n" +
    "    </p>\n" +
    "    <a ui-sref=\"edit({templateName: global.answer.presentationData[0].templateName, presentationId: global.answer._id, page: 0})\">\n" +
    "        edit\n" +
    "    </a>\n" +
    "</div>\n" +
    "");
}]);
