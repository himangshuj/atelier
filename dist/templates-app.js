angular.module('templates-app', ['edit/dialogue.tpl.html', 'edit/edit.tpl.html', 'edit/image.fragment.tpl.html', 'edit/image.modal.tpl.html', 'edit/media.modal.tpl.html', 'edit/newslide.modal.tpl.html', 'edit/search.tpl.html', 'edit/template.tpl.html', 'edit/text.fragment.tpl.html', 'play/activate.tpl.html', 'play/dialogue.tpl.html', 'play/image.fragment.tpl.html', 'play/master.tpl.html', 'play/play.tpl.html', 'play/text.fragment.tpl.html', 'record/active.tpl.html', 'record/complete.tpl.html', 'record/dialogue.tpl.html', 'record/image.fragment.tpl.html', 'record/master.tpl.html', 'record/record.tpl.html', 'record/text.fragment.tpl.html', 'start/start.tpl.html']);

angular.module("edit/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/dialogue.tpl.html",
    "<div class=\"full-height\" ng-class=\"presentation.css\">\n" +
    "    <div ng-include=\"templateName\" class=\"full-height\"></div>\n" +
    "</div>");
}]);

angular.module("edit/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/edit.tpl.html",
    "<div class=\"edit full-height\" ui-view=\"template\"></div>\n" +
    "\n" +
    "\n" +
    "<button class=\"btn btn-light nav-button nav-button-right\" ng-click=\"goToPage(page+1)\" ng-show=\"page < (totalPages-1)\"><b class=\"stretch\"><i class=\"icon-caret-right\"></i></b></button><br/>\n" +
    "<button class=\"btn btn-light nav-button nav-button-right\" ng-click=\"add()\" ng-show=\"page >= (totalPages-1)\"><b class=\"stretch\"><i class=\"icon-caret-right\"></i></b></button><br/>\n" +
    "<button class=\"btn btn-light nav-button nav-button-left\" ng-click=\"goToPage(page-1)\" ng-show=\"page > 0 \"><b class=\"stretch\"><i class=\"icon-caret-left\"></i></b></button>\n" +
    "\n" +
    "<button class=\"btn btn-light no-border button-delete\" ng-click=\"remove()\"><i class=\"icon-trash bigger-160\"></i> Delete slide</button>\n" +
    "<button class=\"btn no-border btn-danger button-record\" ng-click=\"resume()\"><i class=\"icon-circle bigger-275 red\"></i> Go to record mode</button>\n" +
    "\n" +
    "<div ng-show=\"loading\">\n" +
    "    <div class=\"spinner-backdrop\" style=\"opacity:0.5\"></div>\n" +
    "    <div id=\"spinner\"></div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("edit/image.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/image.fragment.tpl.html",
    "<span ng-class=\"model.css\">\n" +
    "    <img ng-show=\"model.value==''\" ng-click=\"addImage()\" src='/img/image-icon.png' class=\"image-proxy\">\n" +
    "<img ng-hide=\"model.value==''\" ng-src=\"{{model.value}}\" ng-click=\"addImage()\" src='/img/image-icon.png' onload=\"console.log('Image laoded')\"/>\n" +
    "</span>\n" +
    "");
}]);

angular.module("edit/image.modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/image.modal.tpl.html",
    "<div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "        <div class=\"modal-header\">\n" +
    "            <span style=\"font-size:initial\">Enter image URL </span>&nbsp; &nbsp;<input type=\"text\" ng-model=\"selected.image\" style=\"width:70%\">\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\">\n" +
    "            <div class=\"row-fluid image-container\">\n" +
    "                <div class=\"row-fluid image-group\" ng-repeat=\"imageGroup in imageGroups\">\n" +
    "                    <div class=\"col-xs-12 col-sm-6 col-md-4\" style=\"height: inherit\" ng-repeat=\"image in imageGroup\">\n" +
    "                        <div class=\"image-holder\" ng-class=\"{selected : selected.image == image.url}\"\n" +
    "                             style=\"background-image: url('{{image.thumbnail}}')\" ng-click=\"selected.image = image.url\" ng-dblclick=\"ok(image.url)\">\n" +
    "                       </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"modal-footer\">\n" +
    "            <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"ok(selected.image)\">Ok</button>\n" +
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
    "            Select template\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\">\n" +
    "            <div class=\"row-fluid image-container\">\n" +
    "                <div class=\"row-fluid image-group\">\n" +
    "                    <div class=\"col-xs-12 col-sm-6 col-md-4\" style=\"height: inherit\" ng-repeat=\"template in templates\">\n" +
    "                        <div class=\"image-holder\" ng-class=\"{selected : selected.template == template}\" style=\"background-image: url('/img/templates/{{template}}.png')\" ng-click=\"selected.template = template\">\n" +
    "                        </div>\n" +
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

angular.module("edit/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/search.tpl.html",
    "");
}]);

