define([
    'backbone',
    '../models/FormModel'
], function (Backbone, FormModel) {

    return Backbone.Collection.extend({
        model : FormModel,

        initialize : function(options) {
            this.homePageChannel = Backbone.Radio.channel('homepage');
            this.update(options);
        },

        update: function(options) {
            this.url = options.url || 'ressources/forms/formsExample.json'; //  get a default URL for client-side mode
            if (options.url && options.context && options.context != 'all')
                this.url = options.url + "/" + options.context;
        },

        deleteModel : function(modelID) {
            var modelToRemove = this.get(modelID);
            modelToRemove.urlRoot = this.url;
            modelToRemove.destroy({
                success : _.bind(function() {
                    this.homePageChannel.trigger('destroy:success');
                }, this),
                error : _.bind(function() {
                    this.homePageChannel.trigger('destroy:error');
                }, this)
            });
        }
    });
});
