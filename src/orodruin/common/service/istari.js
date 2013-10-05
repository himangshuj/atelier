//this file contains services which will be used to communicate across various apps of KAMillion
//the breed of istari will guide individual apps to achieve their task.
angular.module("orodruin.services.istari", [], function ($provide) {
    $provide.provider("anduril", andurilForger);

});

var andurilForger = function () {
        var fragments = {};
        var fetchVariablesForTemplateId = function (templateId, $http, $log) {
            if (fragments[templateId] == null) {
                return     $http.get("static/templates/data/" + templateId + ".json", {cache: true})
                    .success(function (data, status, headers, config) {
                        return fragments[templateId] = data;
                    })
                    .error(function (data, status, headers, config) {
                        $log.info("call failed getting default data");
                        return fragments[templateId] = {};
                    });
            } else {
                return fragments[templateId];
            }
        };
        this.$get = ["$http", "$log", function ($http, $log) {
            return {
                put: function (templateId, variableName, value) {
                    var templateFragment = fragments[templateId];   //TODO fix this in a cleaner way
                    templateFragment[variableName] = value;
                },
                post: function (templateId) {
                    console.log(fragments[templateId]);
                },
                getVar: function (templateId, variable, defaultValue) {
                    var templateFragment = fragments[templateId];   //TODO fix this in a cleaner way
                    return templateFragment[variable] ? templateFragment[variable] : defaultValue;
                },
                fetchVariablesForTemplateId: function(templateId){
                    return fetchVariablesForTemplateId(templateId, $http, $log);
                }
            };
        }
        ]
        ;
    }
    ;
