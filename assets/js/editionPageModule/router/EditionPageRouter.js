define([
    'marionette',
    'backbone.radio'
], function(Marionette, Radio) {

    var EditionePageRouter = Backbone.Marionette.AppRouter.extend({

        appRoutes: {
            "edition": "editionAction"
        },

        initialize : function() {
            this.initEditionPageChannel();
            this.initFormChannel();
            this.initGlobalChannel();
        },

        initEditionPageChannel : function() {
            this.editionPageChannel = Backbone.Radio.channel('editionPage');

            //  Event send from formbuilder js when user want to edit a form from the homepage list
            this.editionPageChannel.on('display', this.displayEditionPage, this);
        },

        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Return to homepage
            //  Event send by FormPanelView when user click on "exit" button
            this.formChannel.on('exit', this.exit, this);

            //  Event send by formPanel view when render is done
            //  Send data to the controller
            this.formChannel.on('renderFinished', this.sendJsonDataToController, this);

            //  Event send by Formbuilder when user wants to import a form from the homepage
            this.editionPageChannel.on('formImported', this.displayEditionPage, this);
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');
        },

        /**
         * Init formview with form to edit
         *
         * @param  {Object} formToEdit form to edit
         */
        displayEditionPage : function(formToEdit) {

            //  Keep data in memory
            this.formAsJSON = formToEdit;

            //  Go to edition page
            this.navigate('#edition', {
                trigger : true
            });
        },

        sendJsonDataToController : function() {
            //  Call import controller function
            this.options.controller.import(this.formAsJSON);
        },

        exit : function() {
            this.navigate('#');
            this.globalChannel.trigger('displayHomePage');
            Backbone.Radio.channel('grid').trigger('resetCollection');
        }

    });

    return EditionePageRouter;

});
