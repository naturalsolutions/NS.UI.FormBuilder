define([
    'jquery',
    'marionette',
    'text!../templates/FormPanelView.html',
    'tools',
    '../../Translater',
    '../../app-config',
    '../collection/staticInputs/ContextStaticInputs',
    '../models/Fields',
    './fieldViews/All',
    'i18n',
    'slimScroll'
], function($, Marionette, FormPanelViewTpl, tools,
            Translater, AppConfig, ContextStaticInputs, Fields, AllFieldViews) {

    var translater = Translater.getTranslater();
    var staticInputs = ContextStaticInputs;

    /**
     * The form view represents the current form. It's a the edition module main view.
     */
    var FormPanelView = Backbone.Marionette.ItemView.extend({
        events : {
            'click #export'       : 'export',
            'click .sizepreview'  : 'sizepreview',
            'click #datasImg'     : 'popDatasImg'
        },

        template : function() {
            return _.template(FormPanelViewTpl) ({
                collection : this.collection.getAttributesValues(),
                context: this.context,
                topcontext: this.topcontext,
                readonly: this.readonly,
                columns: this.columns
            });
        },

        initialize : function(options, readonly) {
            this.topcontext = AppConfig.appMode.topcontext;
            this.readonly = readonly;
            this.collection = options.fieldCollection;
            this.context = this.collection.context;
            this._view = {};
            this.URLOptions = options.URLOptions;

            this.columns = AppConfig.editColumns[this.context];
            if (!this.columns) {
                this.columns = AppConfig.editColumns.default;
            }

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

            setStatics(this.context);
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
                    tools.swal("error", "modal.field.error", "modal.field.errorMsg");
                    return;
                }

                // prepare target element for field rendering
                var id = "dropField" + newModel['id'];
                var $field = $("<div>").addClass("dropField").attr("id", id);

                // check that order is not set to last (converted field)
                var order = newModel.get('order');
                if (order >= this.$el.find(".drop").children().length) {
                    this.$el.find('.drop').append($field);
                } else {
                    this.$el.find(".drop > tr:nth-child(" + order + ")").after($field);
                }

                // populate field / readonly if compulsory input
                var vue = new AllFieldViews[viewClassName]({
                    el: '#' + id,
                    model: newModel,
                    collection: this.collection,
                    urlOptions: this.URLOptions,
                    $container: this.$el.find(".drop"),
                    context: this.context,
                    columns: this.columns
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
                height        : 'calc(100% - 76px)',
                railVisible   : true,
                alwaysVisible : true
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
         * Display a message when the export is finished or failed
         *
         * @param result if the export is right done or not
         */
        displayExportMessage : function(result) {
            if (result) {
                tools.swal("success", "modal.export.success", "");
            } else {
                tools.swal("error", "modal.export.error", "modal.export.errorMsg");
            }
        },

        /**
         * Display a message when the form has been saved
         */
        displaySucessMessage : function() {
            this.collection.dataUpdated = true;
            this.collection.pendingChanges = false;
            tools.swal("success", "modal.save.success", "modal.save.successMsg");
        },

        /**
         * Display a message if the form couldn't be saved
         */
        displayFailMessage : function(textKey, textValue) {
            if (textKey) {
                tools.swal("error", "modal.save.error",
                    translater.getValueFromKey(textKey) + (textValue ? textValue : ""));
            }
            else {
                tools.swal("error", "modal.save.error", "modal.save.errorMsg");
            }
        },

        displayIncompleteFormMessage: function() {
            tools.swal("error", "modal.save.uncompleteFormerror", "modal.save.uncompleteForm");
        },

        displayIncompleteFieldMessage: function() {
            tools.swal("error", "modal.save.uncompleteFielderror", "modal.save.uncompleteField");
        },

        displayHasDuplicateFieldNames: function() {
            tools.swal("error", "modal.save.hasDuplicateFieldNamesError", "modal.save.hasDuplicateFieldNames");
        },

        /**
         * Set H1 text when the update is done
         */
        updateName: function () {
            this.$el.find('#collectionName').text(this.collection.name);
            if (this.collection.originalID && this.collection.originalID > 0)
            {
                this.$el.find('#formOriginalIdArea').show();
                this.$el.find('#formOriginalID').text(this.collection.originalID);
                if (this.context != "track" && $("#datasImg").length > 0)
                {
                    $("#datasImg").remove();
                }
            }
        },

        displaytemplateMessage : function() {
            tools.swal("success", "modal.template.success", "modal.template.successMsg");
        },

        displayFailtemplatee : function() {
            tools.swal("error", "modal.template.error", "modal.template.errorMsg");
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
            }
            else
            {
                previewBtn.addClass("selected");
                $.each(this.collection.models, function(index, value){
                    var currentInput = $(".dropField#dropField" + value.id);
                    currentInput.addClass("col-xs-" + value.attributes.fieldSize);
                });
            }
        },

        popDatasImg: function(){
            if (this.context == "track")
            {
                tools.swal("info",
                    "Datas linked to the form<br />'"+this.collection.name+"'<br />",
                    "<span id='formDatasArea'><span id='formDatasLoading'>Loading datas ...<br/><br/>"+
                    "<img style='height: 20px;' src='assets/images/loader.gif' /></span></span>", {
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
