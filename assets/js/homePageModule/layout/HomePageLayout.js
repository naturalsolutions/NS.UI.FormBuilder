define([
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    return  Backbone.Marionette.LayoutView.extend({
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
            this.leftPanel.show( new LeftPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));

            this.centerPanel.show( new CenterGridPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));
        }
    });
});
