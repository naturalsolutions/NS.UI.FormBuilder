define([
    'jquery', 'marionette', 'app-config'
], function($, Marionette, AppConfig) {
    var authData = {};
    $.ajax({
        data: JSON.stringify({'securityKey' : AppConfig.securityKey}),
        type: 'POST',
        url: AppConfig.config.options.URLOptions.security + "/isCookieValid",
        contentType: 'application/json',
        crossDomain: true,
        async: false,
        success: function (data) {
            authData = data;
        },
        error: function(xhr, opt, err) {
            authData.error = xhr.status + " " + xhr.statusCode;
        },
    });

    return authData;
});