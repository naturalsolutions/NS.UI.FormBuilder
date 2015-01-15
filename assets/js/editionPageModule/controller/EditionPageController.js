define([
    'jquery',
    'marionette',
    '../layout/EditionPageLayout',
    '../collection/FieldCollection',
    'backbone.radio'
], function($, Marionette, EditionPageLayout, FieldCollection, Radio) {

    /**
     * EditionPageModule controller
     */
    var EditionPageController = Marionette.Controller.extend({


        /**
         * Controller constructor
         *
         * @param  {object} options Configuration variable
         */
        initialize: function(options) {
            // Kepp homepage region
            this.editionPageRegion = options.editionPageRegion;

            this.fieldCollection = new FieldCollection({}, {
                name : 'New form'
            });

            this.URLOptions = options['URLOptions'] || {};

            this.initFormChannel();
        },


        /**
         * Init form channel only for edition page module communication
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Event receive from widgetPanel when user want to add a field on its form
            this.formChannel.on('addElement', this.addElementToCollection, this);

            //  Event receive from formview when user want to edit field properties
            this.formChannel.on('edition', this.sendModelToSettingView, this);

            //  Event receive when user wants to export its form in JSON file
            this.formChannel.on('export', this.exportFormAsFile, this);

            //  Event send from router when user import a form or edit a form from the grid
            this.formChannel.on('edition', this.editForm, this);

            this.formChannel.on('import', this.import, this);
        },


        /**
         * Export current form (fieldCollection) in JSON file
         *
         * @param {string} filename filename
         */
        exportFormAsFile : function(filename) {
            require(['blobjs', 'filesaver'], _.bind(function(Blob, Filesaver) {
                try {

                    var isFileSaverSupported = !!new Blob();
                    var blob = new Blob([JSON.stringify(this.fieldCollection.getJSON(), null, 2)], {
                        type: "application/json;charset=utf-8"
                    });

                    var fs = new Filesaver(blob, filename + '.json');

                    //  All is good
                    this.formChannel.trigger('exportFinished', true);
                } catch (e) {
                    //  An error occured when we try to save form as JSON file
                    this.formChannel.trigger('exportFinished', false);
                }
            }, this))
        },


        /**
         * FormChannel event callbacks
         * Send field model to the setting view
         *
         * @param {integer} modelID field id
         */
        sendModelToSettingView : function(modelID) {
            this.formChannel.trigger('modelToEdit', this.fieldCollection.get(modelID));
        },


        /**
         * Main controller action, display edition page layout
         */
        editionAction: function(options) {
            $('#navbarContext').text($.t('navbar.context.edition'))

            var editionPageLayout = new EditionPageLayout({
                fieldCollection : this.fieldCollection,
                URLOptions      : this.URLOptions
            });
            this.editionPageRegion.show( editionPageLayout );
        },


        /**
         * User wants to add a new fiel into the collection
         *
         * @param {string} newElementClassName new field class like TextField
         */
        addElementToCollection : function(newElementClassName) {
            this.fieldCollection.addElement(newElementClassName);
        },


        /**
        * This function is run when user wants to configure a field
        * Trigger an event with field ID to the formbuilder object (see formbuilder.js)
        *
        * @param  {integer} ID of the field to duplicate
        */
        modelSetting: function(modelID) {
            this.formChannel.trigger('edition', modelID);
        },

        editForm : function(formToEdit) {
            var newFieldCollection = new FieldCollection({}, formToEdit.toJSON());

            this.fieldCollection = newFieldCollection;

            this.formChannel.trigger('formToEdit', newFieldCollection);
        },

        import : function(formImportedJSON) {
            this.formChannel.trigger('formToEdit', formImportedJSON);
        }

    });

    return EditionPageController;

});
