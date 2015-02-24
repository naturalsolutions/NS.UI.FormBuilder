define([
    'jquery',
    'marionette',
    'text!editionPageModule/templates/FormPanelView.html',
    'i18n',
    'slimScroll'
], function($, Marionette, FormPanelViewTemplate) {

    /**
     * The form view represents the current form. It's a the edition module main view.
     */
    var FormPanelView = Backbone.Marionette.ItemView.extend({


        /**
         * jQuery events triggered by the form view
         *
         * @type {Object}
         */
        events : {
            'click h1>span'   : 'formSettings',
            'click #export'   : 'export',
            'click #clearAll' : 'clear',
            'click #save'     : 'save'
        },


        /**
         * FormView template configuration
         *
         * @return {string} Compiled underscore template
         */
        template : function() {
            return _.template(FormPanelViewTemplate)({
                collection : this.collection
            });
        },

        /**
         * Form view constructor
         *
         * @param  {object} options configuration options like web service URL for back end connection
         */
        initialize : function(options) {
            this.collection     = options.fieldCollection;
            this._view          = {};
            this.URLOptions     = options.URLOptions;
            this._viewCount     = 0;

            //  Bind collection events
            this.collection.bind('newElement', this.addElement, this);  //  new element added on the collection
            this.collection.bind('remove', this.removeElement, this)    //  element removed from the collection

            _.bindAll(this, 'template')

            this.initFormChannel();
            this.initMainChannel();
        },


        /**
        * Init form channel
        * This channel concerns only form functionnality like create a form to edit model
        */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Event send form EditionPageController when user want to edit a form from the homepage list
            this.formChannel.on('formToEdit', this.formToEdit, this);
        },

        /**
         * Init main channel ONLY for this module and listen some events
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('edition');

            this.mainChannel.on('editionDone', this.updateCollectionAttributes, this);
        },

        /**
         * Update collection attributes and display its new name when edition is done
         *
         * @param  {Object} collection updated attributes
         */
        updateCollectionAttributes : function(newCollectionAttributes) {
            this.collection.updateCollectionAttributes(newCollectionAttributes);
            this.$el.find('h1 label').text(newCollectionAttributes.name)
        },


        /**
        * Send an event to the setting view (settingView.js) to display properties form
        * Channel send on the form channel
        */
        formSettings : function() {
            this.formChannel.trigger('editForm', this.collection);
        },


        /**
         * Update form fields count when an elment was removed
         */
        removeElement : function() {
            this._viewCount--;
            this.updateFieldCount();
        },


        /**
         * Create the view for the fresh added element
         *
         * @param {object} newModel new added field
         */
        addElement: function (newModel) {

            var viewClassName = newModel.constructor.type + "FieldView";

            if (newModel.constructor.type === "Numeric") {
                newModel.on('change:decimal', function(e) {
                    e.baseSchema['precision']['fieldClass'] = e.get('decimal') ? "advanced" : "";
                })
            }

            require(['editionPageModule/views/fieldViews/' + viewClassName], _.bind(function(fieldView) {

                //  View file successfully loaded
                var id = "dropField" + newModel['id'];

                $('.drop').append('<div class="dropField " id="' + id  + '" ></div>');

                var vue = new fieldView({
                    el      : '#' + id,
                    model   : newModel,
                    collection : this.collection
                });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;

                    this.updateScrollBar();
                }

                $(".actions").i18n();

                this._viewCount++;
                this.updateFieldCount();

            }, this), function(err) {
                swal(
                    $.t('modal.field.error')    || "Echec de l'ajout!",
                    $.t('modal.field.errorMsg') || "Une erreur est survenue lors de l'ajout du champ !",
                    "error"
                );
            });
        },

        /**
         * Update field count
         */
        updateFieldCount : function() {
            this.$el.find('.first').text(this._viewCount)
        },

        /**
         * Update perfect scrollbar size and position (for example when user add field in the form)
         */
        updateScrollBar : function() {
            var scrollToHeight = this.$el.find('#scrollSection').height();
            this.$el.find('#scrollSection').slimScroll({ scrollTo: scrollToHeight });
        },


        /**
         * Rendering callbask
         */
        onRender : function(options) {
            //  By default marionette wrap template with a div
            //  We remove it and update view HTML element reference
            this.$el = this.$el.children();
            this.$el.unwrap();
            this.setElement(this.$el);

            // run i18nnext translation in the view context
            this.$el.i18n();

            this.$el.find('#scrollSection').slimScroll({
                height        : '90%',
                railVisible   : true,
                alwaysVisible : true
            });
        },


        /**
        * Display modal view when user wants to export him form
        * When modal view is hidden we send an event on the form channel to send data (filename), see formbuilder.js
        */
        export : function() {
            require(['editionPageModule/modals/ExportModalView'], _.bind(function(ExportModalView) {

                //  Add new element for modal view
                $('body').append('<div class="modal  fade" id="exportModal"></div>');

                //  Create view and render it
                var modalView = new ExportModalView({
                    el: "#exportModal",
                    URLOptions: this.URLOptions
                });
                $('#exportModal').append( modalView.render() );
                $("#exportModal").i18n();

                //  Listen to view close event
                //  When modal is closed we get typed data user
                $('#exportModal').on('hidden.bs.modal', _.bind(function () {
                    var datas = modalView.getData();
                    if( datas['response']) {

                        //  Send event to edition page controller for export form in JSON file
                        //  We send the filename typed by the user
                        this.formChannel.trigger('export', datas['filename'] );

                        $('#exportModal').modal('hide').removeData();
                        $('#exportModal').html('').remove();
                    }
                }, this));

            }, this));
        },

        /**
        * Display a sweet alert and ask the classic "Are you sur ?"
        * And clear the current form if the user agrees
        */
        clear : function() {
            var self = this;

            swal({
                title              : $.t('modal.clear.title') || "Etes vous sûr ?",
                text               : $.t('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : $.t('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : $.t('modal.clear.no') || "Annuler",
                closeOnConfirm     : false,
                closeOnCancel      : true
            }, function(isConfirm) {

                if (isConfirm) {
                    _.map(self._view, function(el) {
                        el.removeView();
                    })
                    swal(
                        $.t('modal.clear.deleted') || "Supprimé !",
                        $.t('modal.clear.formDeleted') || "Votre formulaire a été supprimé !",
                        "success"
                    );
                    self.collection.clearAll();
                    self._viewCount = 0;
                }
            });

        },

        /**
         * Display choosen form in the form view for edit it
         * @param  {Object} form to edit
         */
        formToEdit : function(formToEdit) {
            this.collection.updateWithJSON(formToEdit);
            this.render();

        }
    });

    return FormPanelView;

});
