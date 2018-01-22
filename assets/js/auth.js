define([
    'jquery', 'app-config'
], function($, AppConfig) {
    if (AppConfig.authmode !== "portal") {
        return {
            "username": AppConfig.username || "bob",
            "userlanguage": AppConfig.language || navigator.language || "fr"
        }
    }

    var authData = {};
    $.ajax({
        data: JSON.stringify({'securityKey': AppConfig.securityKey}),
        type: 'POST',
        url: AppConfig.config.options.URLOptions.security + "/isCookieValid",
        contentType: 'application/json',
        crossDomain: true,
        async: false,
        success: function(data) {
            authData = data;
        },
        error: function(xhr) {
            authData.error = {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText
            }
        }
    });
    return authData;
});