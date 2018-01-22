/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'backbone',
    'lodash',
    'jquery',
    'marionette',
    './router',
    'app-config',
    'auth',
    'tools'
], function(Backbone, _, $, Marionette, Router, AppConfig, auth, tools) {

    var FormbuilderApp = new Marionette.Application();
    var MainView = Marionette.View.extend({
        el: "#mainRegion",
        template: _.template(
            '<div id="leftSection" class="col-md-6"></div>\n' +
            '<div id="rightSection" class="col-md-6"></div>'),
        regions: {
            leftRegion: {
                el: '#leftSection',
                replaceElement: false
            },
            rightRegion: {
                el: '#rightSection',
                replaceElement: false
            }
        }
    });
    FormbuilderApp.on('start', function() {
        if (auth.error) {
            var redirectHome = function() {
                window.location.href = AppConfig.portalURL;
            };

            switch (auth.error.status) {
                case 400:
                    tools.swal("error", "error.cookieCheck", "error.serverAvailable", null, redirectHome);
                    break;
                case 502:
                default:
                    tools.swal("error", "error.cookieCheck", "error.serverDown", null, redirectHome);
                    break;
            }
            return;
        }

        if (auth.username) {
            $("header .user").text(auth.username);
            $("header .icons.last").removeClass("hidden");
        }
        if (auth.userlanguage) {
            $("header .lang").text(auth.userlanguage.toUpperCase());
        }

        // start main view & router
        this.rootView = new MainView();
        this.router = new Router(
            this.rootView.getRegion('leftRegion'),
            this.rootView.getRegion('rightRegion'));

        // start routing
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
