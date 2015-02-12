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
            this.getLinkedFieldsList();
            this.getPreConfiguratedFields();
        },

        /**
         * Get all pre configurated field
         */
        getPreConfiguratedFields : function () {
            $.getJSON(this.URLOptions.preConfiguredField, _.bind(function(fieldList) {
                this.preConfiguredFieldList = fieldList;
            }, this))
        },

        /**
         * Get all avalaible linked field
         */
        getLinkedFieldsList : function() {
            $.getJSON(this.URLOptions.linkedFields, _.bind(function(linkedFieldsList) {
                this.linkedFieldsList = linkedFieldsList;
            }, this));
        },

        /**
         * Init form channel only for edition page module communication
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Event receive from widgetPanel when user want to add a field on its form
            this.formChannel.on('addElement', this.addElementToCollection, this);

            //  Event receive when user wants to export its form in JSON file
            this.formChannel.on('export', this.exportFormAsFile, this);

            //  Event send from router when user import a form or edit a form from the grid
            this.formChannel.on('formEdition', this.editForm, this);

            this.formChannel.on('import', this.import, this);

            //  Event receive from a field field (see BaseView.js) when user wants to edit field properties
            this.formChannel.on('editModel', this.modelSetting, this);
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
         * Main controller action, display edition page layout
         */
        editionAction: function(options) {
            $('#navbarContext').text($.t('navbar.context.edition'))

            this.fieldCollection = new FieldCollection({}, {
                name : 'New form'
            });

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

            //  Get many informations with Ajax and send it to the layout
            //  And the layout display the setting panel

            this.formChannel.trigger('initFieldSetting', {
                URLOptions             : this.URLOptions,
                linkedFieldsList       : this.linkedFieldsList,
                preConfiguredFieldList : this.preConfiguredFieldList,
                modelToEdit            : this.fieldCollection.get(modelID),
                fieldsList             : this.fieldCollection.getFieldList(modelID)

            });
        },


        editForm : function(formToEdit) {
            //  Send event to formPanelView
            this.formChannel.trigger('formToEdit', formToEdit);
        },

        /**
         * Send event to form view pnale
         *
         * @param  {Object} formImportedJSON imported form JSON data
         */
        import : function(formImportedJSON) {
            //  Send event to formview panel for display imported form
            this.formChannel.trigger('formToEdit', formImportedJSON);
        }

    });

    return EditionPageController;

});
