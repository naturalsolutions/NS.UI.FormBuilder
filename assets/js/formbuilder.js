/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'underscore',
    'marionette',
    'homePageModule/router/HomePageRouter',
    'homePageModule/controller/HomePageController',
    'editionPageModule/router/EditionPageRouter',
    'editionPageModule/controller/EditionPageController',

    'backbone.radio'
], function(_, Marionette, HomePageRouter, HomePageController, EditionPageRouter, EditionPageController, Radio) {

    //  Create a marionette application
    var FormbuilderApp = new Backbone.Marionette.Application();

    //  Add two main region for the layouts
    FormbuilderApp.addRegions({
      mainRegion    : '#mainRegion'
    });

    FormbuilderApp.addInitializer(function(options){
        if (window.location.hash != "")
            window.location.hash = "";
    });

    //  Add a first initializer that create homepage router
    FormbuilderApp.addInitializer(function(options){
        //  Create controller for homepage
        var homePageRouter = new HomePageRouter({
            controller : new HomePageController({
                homePageRegion : this.mainRegion,
                URLOptions : options.URLOptions
            })
        });
    });

    FormbuilderApp.addInitializer(function(options){
        //  Create controller for homepage
        var editionPageRouter = new EditionPageRouter({
            controller : new EditionPageController({
                editionPageRegion : this.mainRegion,
                URLOptions : options.URLOptions
            })
        });
    });

    FormbuilderApp.addInitializer(function(options) {
        //  App global channel, use for communication throug module
        //  Modules nevers communicate directly, all pass from formbuilder app
        this.globalChannel = Backbone.Radio.channel('global');

        //  Channel for editionPageModule
        this.editionPageChannel = Backbone.Radio.channel('editionPage');

        this.globalChannel.on('displayEditionPage', _.bind(function(formToEdit) {
            this.editionPageChannel.trigger('display', formToEdit);
        }, this));

        this.globalChannel.on('formImported', _.bind(function(formImportedJSON) {
            this.editionPageChannel.trigger('formImported', formImportedJSON);
        }, this))
    })

    //  Application start callback
    FormbuilderApp.on('start', function(options) {
        Backbone.history.start();
    })

    return FormbuilderApp;

});
