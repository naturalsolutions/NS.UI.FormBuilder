define([
    'marionette',
    'backbone.radio'
], function(Marionette, Radio) {

    var EditionePageRouter = Backbone.Marionette.AppRouter.extend({

        appRoutes: {
            "edition": "editionAction",
            'setting/:id'  : 'modelSetting',
        },

        initialize : function() {
            this.initEditionPageChannel();
            this.initFormChannel();
        },

        initEditionPageChannel : function() {
            this.editionPageChannel = Backbone.Radio.channel('editionPage');

            //  Event send from formbuilder js when user want to edit a form from the homepage list
            this.editionPageChannel.on('display', this.displayEditionPage, this);

            this.editionPageChannel.on('formImported', this.formImported, this);
        },

        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');
        },

        /**
         * Init formview with form to edit
         *
         * @param  {Object} formToEdit form to edit
         */
        displayEditionPage : function(formToEdit) {
            //  Start edition
            this.navigate('#edition', {
                trigger : true
            });
            //  Send event to formview
            this.formChannel.trigger('formEdition', formToEdit)
        },

        formImported : function(formAsJSON) {
            this.navigate('#edition', {
                trigger : true
            });
            this.formChannel.trigger('import', formAsJSON)
        },

    });

    return EditionePageRouter;

});
