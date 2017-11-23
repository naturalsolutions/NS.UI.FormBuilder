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
            this.linkedFieldsList = this.getLinkedFieldsList();
            Backbone.Radio.channel('edition').on('saveTemplate', this.saveTemplate, this);
        },

        /**
         * Get all avalaible linked field
         */
        getLinkedFieldsList : function() {
            var linkedFields = {};
            $.ajax({
                type: 'GET',
                url: this.URLOptions.linkedFields,
                contentType: 'application/json',
                crossDomain: true,
                async: false,
                success: _.bind(function(data) {
                    linkedFields = data;
                }, this),
                error: _.bind(function(xhr) {
                    console.error("error fetching linked fields at '",
                        this.URLOptions.linkedFields + "': " + xhr.status + " " + xhr.statusCode);
                }, this)
            });
            return linkedFields;
        },

        /**
         * Init form channel only for edition page module communication
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Event receive when user wants to export its form in JSON file
            this.formChannel.on('export', this.exportFormAsFile, this);
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
            if (this.loadingForm) return;
            this.loadingForm = true;
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
            } else {
                this.display(form);
            }
        },

        display: function(jsonForm) {
            this.fieldCollection.updateWithJSON(jsonForm);

            if (!this.currentEditionPageLayout) {
                this.currentEditionPageLayout = new EditionPageLayout({
                    fieldCollection: this.fieldCollection,
                    URLOptions: this.URLOptions,
                    linkedFieldsList: this.linkedFieldsList
                });
            } else {
                this.currentEditionPageLayout.update(this.fieldCollection);
                this.currentEditionPageLayout.render();
            }
            this.editionPageRegion.show(this.currentEditionPageLayout);

            $('#mainRegion').animate({
                marginLeft : '-100%'
            }, 750);

            // wait before animation is done (& some), or the user can fuck us
            // while animation is playing. Double form loading is not cool.
            setTimeout(_.bind(function() {
                this.loadingForm = false;
            }, this), 1000);
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
                this.fieldCollection.linkedFieldsList = this.linkedFieldsList;
            }

            this.fieldCollection.reset();
        }
    });
});
