define([
    'jquery',
    'marionette',
    'text!editionPageModule/templates/FormPanel/View.html',
    'text!editionPageModule/templates/FormPanel/ViewRO.html',
    'text!editionPageModule/templates/FormPanel/Reneco/View.html',
    'text!editionPageModule/templates/FormPanel/Reneco/ViewRO.html',
    'sweetalert',
    '../../Translater',
    '../../app-config',
    'i18n',
    'slimScroll'    
], function($, Marionette, FormPanelViewTpl, FormPanelViewRO, FormPanelViewReneco, FormPanelViewROReneco, swal, Translater, AppConfig) {

    var translater = Translater.getTranslater();
    
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
            'click #editForm'     : 'formSettings',
            'click #export'       : 'export',
            'click #clearAll'     : 'clear',
            'click #save'         : 'save',
            'click #exit'         : 'exit',
            'click .sizepreview'  : 'sizepreview'
        },


        /**
         * FormView template configuration
         *
         * @return {string} Compiled underscore template
         */
        template : function() {
            var topcontext = "";
            if (AppConfig.appMode.topcontext != "classic")
            {
                topcontext = AppConfig.appMode.topcontext
            }

            if (topcontext == "reneco")
            {
                return _.template(FormPanelViewReneco)({
                    collection : this.collection.getAttributesValues()
                });
            }
            return _.template(FormPanelViewTpl)({
                collection : this.collection.getAttributesValues()
            });
        },

        /**
         * Form view constructor
         *
         * @param  {object} options configuration options like web service URL for back end connection
         */
        initialize : function(options, readonly) {
            var topcontext = "";
            if (AppConfig.appMode.topcontext != "classic")
            {
                topcontext = AppConfig.appMode.topcontext
            }

            if (readonly)
            {
                this.template = function(){
                    return _.template(FormPanelViewRO)({
                        collection : this.collection.getAttributesValues()
                    })};
                if (topcontext == "reneco")
                    this.template = function(){
                        return _.template(FormPanelViewROReneco)({
                            collection : this.collection.getAttributesValues()
                        })};
            }

            this.collection     = options.fieldCollection;
            this._view          = {};
            this.URLOptions     = options.URLOptions;
            this._viewCount     = 0;

            //  Bind collection events
            this.collection.bind('add', this.addElement, this);         //  new element added on the collection
            this.collection.bind('remove', this.removeElement, this);   //  element removed from the collection

            _.bindAll(this, 'template', 'save');

            this.initFormChannel();
            this.initMainChannel();
            this.initCollectionChannel();
        },

        /**
         * Initialize collectionView channel, the collectionView channel is a private channel between the formView and the subForm views
         * It is used when view are added or removed from a subForm view
         */
        initCollectionChannel : function() {
            //  This channel is used between the form view and all subForm view
            //  The goal is to pass information when a view is dragged and dropped inside or outside of a subForm view
            this.collectionChannel = Backbone.Radio.channel('collectionView');

            //  Event send by a subForm view when a BaseView is dropped in
            this.collectionChannel.on('viewDrop', this.viewDrop, this);
        },

        /**
         * Callback executed when a BaseView is dropped in a subForm View
         *
         * @param subFormView subForm View where a BaseView was dropped in
         */
        viewDrop : function(subFormView) {

            var droppedView = this._view[subFormView.viewDroppedId],
                droppedViewModel = droppedView.model;

            droppedView.destroy_view();
            delete droppedView;

            //subFormView.destroy_view()
            //  We send to the subFormView the BaseView object
            //  The subForm view has to move the BaseView from the main form view to its HTML container
            this.collectionChannel.trigger('viewDropped:' + subFormView.id, droppedViewModel);
        },

        /**
        * Init form channel
        * This channel concerns only form functionnality like create a form to edit model
        */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  This event is send from the router with the ajax request result
            //  And we display message with sweet alert
            this.formChannel.on('save:success',      this.displaySucessMessage);
            this.formChannel.on('save:fail',      this.displayFailMessage);
            this.formChannel.on('save:formIncomplete',      this.displayIncompleteFormMessage);
            this.formChannel.on('save:fieldIncomplete',      this.displayIncompleteFieldMessage);
            this.formChannel.on('save:hasDuplicateFieldNames',      this.displayHasDuplicateFieldNames);

            this.formChannel.on('template:success',      this.displaytemplateMessage);
            this.formChannel.on('template:fail',      this.displayFailtemplatee);

            //  Event send from Formbuilder.js when export is finished (success or not)
            this.formChannel.on('exportFinished',   this.displayExportMessage, this);

            //  Disable footer actions when user wants to edit a field
            this.formChannel.on('editModel',   this.disableFooterAndClearField, this);

            //  Event send by fieldCollection when the update is done
            this.formChannel.on('collectionUpdateFinished', this.collectionUpdateFinished, this);
        },

        /**
         * Init main channel ONLY for this module and listen some events
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('edition');
            this.mainChannel.on('editionDone', this.updateCollectionAttributes, this);

            //  These events is receive when a user close the setting panel
            //  When the setting panel is closed we can show footer action
            this.mainChannel.on('formCancel', this.enableFooterActions, this);
            this.mainChannel.on('formCommit', this.enableFooterActions, this);
        },

        /**
         * Update collection attributes and display its new name when edition is done
         *
         * @param  {Object} collection updated attributes
         */
        updateCollectionAttributes : function(newCollectionAttributes) {
            this.updateName();
            this.enableFooterActions();
            this.collection.updateCollectionAttributes(newCollectionAttributes);
        },

        /**
        * Send an event to the setting view (settingView.js) to display properties form
        * Channel send on the form channel
        */
        formSettings : function() {
            //this.$el.find('#edit').animate({opacity : 0.2}).prop('disabled', true);
            //this.disableFooterActionsAndExit();
            this.formChannel.trigger('editForm', this.collection);
        },

        /**
         * Update form fields count when an element was removed
         */
        removeElement : function() {
            //this._viewCount--;

            this.updateFieldCount();
        },

        /**
         * Create the view for the fresh added element
         *
         * @param {object} newModel new added field
         */
        addElement: function (newModel) {
            if (!newModel.get('isUnderFieldset')) {
                //  We only create view for model who are not in a fieldset
                //  If a model if in a fieldset, the fieldset view render the subView

                var viewClassName = newModel.constructor.type + "FieldView";

                if (newModel.constructor.type === "Numeric") {
                    newModel.on('change:decimal', function (e) {
                        e.baseSchema['precision']['fieldClass'] = e.get('decimal') ? "advanced" : "";
                    })
                }
                require(['editionPageModule/views/fieldViews/' + viewClassName], _.bind(function (fieldView) {

                    //  View file successfully loaded
                    var id = "dropField" + newModel['id'];

                    $('.drop').append('<div class="dropField" id="' + id + '" data-order="' + newModel.get('order') + '" ></div>');

                    var vue = new fieldView({
                        el: '#' + id,
                        model: newModel,
                        collection: this.collection,
                        urlOptions: this.URLOptions
                    }, Backbone.Radio.channel('global').readonly);
                    if (vue !== null) {
                        vue.render();
                        this._view[id] = vue;
                        this.updateScrollBar();

                        //
                        //  Field queue
                        //
                        //  Now the view is rendered so we can send an event to the FieldCollection
                        //  See FieldCollection createFieldFromSchema method
                    }

                    $(".actions").i18n();

                }, this), function (err) {
                    swal(
                        translater.getValueFromKey('modal.field.error' + err) || "Echec de l'ajout!",
                        translater.getValueFromKey('modal.field.errorMsg' + err) || "Une erreur est survenue lors de l'ajout du champ !",
                        "error"
                    );
                });

            }

            this._viewCount++;
            this.updateFieldCount();
        },

        /**
         * Update field count
         */
        updateFieldCount : function() {
            this.$el.find('#count').text(  $.t("fieldCount.field", { count: this.collection.length }) );

            // Hides bottom buttons when collection length is 0
            // this[this.collection.length > 0 ? 'enableFooterActions' : 'disableFooterActions']();
        },

        /**
         * Update perfect scrollbar size and position (for example when user add field in the form)
         */
        updateScrollBar : function(height) {
            var scrollToHeight = height || this.$el.find('#scrollSection').height();
            this.$el.find('#scrollSection').slimScroll({ scrollTo: scrollToHeight });
        },

        /**
         * Rendering callback
         */
        onRender : function(options) {

            this.updateName();
            //  By default marionette wrap template with a div
            //  We remove it and update view HTML element reference
            this.$el = this.$el.children();
            this.$el.unwrap();
            this.setElement(this.$el);

            // run i18next translation in the view context
            this.$el.i18n();

            this.$el.find('.drop').sortable({
                axis: "y",
                handle : '.paddingBottom5',
                cursor: "move",

                update : _.bind(function( event, ui ) {
                    for (var v in this._view) {
                        this._view[v].updateIndex( $('#' + v).index());
                    }
                }, this)
            });

            this.$el.find('.drop').disableSelection();

            this.$el.find('#scrollSection').slimScroll({
                height        : '90%',
                railVisible   : true,
                alwaysVisible : true,
                railColor     : "#111"
            });

            this.updateFieldCount();

            //  Send an event to notify the render is done
            this.formChannel.trigger('renderFinished');
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
         * Run when user wants to save current form on the server
         * Trigger an event for the router on the form channel
         */
        save : function() {
            this.checkRules();
        },

        checkRules : function(callbackAfterRulesCheck) {

            require(['app-config'], _.bind(function(appConfig) {

                var ruleResult  = true;

                _.each(appConfig.rules, _.bind(function(rule) {

                    ruleResult = rule.execute(this.collection.toJSON());

                    if (!ruleResult) {
                        this.displayRuleMessage(rule.error);
                        ruleResult = false;
                    }

                }, this));

                if (!ruleResult){
                    return false;
                }

                this.saveCollection();

            }, this));

        },

        saveCollection : function() {

            this.collection.save();
        },

        displayRuleMessage : function(error) {
            swal(error.title, error.content, "error");
        },

        /**
        * Display a sweet alert and ask the classic "Are you sur ?"
        * And clear the current form if the user agrees
        */
        clear : function() {
            var self = this;
            swal({
                title              : translater.getValueFromKey('modal.clear.title') || "Etes vous sûr ?",
                text               : translater.getValueFromKey('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : translater.getValueFromKey('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : translater.getValueFromKey('modal.clear.no') || "Annuler",
                closeOnConfirm     : false,
                closeOnCancel      : true
            }, function(isConfirm) {

                if (isConfirm) {
                    _.map(self._view, function(el) {
                        el.removeView();
                    })
                    swal(
                        translater.getValueFromKey('modal.clear.deleted') || "Supprimé !",
                        translater.getValueFromKey('modal.clear.formDeleted') || "Votre formulaire a été supprimé !",
                        "success"
                    );
                    self.collection.clearAll();
                    self._viewCount = 0;
                }
            });

        },

        /**
         * Display a message when the export is finished or failed
         *
         * @param result if the export is right done or not
         */
        displayExportMessage : function(result) {
            if (result) {
                swal(
                    translater.getValueFromKey('modal.export.success') || "Export réussi !",
                    "",
                    "success"
                )
            } else {
                swal(
                    translater.getValueFromKey('modal.export.error') || "Echec de l'export !",
                    translater.getValueFromKey('modal.export.errorMsg') || "Une erreur est survenue lors de l'export",
                    "error"
                )
            }
        },

        /**
         * Display a message when the form has been saved
         */
        displaySucessMessage : function() {
            swal(
                translater.getValueFromKey('modal.save.success') || "Sauvé !",
                translater.getValueFromKey('modal.save.successMsg') || "Votre formulaire a été enregistré sur le serveur !",
                "success"
            );
        },

        /**
         * Display a message if the form couldn't be saved
         */
        displayFailMessage : function(textKey, textValue) {
            if (textKey)
            {
                swal(
                    translater.getValueFromKey('modal.save.error') || "Une erreur est survenue !",
                    translater.getValueFromKey(textKey) + (textValue?textValue:"") || "Votre formulaire n'a pas été enregistré !\nPensez à faire un export",
                    "error"
                );
            }
            else
            {
                swal(
                    translater.getValueFromKey('modal.save.error') || "Une erreur est survenue !",
                    translater.getValueFromKey('modal.save.errorMsg') || "Votre formulaire n'a pas été enregistré !\nPensez à faire un export",
                    "error"
                );
            }
        },

        displayIncompleteFormMessage: function() {
            swal(
                translater.getValueFromKey('modal.save.uncompleteFormerror') || "Une erreur est survenue !",
                translater.getValueFromKey('modal.save.uncompleteForm') || "Votre formulaire n'a pas été totallement renseigné",
                "error"
            );
        },

        displayIncompleteFieldMessage: function() {
            swal(
                translater.getValueFromKey('modal.save.uncompleteFielderror') || "Une erreur est survenue !",
                translater.getValueFromKey('modal.save.uncompleteField') || "Un de vos champs n'a pas été totallement renseigné",
                "error"
            );
        },

        displayHasDuplicateFieldNames: function() {
            swal(
                translater.getValueFromKey('modal.save.hasDuplicateFieldNamesError') || "Une erreur est survenue !",
                translater.getValueFromKey('modal.save.hasDuplicateFieldNames') || "Certains de vos champs ont des noms identiques",
                "error"
            );
        },

        /**
         * Display footer actions like export and save
         */
        enableFooterActions : function() {
            this.$el.find('#edit').fadeIn('500').prop('disabled', false).animate({opacity : 1});
            this.$el.find('#exit').show();
            if (this.collection.length > 0) {
                this.$el.find('footer button:not(#exit)').show();
            }
        },

        /**
         * Hide footer actions
         */
        disableFooterActions : function() {
            //this.$el.find('footer button:not(#exit)').hide();
        },

        /**
         * Disable current selected field
         */
        clearSelectedFied : function(modelToKeepSelect) {
            var modelToKeepSelectedID = '#dropField' + modelToKeepSelect;

            //this.$el.find('.dropField').not(modelToKeepSelectedID).css('background', 'red');

            this.$el.find('.dropField').not(modelToKeepSelectedID).find('.element').removeClass('selected');
            // REMOVED FOR NOW this.$el.find('.dropField').not(modelToKeepSelectedID).find('.actions').removeClass('locked');
        },

        /**
         *
         */
        disableFooterAndClearField : function(modelToEditID) {
            this.disableFooterActionsAndExit();
            this.clearSelectedFied(modelToEditID);
        },

        /**
         * Hide all footer action
         */
        disableFooterActionsAndExit : function() {
            //this.$el.find('footer button').hide();
        },

        /**
         * Display a confirm dialog when user wants to exit
         */
        exit : function() {
            if (!Backbone.Radio.channel('global').readonly){
                var self = this;
                swal({
                    title              : translater.getValueFromKey('modal.clear.title') || "Etes vous sûr ?",
                    text               : translater.getValueFromKey('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                    type               : "warning",
                    showCancelButton   : true,
                    confirmButtonColor : "#DD6B55",
                    confirmButtonText  : translater.getValueFromKey('modal.exit.yes') || "Oui, quitter",
                    cancelButtonText   : translater.getValueFromKey('modal.clear.no') || "Annuler",
                    closeOnConfirm     : true,
                    closeOnCancel      : true
                }, function(isConfirm) {
                    if (isConfirm) {
                        self.clearFormAndExit();
                    }
                });
            }
            else
                this.clearFormAndExit();
        },

        /**
         * Clear form and return to the homepage
         * The controller does the redirection, the view send just an event
         */
        clearFormAndExit : function() {
            this.collection.reset();
            this.formChannel.trigger('exit');
            this._viewCount = 0;
        },

        /**
         * Set H1 text when the update is done
         */
        updateName: function () {
            console.log("NAME UPDATED ! : ", this.collection.name);
            this.$el.find('#collectionName').text(this.collection.name);
        },

        collectionUpdateFinished : function() {
            this.updateName();

            /*
            if ($('#collectionName').text().toLowerCase() == "new form")
            {
                this.formSettings();
            }
            */

            console.log("yo boiz !");
            this.formSettings();

            //this.$el.find('#scrollSection').scrollTop(0);
            //this.$el.find('#scrollSection').animate({ scrollTop: 0 }, "fast");
        },



        displaytemplateMessage : function() {
            swal(
                translater.getValueFromKey('modal.template.success') || "Sauvé !",
                translater.getValueFromKey('modal.template.successMsg') || "Votre formulaire a été enregistré comme template !",
                "success"
            );
        },

        displayFailtemplatee : function() {
            swal(
                translater.getValueFromKey('modal.template.error') || "Une erreur est survenu !",
                translater.getValueFromKey('modal.template.errorMsg') || "Votre formulaire n'a pas été enregistré comme template.",
                "error"
            );
        },

        sizepreview : function() {
            var previewBtn = $(".sizepreview");
            if(previewBtn.hasClass("selected"))
            {
                previewBtn.removeClass("selected");
                $.each(this.collection.models, function(index, value){
                    var currentInput = $(".dropField#dropField" + value.id);
                    currentInput.removeClass("col-xs-" + value.attributes.fieldSize);
                });
                $(".actions").show();
            }
            else
            {
                previewBtn.addClass("selected");
                $.each(this.collection.models, function(index, value){
                    var currentInput = $(".dropField#dropField" + value.id);
                    currentInput.addClass("col-xs-" + value.attributes.fieldSize);
                });
                $(".actions").hide();
            }
        }
    });

    return FormPanelView;

});
