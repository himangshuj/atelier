angular.module('templates-app', ['edit/dialogue.tpl.html', 'edit/edit.tpl.html', 'edit/image.fragment.tpl.html', 'edit/image.modal.tpl.html', 'edit/media.modal.tpl.html', 'edit/newslide.modal.tpl.html', 'edit/search.tpl.html', 'edit/template.tpl.html', 'edit/text.fragment.tpl.html', 'play/activate.tpl.html', 'play/dialogue.tpl.html', 'play/image.fragment.tpl.html', 'play/master.tpl.html', 'play/play.tpl.html', 'play/text.fragment.tpl.html', 'record/active.tpl.html', 'record/complete.tpl.html', 'record/dialogue.tpl.html', 'record/image.fragment.tpl.html', 'record/master.tpl.html', 'record/record.tpl.html', 'record/text.fragment.tpl.html', 'start/start.tpl.html']);

angular.module("edit/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/dialogue.tpl.html",
    "<div ng-class=\"presentation.css\">\n" +
    "    <div ng-include=\"templateName\"/>\n" +
    "</div>");
}]);

angular.module("edit/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/edit.tpl.html",
    "<div class=\"edit\" ui-view=\"template\"></div>\n" +
    "\n" +
    "\n" +
    "<div>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"resume()\">Resume</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"add()\">Insert Another Slide</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"goToPage(page+1)\" ng-show=\"page < (totalPages-1)\">Next Slide</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"goToPage(page-1)\" ng-show=\"page > 0 \">Previous Slide</button>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("edit/image.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/image.fragment.tpl.html",
    "<span ng-class=\"model.css\">\n" +
    "     <img ng-src=\"{{model.value}}\" ng-click=\"addImage()\" tooltip=\"click to change image\"/>\n" +
    "</span>\n" +
    "");
}]);

angular.module("edit/image.modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/image.modal.tpl.html",
    "<div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "        <div class=\"modal-header\">\n" +
    "            <input type=\"text\" ng-model=\"selected.image\">\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\">\n" +
    "            <div class=\"row-fluid image-container\">\n" +
    "                <div class=\"row-fluid image-group\" ng-repeat=\"imageGroup in imageGroups\">\n" +
    "                    <div class=\"col-xs-12 col-sm-6 col-md-4\" style=\"height: inherit\" ng-repeat=\"image in imageGroup\">\n" +
    "                        <div class=\"image-holder\" ng-class=\"{selected : selected.image == image.url}\" style=\"background-image: url('{{image.thumbnail}}')\" ng-click=\"selected.image = image.url\">\n" +
    "                       </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
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
    "<sokratik-dialogue presentation=\"presentation\"/>\n" +
    "\n" +
    "");
}]);

angular.module("edit/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\" contenteditable=\"true\"></span>\n" +
    "");
}]);

angular.module("play/activate.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/activate.tpl.html",
    "<div>\n" +
    "    <sokratik-dialogue presentation=\"presentation\"  presentation-id=\"{{presentationId}}\" class=\"zoom-in\"\n" +
    "                       add-fragment=\"addFragment(fragment)\"/>\n" +
    "</div>\n" +
    "");
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

angular.module("play/image.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/image.fragment.tpl.html",
    "<span ng-class=\"model.css\">\n" +
    "     <img ng-src=\"{{model.value}}\" src=\"\"/>\n" +
    "</span>\n" +
    "");
}]);

angular.module("play/master.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/master.tpl.html",
    "<div ng-repeat=\"presentation in presentations\">\n" +
    "    <div>\n" +
    "        <sokratik-dialogue presentation=\"presentation\" index=\"{{$index}}\"\n" +
    "                           presentation-id=\"{{presentationId}}\" ng-click=\"activate($index)\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("play/play.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/play.tpl.html",
    "<div>\n" +
    "    <div ui-view=\"screen\"></div>\n" +
    "</div>\n" +
    "<div>\n" +
    "    <div ui-view=\"audio\"/>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("play/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\"></span>\n" +
    "");
}]);

angular.module("record/active.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/active.tpl.html",
    "<div>\n" +
    "    <sokratik-dialogue presentation=\"presentation\" index=\"{{$index}}\" presentation-id=\"{{presentationId}}\" class=\"zoom-in\"\n" +
    "                       add-fragment=\"addFragment(fragment)\"/>\n" +
    "</div>\n" +
    "<div>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"masterView()\">MasterView</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"next()\">Next Fragment</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"previous()\">Previous Fragment</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"nextSlide()\">Next Slide</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"redoSlide()\">Redo Slide</button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("record/complete.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/complete.tpl.html",
    "Check your presentation at <a href=\"/play/{{answerId}}\">click</a>");
}]);

angular.module("record/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/dialogue.tpl.html",
    "   <div>\n" +
    "       <div ng-include=\"templateName\"/>\n" +
    "   </div>\n" +
    "");
}]);

angular.module("record/image.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/image.fragment.tpl.html",
    "<span ng-class=\"model.css\">\n" +
    "     <img ng-src=\"{{model.value}}\"/>\n" +
    "</span>\n" +
    "");
}]);

angular.module("record/master.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/master.tpl.html",
    "<div ng-repeat=\"presentation in presentations\">\n" +
    "    <div>\n" +
    "\n" +
    "        <sokratik-dialogue presentation=\"presentation\" index=\"{{$index}}\"\n" +
    "                           presentation-id=\"{{presentationId}}\" ng-click=\"activate($index)\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("record/record.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/record.tpl.html",
    "<!--\n" +
    "this is the place holder for all the templates which are being played\n" +
    "-->\n" +
    "<div>\n" +
    "    <div ui-view=\"workspace\" class=\"workspace\"/>\n" +
    "</div>\n" +
    "<div>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"complete()\">Complete</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"record()\" ng-hide=\"recording\">Record Audio</button>\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"pause()\" ng-show=\"recording\">Pause Recording</button>\n" +
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
