define(["jquery", "backbone"], function($, Backbone) {
    return Backbone.Marionette.AppRouter.extend({
        initialize : function() {
            this.globalChannel = Backbone.Radio.channel('global');
            this.formChannel = Backbone.Radio.channel('form');
            this.formChannel.on('exit', this.exit, this);
        },

        exit : function(dataUpdated) {
            this.navigate('#');
            this.globalChannel.trigger('displayHomePage');

            if (dataUpdated) {
                Backbone.Radio.channel('grid').trigger('refresh');
            }
        }
    });
});