angular.module("edit/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/template.tpl.html",
    "<sokratik-dialogue presentation=\"presentation\"\n" +
    "                   increase-images=\"increaseImages\"\n" +
    "                   decrease-images=\"decreaseImages\"></sokratik-dialogue>\n" +
    "\n" +
    "");
}]);

angular.module("edit/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("edit/text.fragment.tpl.html",
    "<span ng-class=\"model.css\">\n" +
    "    <input type=\"text\" ng-model=\"model.value\" placeholder=\"{{model.placeholder}}\"/>\n" +
    "</span>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("play/activate.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/activate.tpl.html",
    "<div class=\"full-height\">\n" +
    "    <sokratik-dialogue presentation=\"presentation\"  presentation-id=\"{{presentationId}}\" class=\"full-height zoom-in\"\n" +
    "                       add-fragment=\"addFragment(fragment)\"/>\n" +
    "</div>\n" +
    "");
}]);

angular.module("play/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/dialogue.tpl.html",
    "<div ng-class=\"presentation.css\" class=\"full-height\">\n" +
    "\n" +
    "    <div class=\"full-height\">\n" +
    "        <div ng-include=\"templateName\" class=\"full-height\"></div>\n" +
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
    "<div ng-repeat=\"presentation in presentations\" class=\"master-view\">\n" +
    "    <div>\n" +
    "\n" +
    "        <sokratik-dialogue presentation=\"presentation\" index=\"{{$index}}\"\n" +
    "                           presentation-id=\"{{presentationId}}\" ng-click=\"activate($index)\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("play/play.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("play/play.tpl.html",
    "<div class=\"full-height\">\n" +
    "    <div ui-view=\"screen\" class=\"playback full-height\"></div>\n" +
    "</div>\n" +
    "<div>\n" +
    "    <div ui-view=\"audio\"></div>\n" +
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
    "<div class=\"full-height\">\n" +
    "    <sokratik-dialogue presentation=\"presentation\" index=\"{{$index}}\" presentation-id=\"{{presentationId}}\"\n" +
    "                       class=\"zoom-in\"\n" +
    "                       add-fragment=\"addFragment(fragment)\" ng-click=\"next()\"/>\n" +
    "</div>\n" +
    "<button class=\"btn btn-light no-border button-top-left-1\" ng-show=\"recording && page < totalPages -1\"\n" +
    "        ng-click=\"nextSlide()\"><i class=\"icon-skip-forward bigger-160\"></i></button>\n" +
    "\n" +
    "<button class=\"btn btn-light no-border button-top-left-2\" ng-show=\"recording\" ng-click=\"redoSlide()\"><i\n" +
    "        class=\"icon-undo bigger-160 red\"></i></button>\n" +
    "\n" +
    "<div ng-show=\"recording\" class=\"control-bar-left\">\n" +
    "</div>\n" +
    "");
}]);

angular.module("record/complete.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/complete.tpl.html",
    "Check your presentation at <a href=\"/play/{{answerId}}\">click</a>");
}]);

angular.module("record/dialogue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/dialogue.tpl.html",
    "   <div class=\"full-height\">\n" +
    "       <div ng-include=\"templateName\" class=\"full-height\"></div>\n" +
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
    "<div class=\"full-height\">\n" +
    "    <div ui-view=\"workspace\" class=\"workspace full-height\"></div>\n" +
    "</div>\n" +
    "<button class=\"btn btn-light no-border button-top-left-0\" ng-click=\"record()\" ng-hide=\"recording\"><i class=\"icon-circle bigger-160 red\"></i></button>\n" +
    "<button class=\"btn btn-light no-border button-top-left-0\" ng-click=\"pause()\" ng-show=\"recording\"><i class=\"icon-pause bigger-160\"></i></button>\n" +
    "<button class=\"btn btn-danger no-border button-complete\" ng-click=\"complete()\" ng-show=\"recording\"><i class=\"icon-check bigger-275\"></i> Done!</button><br/>\n" +
    "");
}]);

angular.module("record/text.fragment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("record/text.fragment.tpl.html",
    "<span ng-class=\"model.css\" ng-bind-html=\"model.value\"></span>\n" +
    "");
}]);

angular.module("start/start.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("start/start.tpl.html",
    "<div class=\"slides full-height\">\n" +
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
