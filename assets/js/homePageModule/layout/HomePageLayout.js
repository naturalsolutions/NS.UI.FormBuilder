define([
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    HomePageLayout =  Backbone.Marionette.LayoutView.extend({

        template: HomePageLayoutTemplate,

        regions : {
            leftPanel   : '#leftPanel',
            centerPanel : '#centerPanel'
        },

        onRender : function() {
            //  Create and render item views
            this.leftPanel.show( new LeftPanelView() );
            this.centerPanel.show( new CenterGridPanelView() );
        }

    });

    return HomePageLayout;

});
