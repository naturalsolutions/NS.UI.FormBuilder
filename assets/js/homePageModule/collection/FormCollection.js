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
            this.update(options);
            this.initHomePageChannel();
        },

        /**
         * update resets url and stuff for fetching
         * @param options
         */
        update: function(options) {
            this.url = options.url || 'ressources/forms/formsExample.json'; //  get a default URL for client-side mode
            if (options.url && options.context)
                this.url = options.url + "/" + options.context;
        },

        initHomePageChannel : function() {
            this.homePageChannel = Backbone.Radio.channel('homepage');
        },

        /**
         * Clone a model
         * @param  {int} modelID model to copy ID
         */
        cloneModel : function(modelID) {
            //  Get information from original form
            //  We remove id and add "copy" word at the end
            var original    = this.get(modelID).toJSON();
            delete original.id;
            original.name  += ' (copy)';

            //  Create field
            var field = new FormModel(original);

            this.add(field);

            //  Save field
            field.urlRoot = this.url;

            field.save(field, {
                success : _.bind(function(model, response, options) {
                    field.id = response.id;
                    this.homePageChannel.trigger('duplicate:success');
                }, this),
                error : _.bind(function(model, response, options) {
                    this.homePageChannel.trigger('duplicate:error');
                }, this)
            });
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
