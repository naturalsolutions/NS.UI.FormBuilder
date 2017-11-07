define([
    'jquery',
    'marionette',
    'backbone',
    '../layout/EditionPageLayout',
    '../collection/FieldCollection'
], function($, Marionette, Backbone, EditionPageLayout, FieldCollection) {

    /**
     * EditionPageModule controller
     */
    return Marionette.Controller.extend({
        initialize: function(options) {
            // Kepp homepage region
            this.editionPageRegion = options.editionPageRegion;
            this.URLOptions        = options['URLOptions'] || {};

            this.setFieldCollection(null, options['URLOptions']);

            this.initFormChannel();
            this.getLinkedFieldsList();
            Backbone.Radio.channel('edition').on('saveTemplate', this.saveTemplate, this);
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
            this.formChannel.on('addNewElement', this.addNewElementToCollection, this);

            //  Event receive when user wants to export its form in JSON file
            this.formChannel.on('export', this.exportFormAsFile, this);

            //  Event send from router when user import a form or edit a form from the grid
            //this.formChannel.on('formEdition', this.editForm, this);

            //  Event receive from a field field (see BaseView.js) when user wants to edit field properties
            this.formChannel.on('editModel', this.modelSetting, this);

            //  Event send from settingFieldPanel when user wants to save a field as a preconfigurated field
            this.formChannel.on('saveConfiguration', this.saveConfiguration, this);

            this.formChannel.on('setFieldCollection', this.setFieldCollection, this);

            // working shit
            this.editionPageChannel = Backbone.Radio.channel('editionPage');
            this.editionPageChannel.on('edit', this.loadForm, this);
        },

        /**
         * Export current form (fieldCollection) in JSON file
         *
         * @param {string} filename filename
         */
        exportFormAsFile : function(filename) {
            require(['blobjs', 'filesaver'], _.bind(function(Blob, Filesaver) {
                try {
                    var blob = new Blob([JSON.stringify(this.fieldCollection.getJSON(), null, 2)], {
                        type: "application/json;charset=utf-8"
                    });

                    new Filesaver(blob, filename + '.json');

                    //  All is good
                    this.formChannel.trigger('exportFinished', true);
                } catch (e) {
                    //  An error occured when we try to save form as JSON file
                    this.formChannel.trigger('exportFinished', false);
                }
            }, this))
        },

        loadForm: function(form) {
            if (form && form.id) {
                $.ajax({
                    url: this.URLOptions.forms + '/' + form.id,
                    dataType: 'json',
                    success: _.bind(function (data) {
                        this.display(data['form']);
                    }, this),
                    error: _.bind(function (error) {
                        // todo swal
                        console.error("couldn't retreive form", error);
                    }, this)
                });
                return;
            }
            this.display(form);
        },

        display: function(jsonForm) {
            this.fieldCollection.updateWithJSON(jsonForm);
            // todo - do not create a new editionPage (memleak)
            var editionPageLayout = new EditionPageLayout({
                fieldCollection : this.fieldCollection,
                URLOptions      : this.URLOptions
            });

            this.editionPageRegion.show( editionPageLayout );
            this.currentEditionPageLayout = editionPageLayout;

            $('#mainRegion').animate({
                marginLeft : '-100%'
            }, 750);
        },

        /**
         * User wants to add a field into the collection
         *
         * @param {string} elementClassName field class like TextField
         */
        addElementToCollection : function(elementClassName) {
            this.fieldCollection.addElement(elementClassName);
        },

        /**
         * User wants to add a new field into the collection
         *
         * @param {string} newElementClassName new field class like TextField
         */
        addNewElementToCollection : function(newElementClassName, attributes) {
            this.lastNewElementAdded = this.fieldCollection.addElement(newElementClassName, attributes);
        },

        modelSetting: function(modelID) {
            if (modelID == false)
                modelID = this.lastNewElementAdded;

            //  Get many information with Ajax and send it to the layout
            //  And the layout display the setting panel

            this.formChannel.trigger('initFieldSetting', {
                URLOptions             : this.URLOptions,
                linkedFieldsList       : this.linkedFieldsList,
                modelToEdit            : this.fieldCollection.get(modelID),
                fieldsList             : this.fieldCollection.getFieldList(modelID)
            });
        },

        /**
         * Save the collection as a for template
         *
         * @param templateAttributes new template attributes
         */
        saveTemplate : function(templateAttributes) {
            this.fieldCollection.updateCollectionAttributes(templateAttributes);

            this.fieldCollection.saveAsTemplate();
        },

        setFieldCollection : function(context, urloptions, formName)
        {
            var formSaveUrl = null;
            if (urloptions)
                formSaveUrl = urloptions['formSaveURL'];

            if (this.URLOptions['formSaveURL']) {
                this.fieldCollection = new FieldCollection({}, {
                    name         : formName || 'New form',
                    url          : this.URLOptions['formSaveURL'] + (context != "all" ? "/" + context : "") || formSaveUrl,
                    context      : context || "all",
                    URLOptions   : this.URLOptions || ""
                });
            }

            this.fieldCollection.reset();
        }
    });
});
