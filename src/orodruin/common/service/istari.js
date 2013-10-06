//this file contains services which will be used to communicate across various apps of KAMillion
//the breed of istari will guide individual apps to achieve their task.
angular.module("orodruin.services.istari", [], function ($provide) {
    $provide.provider("anduril", andurilForger);

});

var andurilForger = function () {
        var fragments = {};
        var fetchVariablesForPresentationId = function (presentationId, $http, $log) {
            if (fragments[presentationId] == null) {
                return     $http.get("static/presentations/data/" + presentationId + ".json", {cache: true})
                    .success(function (data, status, headers, config) {
                        return fragments[presentationId] = data;
                    })
                    .error(function (data, status, headers, config) {
                        $log.info("call failed getting default data");
                        return fragments[presentationId] = {};
                    });
            } else {
                return fragments[presentationId];
            }
        };
        this.$get = ["$http", "$log", function ($http, $log) {
            return {
                put: function (presentationId, page, variableName, value) {
                    var templateFragment = fragments[presentationId];   //TODO fix this in a cleaner way
                    templateFragment[page][variableName] = value;
                },
                post: function (presentationId) {
//                    console.log(fragments[presentationId]);
                },
                getVar: function (presentationId, page, variable, defaultValue) {
                    var templateFragment = fragments[presentationId];   //TODO fix this in a cleaner way
                    return templateFragment[page][variable] ? templateFragment[page][variable] : defaultValue;
                },
                fetchVariablesForPresentationId: function(presentationId){
                    return fetchVariablesForPresentationId(presentationId, $http, $log);
                }
            };
        }
        ]
        ;
    }
    ;
