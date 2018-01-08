/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'lodash',
    'marionette',
    './router',
    'app-config',
    'auth',
    'tools'
], function(_, Marionette, Router, AppConfig, auth, tools) {

    var FormbuilderApp = new Backbone.Marionette.Application();

    FormbuilderApp.addRegions({
        leftRegion  : '#leftSection',
        rightRegion : '#rightSection'
    });

    FormbuilderApp.on('start', function() {
        this.router = new Router(this.leftRegion, this.rightRegion);

        if (auth.error) {
            tools.swal("error", "error.cookieCheck", "error.serverAvailable", null,
                function() {
                    window.location.href = AppConfig.portalURL;
                });
            return;
        }

        if (auth.username) {
            $("header .user").text(auth.username);
            $("header .icons.last").removeClass("hidden");
        }
        if (auth.userlanguage) {
            $("header .lang").text(auth.userlanguage.toUpperCase());
        }

        Backbone.history.start();

        $(".logout").click(function(){

            var delete_cookie = function(name) {
                document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            };

            delete_cookie(AppConfig.cookieName);
            setTimeout(function(){window.location.replace(AppConfig.portalURL);},200)
        });

        // preload trees
        $.each(AppConfig.paths, function(key, url){
            tools.loadTree(url);
        });
    });

    return FormbuilderApp;
});
