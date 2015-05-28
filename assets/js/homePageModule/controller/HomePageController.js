define(['jquery','marionette', '../layout/HomePageLayout', 'i18n', 'backbone.radio', 'i18n'], function($, Marionette, HomePageLayout, Radio) {

    var HomePageController = Marionette.Controller.extend({

        initialize: function(options) {
            // Kepp homepage region
            this.homePageRegion = options.homePageRegion;

            this.URLOptions = options.URLOptions;

            this.initHomePageChannel();
        },

        initHomePageChannel : function() {
            this.homePageChannel = Backbone.Radio.channel('homepage');

            this.homePageChannel.on('export', this.exportFormAsFile, this);
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
