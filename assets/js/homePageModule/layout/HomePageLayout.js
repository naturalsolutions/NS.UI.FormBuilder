define([
    'backbone',
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Backbone, Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    return  Marionette.View.extend({
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
            this.getRegion("leftPanel").show( new LeftPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));

            this.getRegion("centerPanel").show( new CenterGridPanelView({
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));
        }
    });
});
