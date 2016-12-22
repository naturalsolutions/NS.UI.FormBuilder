/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'underscore',
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
                $("#contextSwitcher .selectedContext").trigger("click");
                if (urlArgs[0] == "context")
                    $("#contextSwitcher span:contains('" + urlArgs[1] + "')").trigger("click");
                else
                    $("#contextSwitcher span:contains('" + urlArgs[0].split('=')[1] + "')").trigger("click");
            }
            else if (urlArgs[0] == "edition" && $("#formsCount").length == 0){
                window.setTimeout(function() {
                    loadHomepage();
                }, 500);
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

        // Adding contexts
        $.each(AppConfig.appMode, function(index, value){
            if (index.indexOf("demo") == -1 && index != "topcontext" && index != "minimalist")
            {
                $("#contextSwitcher").append("<span class='hidden'>"+index+"</span>");
            }
        });

        $(".headerWhiteArrow").click(function(){
            $("#contextSwitcher .selectedContext").trigger("click");
        });

        $("#contextSwitcher span").click(function(){
            if (window.location.hash.indexOf('#edition') == -1)
            {
                if (!$(this).hasClass("selectedContext"))
                {
                    $("#contextSwitcher .selectedContext").removeClass("selectedContext");
                    $(this).addClass("selectedContext");
                    $(this).trigger("click");

                    $('#leftPanel input').val('');

                    $("#contextSwitcher .selectedContext").attr("style", "width:auto;");
                    $("header span.pipe:eq(1)").attr("style", "");
                    $("#contextSwitcher").attr("style", "position:initial;");

                    setTimeout(function(){
                        var context = $("#contextSwitcher .selectedContext").text();
                        window.context = context;
                        Backbone.Radio.channel('form').trigger('setFieldCollection', context);
                        Backbone.Radio.channel('homepage').trigger('setCenterGridPanel', context);
                    }, 100);
                }
                else
                {
                    if ($("#contextSwitcher .hidden").length > 0)
                    {
                        $("#contextSwitcher .hidden").removeClass("hidden");

                        $("#contextSwitcher .selectedContext").attr("style", "");
                        $("header span.pipe:eq(1)").attr("style", "margin-left:180px;");
                        $("#contextSwitcher").attr("style", "");
                    }
                    else
                    {
                        $("#contextSwitcher span").addClass("hidden");
                        $(this).removeClass("hidden");

                        $("#contextSwitcher .selectedContext").attr("style", "width:auto;");
                        $("header span.pipe:eq(1)").attr("style", "");
                        $("#contextSwitcher").attr("style", "position:initial;");
                    }
                }
            }
        });

        if ($("#contextSwitcher span").length == 2)
        {
            $("#contextSwitcher .selectedContext").remove();
            $("#contextSwitcher span").trigger("click");
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
        });

    });

    $("body").on("keydown", function (e) {
        e.originalEvent.defaultPrevented = false;
        //console.log("even", e);
        //console.log("down", e.keyCode);
        if (e.keyCode = 9)
        {
            //console.log(e.isDefaultPrevented(), e.isImmediatePropagationStopped(), e.isPropagationStopped());
            //console.log(e.target, e.originalEvent);
            var knowdefaultprev = e.originalEvent.defaultPrevented;
            //console.log(e.originalEvent.defaultPrevented);
            //console.log(knowdefaultprev);

            if (e.originalEvent.defaultPrevented)
            {
                console.log("*\n**\n**\n**\n**\n**\n* DEFAULT UNPREVENTED !!!");
                e.originalEvent.defaultPrevented = false;
            }

            $(this).next().focus();
        }
    });

    return FormbuilderApp;

});
