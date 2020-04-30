define([
    'backbone',
    'marionette',
    'text!../templates/HomePageLayout.html',
    '../views/LeftPanelView',
    '../views/CenterGridPanelView'
], function(Backbone, Marionette, HomePageLayoutTemplate, LeftPanelView, CenterGridPanelView) {

    return  Marionette.View.extend({
        initialize : function(options) {
            console.log("********* initialize", options)
            this.URLOptions = options.URLOptions;
            this.paths = options.paths;
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
            }));

            this.getRegion("centerPanel").show( new CenterGridPanelView({
                URLOptions : this.URLOptions
            }));
        }
    });
});
