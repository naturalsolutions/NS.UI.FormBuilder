define([
    'jquery','marionette', '../layout/HomePageLayout', 'backbone.radio', '../models/FormModel', 'i18n'
], function($, Marionette, HomePageLayout, Radio, FormModel) {

    var HomePageController = Marionette.Controller.extend({

        initialize: function(options) {
            // Kepp homepage region
            this.homePageRegion = options.homePageRegion;

            this.URLOptions = options.URLOptions;

            this.initHomePageChannel();
            this.initGlobalChannel();
        },

        /**
         * Init backbone radio channel for global channel events
         */
        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');
        },

        initHomePageChannel : function() {
            this.homePageChannel = Backbone.Radio.channel('homepage');

            this.homePageChannel.on('export', this.exportFormAsFile, this);

            //  Event send by CenterGridPanelView when user chose a form template
            this.homePageChannel.on('getTemplate', this.getTemplate, this);
        },

        /**
         *
         * @param newModel
         */
        createModelWithJSON : function(newModel) {
            $.getJSON(this.URLOptions.templateUrl, _.bind(function (data) {

                var template = {};

                for (var each in data) {
                    if (data[each].id == newModel.template) {
                        template = data[each];
                        template.name = newModel.name;
                        template.id = 0;

                        break;
                    }
                }

                var formToEdit = new FormModel(template);

                this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());

            }, this))
        },

        /**
         *
         * @param newModel
         */
        createModelWithURL : function(newModel) {
            $.getJSON(this.URLOptions.templateUrl + '/' + newModel.template, _.bind(function (data) {

                data[0].name = newModel.name;
                data[0].id = 0;

                var formToEdit = new FormModel(data[0]);

                this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());
            }, this))
        },

        /**
         *
         * @param newModel
         */
        getTemplate : function(newModel) {
            if( newModel.template == 0) {
                var formToEdit = new FormModel({
                    id : 0
                });

                this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());
            } else {
                this[this.URLOptions.templateUrl.indexOf('json') > 0 ? 'createModelWithJSON' : 'createModelWithURL'](newModel);
            }

        },

        homeAction: function() {
            $('#navbarContext').text($.t('navbar.context.home'))

            //  Init homepage layout and render it in the homepage region
            var homePageLayout = new HomePageLayout({
                URLOptions : this.URLOptions
            });
            this.homePageRegion.show( homePageLayout );
        },

        exportFormAsFile : function(filename, json) {
            require(['blobjs', 'filesaver'], _.bind(function(Blob, Filesaver) {
                try {
                    var isFileSaverSupported = !!new Blob();
                    var blob = new Blob([JSON.stringify(json, null, 2)], {
                        type: "application/json;charset=utf-8"
                    });

                    var fs = new Filesaver(blob, filename + '.json');

                    //  All is good
                    this.homePageChannel.trigger('exportFinished', true);
                } catch (e) {
                    //  An error occured when we try to save form as JSON file
                    this.homePageChannel.trigger('exportFinished', false);
                }
            }, this))
        },
    });

    return HomePageController;

});
