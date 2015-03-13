define([
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    HomePageLayout =  Backbone.Marionette.LayoutView.extend({

        initialize : function(options) {
            this.URLOptions = options.URLOptions;
        },

        template: HomePageLayoutTemplate,

        regions : {
            leftPanel   : '#leftPanel',
            centerPanel : '#centerPanel'
        },

        onRender : function() {
            //  Create and render item views
            this.leftPanel.show( new LeftPanelView() );
            this.centerPanel.show( new CenterGridPanelView({
                URLOptions : this.URLOptions
            }));
        }

    });

    return HomePageLayout;

});
