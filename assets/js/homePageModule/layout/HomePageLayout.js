define([
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    var HomePageLayout =  Backbone.Marionette.LayoutView.extend({

        /**
         * view events
         */
        events : {
            "click" : 'hideInformation'
        },

        initialize : function(options) {
            this.URLOptions = options.URLOptions;
            _.bindAll(this, 'hideInformation');
        },

        template: HomePageLayoutTemplate,

        regions : {
            leftPanel   : '#leftPanel',
            centerPanel : '#centerPanel'
        },

        onRender : function() {
            //  Create and render item views
            this.leftPanel.show( new LeftPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));

            this.centerPanel.show( new CenterGridPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));
        },

        /**
         * This callback is executed when user clicked in the layout
         * The goal is to hide grid information when user clicks out of the grid
         *
         * @param e clicked element
         */
        hideInformation : function(e) {
            //  We check if the clicked element is in the gris and if there is a displayed information
            if ($(e.target).parents('#grid').length === 0 && this.centerPanel.currentView.currentSelectedForm > -1) {
                this.centerPanel.currentView.clearSelectedRow();
            }
        }

    });

    return HomePageLayout;

});
