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
    'app-config'
], function(_, Marionette, HomePageRouter, HomePageController, HomePageLayout, EditionPageRouter, EditionPageController, FormCollection, Radio, AppConfig) {

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

            if (urlArgs[0] == "form"){
                var formCollection = new FormCollection({
                    url : options.URLOptions.forms
                });
                formCollection.fetch({
                    reset : true,
                    success : _.bind(function() {
                        var formInCollection =  formCollection.get(urlArgs[1]);
                        if (formInCollection)
                            Backbone.Radio.channel('global').trigger('displayEditionPage',formInCollection.toJSON());
                        else
                            loadHomepage();
                    }, this)
                });
            }
            else if (urlArgs[0] == "edition" && $("#formsCount").length == 0){
                loadHomepage();
            }
        }, 100);

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
            }, 300);
        }, this));


        this.globalChannel.on('displayHomePage', _.bind(function() {
            $('#mainRegion').animate({
                marginLeft : '0%'
            }, 750, _.bind(function() {
                this.rightRegion.empty();
                $('#navbarContext').text($.t('navbar.context.home'));
            }, this));
        }, this));
    })

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
            }, this),
            error: _.bind(function (xhr, ajaxOptions, thrownError) {
                window.location.href = AppConfig.portalURL;
            }, this)
        });
        }

        // Adding contexts
        $.each(AppConfig.appMode, function(index, value){
            if (index.indexOf("demo") == -1 && index != "currentmode" && index != "minimalist")
            {
                $("#contextSwitcher").append("<span class='hidden'>"+index+"</span>")
            }
        });

        $("#contextSwitcher span").click(function(){
            if (!$(this).hasClass("selectedContext"))
            {
                $("#contextSwitcher .selectedContext").removeClass("selectedContext");
                $(this).addClass("selectedContext");
                $(this).trigger("click");

                $('#leftPanel input').val('');

                setTimeout(function(){
                    var context = $("#contextSwitcher .selectedContext").text();
                    window.context = context;
                    Backbone.Radio.channel('form').trigger('setFieldCollection', context);
                    Backbone.Radio.channel('homepage').trigger('setCenterGridPanel', context);
                }, 50);
            }
            else
            {
                if ($("#contextSwitcher .hidden").length > 0)
                    $("#contextSwitcher .hidden").removeClass("hidden");
                else
                {
                    $("#contextSwitcher span").addClass("hidden");
                    $(this).removeClass("hidden");
                }
            }
        });

        window.onhashchange = function(e)
        {
            fbrouting(options);
        };
    });

    return FormbuilderApp;

});
