/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'lodash',
    'marionette',
    'homePageModule/router/HomePageRouter',
    'homePageModule/controller/HomePageController',
    'homePageModule/layout/HomePageLayout',
    'editionPageModule/router/EditionPageRouter',
    'editionPageModule/controller/EditionPageController',
    'homePageModule/collection/FormCollection',
    'backbone.radio',
    'app-config',
    'sweetalert',
    'Translater'
], function(_, Marionette, HomePageRouter, HomePageController, HomePageLayout, EditionPageRouter, EditionPageController,
            FormCollection, Radio, AppConfig, swal, Translater) {

    var translater = Translater.getTranslater();

    //  Create a marionette application
    var FormbuilderApp = new Backbone.Marionette.Application();

    var fbrouting = function(options){

        var getFromUrl = function(){
            var myself = this;
            myself.urlArgs = [];

            var location = window.location.hash.substr(1);
            myself.urlArgs = location.split('/');

            return (myself.urlArgs);
        };

        window.setTimeout(function(){
            var loadHomepage = function(){
                window.location.hash = "#";

                $('#navbarContext').text($.t('navbar.context.home'));

                //  Init homepage layout and render it in the homepage region
                /*
                var homePageLayout = new HomePageLayout({
                    URLOptions : options.URLOptions
                });
                FormbuilderApp.leftRegion.show(homePageLayout);
                */
                Backbone.Radio.channel('global').trigger('displayHomePage');
            };
            var urlArgs = getFromUrl();

            if (urlArgs[0] == "form" || urlArgs[0].indexOf("form") > -1){
                var formCollection = new FormCollection({
                    url : options.URLOptions.forms
                });
                formCollection.fetch({
                    reset : true,
                    success : _.bind(function() {
                        var formInCollection = 0;

                        if (urlArgs[0] == "form")
                            formInCollection = formCollection.get(urlArgs[1]);
                        else
                            formInCollection = formCollection.get(urlArgs[0].split('=')[1]);

                        if (formInCollection)
                        {
                            loadHomepage();
                            window.setTimeout(function() {
                                Backbone.Radio.channel('global').trigger('displayEditionPage', formInCollection.toJSON());
                            }, 2000);
                        }
                        else
                            loadHomepage();
                    }, this)
                });
            }
            else if (urlArgs[0] == "context" || urlArgs[0].indexOf("context") > -1)
            {
                loadHomepage();
                $("#contextSwitcher .selected").trigger("click");
                if (urlArgs[0] == "context")
                    $("#contextSwitcher span:contains('" + urlArgs[1] + "')").trigger("click");
                else
                    $("#contextSwitcher span:contains('" + urlArgs[0].split('=')[1] + "')").trigger("click");
            }
        }, 200);

    };

    //  Add two main region for the layouts
    FormbuilderApp.addRegions({
        leftRegion  : '#leftSection',
        rightRegion : '#rightSection'
    });

    FormbuilderApp.addInitializer(function(options){
        fbrouting(options);
    });

    //  Add a first initializer that create homepage router
    FormbuilderApp.addInitializer(function(options){
        //  Create controller for homepage
        var homePageRouter = new HomePageRouter({
            controller : new HomePageController({
                homePageRegion : this.leftRegion,
                URLOptions : options.URLOptions
            })
        });
    });

    FormbuilderApp.addInitializer(function(options){
        //  Create controller for homepage
        var editionPageRouter = new EditionPageRouter({
                controller : new EditionPageController({
                editionPageRegion : this.rightRegion,
                URLOptions : options.URLOptions
            })
        });
    });

    FormbuilderApp.addInitializer(function(options) {
        //  App global channel, use for communication through module
        //  Modules never communicate directly, all pass from formbuilder app
        this.globalChannel = Backbone.Radio.channel('global');

        //  Channel for editionPageModule
        this.editionPageChannel = Backbone.Radio.channel('editionPage');

        //  Event send by CenterGridView when user wants to edit a form present in the grid
        this.globalChannel.on('displayEditionPage', _.bind(function(formToEdit) {
            //  Send event to editionPageRouter
            this.editionPageChannel.trigger('display', formToEdit);
            setTimeout(function() {
                $('#mainRegion').animate({
                    marginLeft : '-100%'
                }, 750);
            }, 500);
        }, this));


        this.globalChannel.on('displayHomePage', _.bind(function() {
            $('#mainRegion').animate({
                marginLeft : '0%'
            }, 750, _.bind(function() {
                this.rightRegion.empty();
                $('#navbarContext').text($.t('navbar.context.home'));
            }, this));
            $(".headerWhiteArrow").css("width", "");
        }, this));
    });

    FormbuilderApp.addInitializer(function(options) {

        require(['app-config'], _.bind(function(AppConfig) {

            this.configChannel = Backbone.Radio.channel('config');

            this.config = AppConfig['config'];

            this.configChannel.on('get', _.bind(function(configName) {
                this.configChannel.trigger('get:' + configName, this.config[configName]);
            }, this));

        }, this));
    });

    //  Application start callback
    FormbuilderApp.on('start', function(options) {
        Backbone.history.start();

        if (AppConfig.authmode == 'portal')
        {
            $.ajax({
                data: JSON.stringify({'securityKey' : AppConfig.securityKey}),
                type: 'POST',
                url: options.URLOptions.security + "/isCookieValid",
                contentType: 'application/json',
                crossDomain: true,
                async: false,
                success: _.bind(function (data) {
                    window.user = data.username;
                    $("header .user").text(data.username);
                    $("header .icons.last").removeClass("hidden");
                    $("header .lang").text(data.userlanguage.toUpperCase());
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    swal({
                        title: translater.getValueFromKey('error.cookieCheck') || "Votre identité ne peut être vérifiée",
                        text: translater.getValueFromKey('error.serverAvailable') || "Le serveur est-il hors ligne ?",
                        type: "error",
                        closeOnConfirm: true
                    }, function(){
                        window.location.href = AppConfig.portalURL;
                        window.onkeydown = null;
                        window.onfocus = null;
                    });
                }, this)
            });
        }

        // Spawn contexts
        var nbContexts = 0;
        $.each(AppConfig.appMode, function(index, value){
            if (index.indexOf("demo") == -1 && index != "topcontext" && index != "minimalist")
            {
                // insert context
                $("#contextSwitcher").append("<div class='context'>"+index+"</div>");
                nbContexts++;
            }
        });

        if (nbContexts == 1) {
            // replace "All" context with actual context
            $("#contextSwitcher .selected").remove();
            $("#contextSwitcher .context").addClass("selected");

            // notify world what context we're working on
            var context = $("#contextSwitcher .selected").text().toLowerCase();
            window.context = context;
            Backbone.Radio.channel('form').trigger('setFieldCollection', context);
            Backbone.Radio.channel('homepage').trigger('setCenterGridPanel', context);
        } else if (nbContexts > 1) {
            // enable multi-context
            $("#contextSwitcher").removeClass("single");

            // Expand context switcher
            $("#contextSwitcher").click(function() {
                // disable context-switching in edition page
                if (window.location.hash.indexOf('#edition') != -1) {
                    return;
                }
                $(this).toggleClass("expand");
            });

            // Swap contexts
            $("#contextSwitcher .context").click(function() {
                // no context change
                if ($(this).hasClass("selected")) {
                    return;
                }

                // put new context on top
                // ideally we would keep a consistant order for remaining contexts, but it seems tedious
                var $selected = $("#contextSwitcher .selected");
                $(this).insertBefore($selected);
                $selected.removeClass("selected");
                $(this).addClass("selected");
                $selected = $(this);

                // clear left-panel search form ?
                // $('#leftPanel input').val('');

                // notify world
                var context = $selected.text().toLowerCase();
                window.context = context;
                Backbone.Radio.channel('form').trigger('setFieldCollection', context);
                Backbone.Radio.channel('homepage').trigger('setCenterGridPanel', context);
            });
        }

        window.onhashchange = function(e)
        {
            fbrouting(options);
        };

        $(".logout").click(function(){

            var delete_cookie = function(name) {
                document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            };

            delete_cookie(AppConfig.cookieName);
            setTimeout(function(){window.location.replace(AppConfig.portalURL);},200)
        });

        window.trees = [];
        $.each(AppConfig.paths, function(index, value){
            var treesRestrictions = {
                thesaurusWSPath : "reneco",
                positionWSPath : "reneco"
            };

            if (!treesRestrictions[index] || treesRestrictions[index] == AppConfig.appMode.topcontext)
            {
                $.ajax({
                    type        : 'POST',
                    url         : value,
                    contentType : 'application/json',
                    data        : JSON.stringify({StartNodeID:0, deprecated:0, lng:"Fr"}),
                    timeout     : 10000,
                    success: function (data) {
                        window.trees[value] = data;
                    },
                    error: function () {

                    }
                });
            }
        });
    });

    window.formbuilder = {};

    return FormbuilderApp;

});
