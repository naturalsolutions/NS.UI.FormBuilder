define([
    'jquery',
    'marionette',
    'text!../templates/FormPanelView.html',
    'sweetalert',
    '../../Translater',
    '../../app-config',
    '../collection/staticInputs/ContextStaticInputs',
    '../models/Fields',
    './fieldViews/All',
    'i18n',
    'slimScroll'    
], function($, Marionette, FormPanelViewTpl, swal,
            Translater, AppConfig, ContextStaticInputs, Fields, AllFieldViews) {

    var translater = Translater.getTranslater();
    var staticInputs = ContextStaticInputs;

    /**
     * The form view represents the current form. It's a the edition module main view.
     */
    var FormPanelView = Backbone.Marionette.ItemView.extend({
        events : {
            'click #export'       : 'export',
            'click #clearAll'     : 'clear',
            'click .sizepreview'  : 'sizepreview',
            'click #datasImg'     : 'popDatasImg'
        },
        template : function() {
            return _.template(FormPanelViewTpl) ({
                collection : this.collection.getAttributesValues(),
                context: this.context,
                topcontext: this.topcontext,
                readonly: this.readonly
            });
        },

        initialize : function(options, readonly) {
            window.formbuilder.formedited = false;

            this.topcontext = AppConfig.appMode.topcontext;
            this.context = window.context || $("#contextSwitcher .selected").text();
            this.readonly = readonly;
            this.collection = options.fieldCollection;
            this._view = {};
            this.URLOptions = options.URLOptions;

            var that = this;
            $.ajax({
                data: {},
                type: 'GET',
                url:  this.URLOptions.forms + "/getAllInputNames/" + that.context,
                contentType: 'application/json',
                crossDomain: true,
                success: _.bind(function (data) {
                    data = JSON.parse(data);
                    that.collection.contextInputNames = data;
                }, this),
                error: _.bind(function (xhr) {
                    console.log("Ajax Error: " + xhr);
                }, this)
            });

            //  Bind collection events
            this.collection.bind('add', this.addElement, this);
            this.collection.bind('remove', this.removeElement, this);

            _.bindAll(this, 'template', 'save');

            this.initFormChannel();
            this.initMainChannel();
            this.collectionChannel = Backbone.Radio.channel('collectionView');
            this.collectionChannel.on('viewDrop', this.viewDrop, this);

            setStatics(this.context);
        },

        /**
         * Callback executed when a BaseView is dropped in a subForm View
         *
         * @param subFormView subForm View where a BaseView was dropped in
         */
        viewDrop : function(subFormView) {
            console.log("viewDrop", subFormView);

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
            this.formChannel.on('save:success', this.displaySucessMessage, this);
            this.formChannel.on('save:fail', this.displayFailMessage);
            this.formChannel.on('save:formIncomplete', this.displayIncompleteFormMessage);
            this.formChannel.on('save:fieldIncomplete', this.displayIncompleteFieldMessage);
            this.formChannel.on('save:hasDuplicateFieldNames', this.displayHasDuplicateFieldNames);

            this.formChannel.on('template:success', this.displaytemplateMessage);
            this.formChannel.on('template:fail', this.displayFailtemplatee);

            //  Event send from Formbuilder.js when export is finished (success or not)
            this.formChannel.on('exportFinished', this.displayExportMessage, this);

            //  Disable footer actions when user wants to edit a field
            this.formChannel.on('editModel', this.disableFooterAndClearField, this);
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
            this.updateName();
            this.enableFooterActions();
        },

        /**
         * Update form fields count when an element was removed
         */
        removeElement : function() {
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

                // FieldView exists?
                if (!AllFieldViews[viewClassName]) {
                    swal({
                        title: translater.getValueFromKey('modal.field.error') || "Echec de l'ajout!",
                        text: translater.getValueFromKey('modal.field.errorMsg') || "Une erreur est survenue lors de l'ajout du champ !",
                        type: "error",
                        closeOnConfirm: true
                    }, function(){
                        window.onkeydown = null;
                        window.onfocus = null;
                    });
                    return;
                }

                // prepare target element for field rendering
                var id = "dropField" + newModel['id'];
                var $field = $("<div>").addClass("dropField").attr("id", id);
                this.$el.find('.drop').append($field);

                // populate field / readonly if compulsory input
                var vue = new AllFieldViews[viewClassName]({
                    el: '#' + id,
                    model: newModel,
                    collection: this.collection,
                    urlOptions: this.URLOptions,
                    $container: this.$el.find(".drop")
                }, Backbone.Radio.channel('global').readonly ||
                    $.inArray(newModel.attributes.name, staticInputs.getCompulsoryInputs()) != -1);
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                    if (newModel.get('new')) {
                        // scroll to bottom if element was just inserted
                        this.$el.find('#scrollSection').slimScroll({ scrollTo: "99999px" });
                    }
                }

                $(".actions").i18n();
            }

            this.updateFieldCount();
        },

        updateFieldCount : function() {
            this.$el.find('#count').text($.t("fieldCount.field", {
                count: this.collection.length
            }));
        },

        /**
         * Rendering callback
         */
        onRender : function() {

            this.updateName();
            //  By default marionette wrap template with a div
            //  We remove it and update view HTML element reference
            this.$el = this.$el.children();
            this.$el.unwrap();
            this.setElement(this.$el);

            // run i18next translation in the view context
            this.$el.i18n();

            // init sortable section
            this.$el.find('.drop').sortable({
                axis: "y",
                handle : '.handle',
                cursor: "move",
                items: "tr:not(.static)",
                start: function(e) {
                    // place the element being dragged at the end
                    // of the table: its absolute position breakse the
                    // table display in case it is the first row
                    $(e.originalEvent.target).parent()
                        .insertAfter(".drop tr:last-of-type");
                },
                update : _.bind(function() {
                    // update fields indexes
                    for (var v in this._view) {
                        this._view[v].updateIndex( $('#' + v).index() - 1);
                    }
                }, this)
            });

            this.$el.find('.drop').disableSelection();

            this.$el.find('#scrollSection').slimScroll({
                height        : 'calc(100% - 20px)',
                railVisible   : true,
                alwaysVisible : true,
                railColor     : "#111"
            });

            this.updateFieldCount();
            this.collection.creadeFields();

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
            this.collection.save();
        },

        /**
        * Display a sweet alert and ask the classic "Are you sur ?"
        * And clear the current form if the user agrees
        */
        clear : function() {
            var self = this;
            swal({
                title              : translater.getValueFromKey('modal.clear.title') || "Etes vous sûr ?",
                text               : translater.getValueFromKey('modal.clear.fieldsdeleted') || "Les champs du formulaire seront supprimés !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : translater.getValueFromKey('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : translater.getValueFromKey('modal.clear.no') || "Annuler",
                closeOnConfirm     : true,
                closeOnCancel      : true
            }, function(isConfirm) {

                if (isConfirm) {
                    _.map(self._view, function(el) {
                        el.removeView();
                    });
                    swal({
                        title:translater.getValueFromKey('modal.clear.deleted') || "Supprimé !",
                        text:translater.getValueFromKey('modal.clear.formDeleted') || "Votre formulaire a été supprimé !",
                        type:"success",
                        closeOnConfirm: true
                    }, function(){
                        window.onkeydown = null;
                        window.onfocus = null;
                    });

                    self.collection.clearAll();
                    self.updateFieldCount();

                    window.formbuilder.formedited = true;
                }

                window.onkeydown = null;
                window.onfocus = null;
            });

        },

        /**
         * Display a message when the export is finished or failed
         *
         * @param result if the export is right done or not
         */
        displayExportMessage : function(result) {
            if (result) {
                swal({
                    title:translater.getValueFromKey('modal.export.success') || "Export réussi !",
                    text:"",
                    type:"success",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });
            } else {
                swal({
                    title:translater.getValueFromKey('modal.export.error') || "Echec de l'export !",
                    text:translater.getValueFromKey('modal.export.errorMsg') || "Une erreur est survenue lors de l'export",
                    type:"error",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });
            }
        },

        /**
         * Display a message when the form has been saved
         */
        displaySucessMessage : function() {
            this.dataUpdated = true;
            swal({
                title: translater.getValueFromKey('modal.save.success') || "Sauvé !",
                text: translater.getValueFromKey('modal.save.successMsg') || "Votre formulaire a été enregistré sur le serveur !",
                type: "success",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
        },

        /**
         * Display a message if the form couldn't be saved
         */
        displayFailMessage : function(textKey, textValue) {
            if (textKey)
            {
                swal({
                    title:translater.getValueFromKey('modal.save.error') || "Une erreur est survenue !",
                    text:translater.getValueFromKey(textKey) + (textValue ? textValue : "") || "Votre formulaire n'a pas été enregistré !\nPensez à faire un export",
                    type:"error",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });
            }
            else
            {
                swal({
                    title:translater.getValueFromKey('modal.save.error') || "Une erreur est survenue !",
                    text:translater.getValueFromKey('modal.save.errorMsg') || "Votre formulaire n'a pas été enregistré !\nPensez à faire un export",
                    type:"error",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });
            }
        },

        displayIncompleteFormMessage: function() {
            swal({
                title:translater.getValueFromKey('modal.save.uncompleteFormerror') || "Une erreur est survenue !",
                text:translater.getValueFromKey('modal.save.uncompleteForm') || "Votre formulaire n'a pas été totallement renseigné",
                type:"error",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
        },

        displayIncompleteFieldMessage: function() {
            swal({
                title:translater.getValueFromKey('modal.save.uncompleteFielderror') || "Une erreur est survenue !",
                text:translater.getValueFromKey('modal.save.uncompleteField') || "Un de vos champs n'a pas été totallement renseigné",
                type:"error",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
        },

        displayHasDuplicateFieldNames: function() {
            swal({
                title:translater.getValueFromKey('modal.save.hasDuplicateFieldNamesError') || "Une erreur est survenue !",
                text:translater.getValueFromKey('modal.save.hasDuplicateFieldNames') || "Certains de vos champs ont des noms identiques",
                type:"error",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
        },

        /**
         * Disable current selected field
         */
        clearSelectedFied : function(modelToKeepSelect) {
            var modelToKeepSelectedID = '#dropField' + modelToKeepSelect;
            this.$el.find('.dropField').not(modelToKeepSelectedID).find('.element').removeClass('selected');
        },

        /**
         *
         */
        disableFooterAndClearField : function(modelToEditID) {
            this.clearSelectedFied(modelToEditID);
        },

        /**
         * Display a confirm dialog when user wants to exit
         */
        exit : function() {
            if (!Backbone.Radio.channel('global').readonly){
                var self = this;
                if (window.formbuilder.formedited)
                {
                    swal({
                        title              : translater.getValueFromKey('modal.clear.title') || "Etes vous sûr ?",
                        text               : translater.getValueFromKey('modal.clear.loosingModifications') || "Vous allez perdre vos modifications !",
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

                        window.onkeydown = null;
                        window.onfocus = null;
                    });
                }
                else
                {
                    self.clearFormAndExit();
                }
            }
            else
                this.clearFormAndExit();
        },

        /**
         * Clear form and return to the homepage
         * The controller does the redirection, the view send just an event
         */
        clearFormAndExit : function() {
            Fields.getFormsListResult = undefined;
            this.collection.reset();
            this.formChannel.trigger('exit', this.dataUpdated);
        },

        /**
         * Set H1 text when the update is done
         */
        updateName: function () {
            var context = window.context || $("#contextSwitcher .selected").text();

            this.$el.find('#collectionName').text(this.collection.name);
            if (this.collection.originalID && this.collection.originalID > 0)
            {
                this.$el.find('#formOriginalIdArea').show();
                this.$el.find('#formOriginalID').text(this.collection.originalID);
                if (context != "track" && $("#datasImg").length > 0)
                {
                    $("#datasImg").remove();
                }
            }
        },

        displaytemplateMessage : function() {
            swal({
                title:translater.getValueFromKey('modal.template.success') || "Sauvé !",
                text:translater.getValueFromKey('modal.template.successMsg') || "Votre formulaire a été enregistré comme template !",
                type:"success",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
        },

        displayFailtemplatee : function() {
            swal({
                title:translater.getValueFromKey('modal.template.error') || "Une erreur est survenu !",
                text:translater.getValueFromKey('modal.template.errorMsg') || "Votre formulaire n'a pas été enregistré comme template.",
                type:"error",
                closeOnConfirm: true
            }, function(){
                window.onkeydown = null;
                window.onfocus = null;
            });
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
        },

        popDatasImg: function(){
            var context = window.context || $("#contextSwitcher .selected").text();

            if (context == "track")
            {
                swal({
                    title: "Datas linked to the form<br />'"+this.collection.name+"'<br />",
                    text: "<span id='formDatasArea'><span id='formDatasLoading'>Loading datas ...<br/><br/>"+
                    "<img style='height: 20px;' src='assets/images/loader.gif' /></span></span>",
                    html: true
                });
                $.ajax({
                    data: {},
                    type: 'GET',
                    url:  this.URLOptions.trackFormWeight + "/" + $("#formOriginalID").html(),
                    contentType: 'application/json',
                    crossDomain: true,
                    success: _.bind(function (data) {
                        data = JSON.parse(data);
                        $("#formDatasLoading").remove();
                        $.each(data.FormWeight, function(index, value){
                            $("#formDatasArea").append("<span>"+index+" : "+value+" saisies</span><br/>");
                        });
                    }, this),
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                    }, this)
                });
            }
        }
    });

    var setStatics = function(staticsToSet){
        var context = staticsToSet ||  window.context || $("#contextSwitcher .selected").text();
        if (context.toLowerCase() != "all")
            staticInputs = ContextStaticInputs.getStaticMode(context);
    };

    return FormPanelView;

});
