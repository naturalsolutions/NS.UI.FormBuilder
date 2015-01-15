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

            this.editionPageChannel.on('display', this.displayEditionPage, this);

            this.editionPageChannel.on('formImported', this.formImported, this);
        },

        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');
        },

        displayEditionPage : function(formToEdit) {
            this.navigate('#edition', {
                trigger : true
            });
            this.formChannel.trigger('edition', formToEdit)
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
