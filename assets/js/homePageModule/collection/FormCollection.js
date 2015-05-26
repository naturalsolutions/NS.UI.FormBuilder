define([
    'backbone',
    '../models/FormModel',
    'backbone.radio'
], function (Backbone, FormModel, Radio) {

    /**
     * Homepage collection backbone collection, contains all forms
     */
    var FormCollection = Backbone.Collection.extend({

        /**
         * Model in the collection
         */
        model : FormModel,

        /**
         * Form constructor
         *
         * @param  {object} options contains some options for collection init, here we-ve an url where fetch collection
         */
        initialize : function(options) {
            this.url = options.url || 'ressources/forms/formsExample.json'; //  get a default URL for client-side mode

            this.initHomePageChannel();
        },

        initHomePageChannel : function() {
            this.homePageChannel = Backbone.Radio.channel('homepage');
        },

        /**
         * Clone a model
         * @param  {int} modelID model to copy ID
         */
        cloneModel : function(modelID) {
            var original    = this.get(modelID).toJSON();
            original.id     = this.length + 1;
            original.name  += ' (copy)'

            this.add(new FormModel(original))
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

    return FormCollection;

});
