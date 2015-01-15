define(['backbone', '../models/FormModel'], function (Backbone, FormModel) {

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
        },

        /**
         * Clone a model
         * @param  {integer} modelID model to copy ID
         */
        cloneModel : function(modelID) {
            var original    = this.get(modelID).toJSON();
            original.id     = this.length + 1;
            original.name  += ' (copy)'

            this.add(new FormModel(original))
        }

    });

    return FormCollection;

});
