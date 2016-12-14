define([
    'jquery',
    'marionette',
    'text!../templates/SettingFieldPanelView.html',
    'backbone.radio',
    '../../Translater',
    'sweetalert',
    'app-config',
    './loaders/ContextLoader',
    '../models/fields',
    'jquery-ui',
    'i18n',
    'bootstrap-select',
    'slimScroll',
    'bootstrap'
], function($, Marionette, SettingPanelViewTemplate, Radio, Translater, swal, AppConfig, ContextLoader, Fields) {

    var translater = Translater.getTranslater();

    /**
     * Setting view
     * This view display form (generated with backbone-forms) to edit form or field properties
     *
     * See collection/FieldCollection to see form schema
     * See models/Fields to see form schema for each field type like text field, number, etc ...
     */
    var SettingFieldPanelView = Backbone.Marionette.ItemView.extend({


        /**
        * jQuery event triggered by the view
        * @type {Object}
        */
        events : {
            'change #getField select'     : 'selectChanged',
            'click #cancel'               : 'cancel',
            'click #saveChange'           : 'saveChange',
            'click #saveButton'           : 'saveField',
            'click #applyTemplateButton'  : 'applyTemplateField',
            'click #convertTypeButton'    : 'showConvertType',
            'click #convertActionButton'  : 'convertAction',
            'change .checkboxField input' : 'checkboxChange',
            'change .form-control'        : 'formControlChange',
            'click #myTabs a' : function(e) {
                e.preventDefault();
                $(this).tab('show');
            }
        },


        /**
        * Setting view template initialization
        */
        template : function() {
            if (this.modelToEdit)
            {
                return _.template(SettingPanelViewTemplate)({
                    model : this.modelToEdit,
                    type : this.modelToEdit.constructor.type.charAt(0).toLowerCase() + this.modelToEdit.constructor.type.slice(1)
                });

            }
            return ({model: undefined, type:  undefined});
        },

        /**
        * View constructor, init grid channel
        */
        initialize : function(options, defaultTemplateList) {
            this.fieldsList             = options.fieldsList;
            this.URLOptions             = options.URLOptions;
            this.modelToEdit            = options.modelToEdit;
            this.linkedFieldsList       = options.linkedFieldsList[window.context];
            this.preConfiguredFieldList = options.preConfiguredFieldList;

            this.savedTemplateFieldList = defaultTemplateList;

            this.form               = null;
            this.fieldWithSameType  = null;

            this.subSettingView = null;

            this.hasFieldsChanged = false;

            //  Init backbone radio channel
            this.initFormChannel();
            this.initMainChannel();
            this.initHookChannel();
            this.initGlobalChannel();

            _.bindAll(this, 'template', 'initForm');
        },

        initHookChannel : function() {
            this.hookChannel = Backbone.Radio.channel('hook');
        },


        /**
        * Init main radio channel for communicate in the editionPageModule
        */
        initMainChannel : function() {
            //  The edition channel is the main channel ONLY in the editionPageModule
            this.mainChannel = Backbone.Radio.channel('edition');
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');
        },


        /**
         * Init form channel
         * This channel concerns only form functionnality like create a form to edit model
         */
        initFormChannel : function() {
            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');

            //  Event send by EditionPageController when the field has been good saved as pre configurated field
            this.formChannel.on('configurationSaved:success', this.displayConfigurationSaveSuccess, this);
            //  Same thing when an error occured on saved
            this.formChannel.on('configurationSaved:fail', this.displayConfigurationSaveFail, this);
        },


        /**
        * Create a form to edit field properties
        *
        * @param  {Object} field Field with which backbone forms will generate an edition form
        */
        initForm : function() {
            var that = this;
            var callBackTemplateRequest = function(fieldList){

                that.preConfiguredFieldList = fieldList;

                that.currentFieldType  = that.modelToEdit.constructor.type;
                that.fieldWithSameType = that.preConfiguredFieldList[that.currentFieldType];

                if (that.fieldWithSameType == undefined) {
                    that.$el.find('*[data-setting="field"]').first().hide();
                } else {
                    // Update available pre configurated field
                    _.each(that.fieldWithSameType, _.bind(function(el, idx) {
                        that.$el.find('#getField select').append('<option value="' + idx + '">' + idx + '</option>');
                    }, that));
                }

                that.$el.find('select').selectpicker();

                that.createForm();

                if ($('#widgetPanel').hasClass('col-md-1')) {
                    $('#formPanel').switchClass('col-md-8', 'col-md-6', 500);
                }

                if ($('#settingFieldPanel').hasClass('col-md-0')) {
                    $('#settingFieldPanel').switchClass('col-md-0', 'col-md-3', 500);
                    $('#widgetPanel').hide();
                }

                $(".actions").show();
            };

            if (that.savedTemplateFieldList)
            {
                callBackTemplateRequest(that.savedTemplateFieldList);
            }
            else
            {
                $.getJSON(that.URLOptions.preConfiguredField, _.bind(function(fieldList) {
                    that.mainChannel.trigger('setTemplateList', fieldList);
                    callBackTemplateRequest(fieldList);
                }, that));
            }
        },

        initContextDatas : function() {

            // TODO Idealy, this should be in the contextloaders ... :
            //  Init linked field

            this.initFormLinkedFields();
            this.initExtraPropertiesValues();

            ContextLoader.initializeLoader(this.form, this.URLOptions, true);
        },

        /**
         * Enable or disable linked field select if the checkbox is checked or not
         */
        bindLinkedFieldSelect : function() {
            this.form.fields.isLinkedField.editor.$el.find('input').change(_.bind(function(e) {
                this.disableOrEnableLinkedFields($(e.target).is(':checked'));
            }, this));
        },

        /**
         * Disable or enable linked field select
         *
         * @param state if the select will be checked or not
         */
        disableOrEnableLinkedFields : function(state, disable) {
            var that = this;
            if (state)
            {
                this.modelToEdit.set("isLinkedField", true);
                this.form.fields.linkedField.$el.removeClass('hide');
                this.form.fields.linkedField.$el.animate({opacity: 1}, 300);
                this.form.fields.linkedFieldTable.$el.removeClass('hide');
                this.form.fields.linkedFieldTable.$el.animate({opacity: 1}, 300);
            }
            else
            {
                this.form.fields.linkedField.$el.animate({opacity: 0}, 300, function(){
                    that.form.fields.linkedField.$el.addClass('hide')});
                this.form.fields.linkedFieldTable.$el.animate({opacity: 0}, 300, function(){
                    that.form.fields.linkedFieldTable.$el.addClass('hide')});
            }

            if (disable)
            {
                if (state)
                    this.disableOrEnableLinkedFields(false, disable);
                else
                {
                    this.form.fields.isLinkedField.$el.animate({opacity: 0}, 300, function(){
                        that.form.fields.isLinkedField.$el.addClass('hide')});
                }
            }
        },

        /**
         * Enable or disable linked field select if the checkbox is checked or not
         */
        bindCssEditorsSelect : function() {
            if (this.form.fields.showCssProperties)
            {
                this.form.fields.showCssProperties.editor.$el.find('input').change(_.bind(function(e) {
                    this.disableOrEnableCssEditionFields($(e.target).is(':checked'));
                }, this));
            }
        },

        /**
         * Disable or enable linked field select
         *
         * @param state if the select will be checked or not
         */
        disableOrEnableCssEditionFields : function(state) {
            if (this.form.fields.showCssProperties)
            {
                if (state)
                {
                    this.form.fields.editorClass.$el.removeClass('hide');
                    this.form.fields.editorClass.$el.animate({opacity: 1}, 300);
                    this.form.fields.fieldClassEdit.$el.removeClass('hide');
                    this.form.fields.fieldClassEdit.$el.animate({opacity: 1}, 300);
                    this.form.fields.fieldClassDisplay.$el.removeClass('hide');
                    this.form.fields.fieldClassDisplay.$el.animate({opacity: 1}, 300);
                }
                else
                {
                    var that = this;
                    this.form.fields.editorClass.$el.animate({opacity: 0}, 300, function(){
                        that.form.fields.editorClass.$el.addClass('hide')});
                    this.form.fields.fieldClassEdit.$el.animate({opacity: 0}, 300, function(){
                        that.form.fields.fieldClassEdit.$el.addClass('hide')});
                    this.form.fields.fieldClassDisplay.$el.animate({opacity: 0}, 300, function(){
                        that.form.fields.fieldClassDisplay.$el.addClass('hide')});
                }
            }
        },

        /**
         * A field can be linked to another field
         * We initialize select field option
         */
        initFormLinkedFields : function() {

            var disable = true;

            if (this.linkedFieldsList)
            {
                var linkedFieldsKeyList = [];
                _.each(this.linkedFieldsList.linkedFieldsList, function(el, idx) {
                    linkedFieldsKeyList.push(el.key)
                });

                var hideTemplateApply = true;

                $.each(this.preConfiguredFieldList.options, function(key, value){
                    if ( $("#templateList option[value='"+key+"']").length == 0) {
                        $('#templateList').append($('<option>', {
                            value: key,
                            text: key
                        }));
                    }
                    hideTemplateApply = false;
                });

                if (hideTemplateApply)
                {
                    $(".loadTemplateArea").hide();
                }
                else
                {
                    $("#templateList").selectpicker("refresh");
                }

                if (! _.contains(['Subform'], this.modelToEdit.constructor.type) &&
                    ! _.contains(['ChildForm'], this.modelToEdit.constructor.type)) {
                    //  Update linked fields
                    this.form.fields.linkedField.editor.setOptions(linkedFieldsKeyList);
                    this.form.fields.linkedFieldTable.editor.setOptions(this.linkedFieldsList.tablesList);
                }

                disable = linkedFieldsKeyList.length == 0 || this.linkedFieldsList.tablesList.length == 0 ||
                    this.linkedFieldsList.identifyingColumns.length == 0;
            }

            var attr = this.modelToEdit.attributes;

            //  Disable all select at start
            this.disableOrEnableCssEditionFields(false);
            this.disableOrEnableLinkedFields(attr.linkedField && attr.linkedFieldTable, disable);
            this.bindLinkedFieldSelect();
            this.bindCssEditorsSelect();
        },

        initExtraPropertiesValues : function(){

            if (this.modelToEdit.collection.tracktypes)
            {
                this.form.fields.trackType.editor.setOptions(this.modelToEdit.collection.tracktypes);
            }
        },

        /**
        * Create a form to edit field properties
        *
        * @param  {[Object]} field to edit
        */
        createForm : function() {
            if (this.todelete)
            {
                delete this;
                return;
            }
            this.todelete = true;
            require(['backbone-forms'], _.bind(function() {

                var that = this;

                Backbone.Form.validators.errMessages.required = translater.getValueFromKey('form.validation');

                var getJSONFromBinaryWeight = function(binWeight)
                {
                    var toret = {};
                    toret.nullmean = (binWeight >= 8);
                    binWeight %= 8;
                    toret.nullable = (binWeight >= 4);
                    binWeight %= 4;
                    toret.editable = (binWeight >= 2);
                    binWeight %= 2;
                    toret.visible = (binWeight >= 1);
                    return (toret);
                };

                if (this.modelToEdit && this.modelToEdit.attributes.editMode &&
                    this.modelToEdit.attributes.editMode.visible == undefined)
                {
                    this.modelToEdit.set("editMode", getJSONFromBinaryWeight(this.modelToEdit.attributes.editMode));
                }

                this.form = new Backbone.Form({
                    model: this.modelToEdit
                }).render();

                this.initContextDatas();

                this.$el.find('#form').append(this.form.el)

                // Send an event to editionPageLayout to notify that form is created
                this.mainChannel.trigger('formCreated');

                this.form.$el.on('change input[name="decimal"]', _.bind(function(e) {
                    if ($(e.target).is(':checked')) {
                        this.form.$el.find('.field-precision').addClass('advanced');
                    } else {
                        this.form.$el.find('.field-precision').removeClass('advanced');
                    }
                }, this));

                if (_.contains(['Thesaurus', 'AutocompleteTreeView', 'Position'], this.modelToEdit.constructor.type)) {
                    var pathname = "fullpath";
                    if (this.modelToEdit.constructor.type == "Position")
                        pathname = "positionPath";

                    var WebServiceUrl = $("[name='webServiceURL']").val();

                    var savednode = this.modelToEdit.get('defaultNode');

                    var callbackWSCall = function(data){
                        var transformed = $.map(data.children, function (el) {
                            return {
                                label: el.fullpath,
                                id: el.key,
                                data: el
                            };
                        });
                        response(transformed);
                    };

                    var createFullpathAutocomplete = function(){
                        $('input[name="'+pathname+'"]').autocomplete({
                            scrollHeight: 220,
                            source: function (request, response) {
                                if (window.trees[WebServiceUrl]) {
                                    callBackWSCall(window.trees[WebServiceUrl]);
                                }
                                else {
                                    $.ajax({
                                        type        : 'POST',
                                        url         : WebServiceUrl,
                                        contentType : 'application/json',
                                        data        : JSON.stringify({
                                            StartNodeID:$("#defaultNode").fancytree("getActiveNode") || 0,
                                            deprecated:0,
                                            lng:"Fr"}),
                                        success: function (data) {
                                            callbackWSCall(data);
                                        },
                                        error: function () {
                                            response([]);
                                        }
                                    });
                                }
                            },
                            select: function(event, ui){
                                $("#defaultNode").fancytree("getTree").getNodeByKey(ui.item.id).setActive();
                                $("#defaultNode").fancytree("getTree").getNodeByKey(ui.item.id).setExpanded(true);
                                that.globalChannel.trigger('nodeSelected' + that.modelToEdit.get('id'), ui.item.data);
                                $('input[name="'+pathname+'"]').val(ui.item.label);
                            }
                        });
                    };

                    if (WebServiceUrl)
                    {
                        $('input[name="defaultNode"]').replaceWith('<div id="defaultNode"></div>');
                        if (WebServiceUrl.substring(0,5) == 'http:' ) {

                            var startID = AppConfig.config.startID[this.modelToEdit.constructor.type.toLowerCase()][window.context];
                            if (!startID)
                                startID = AppConfig.config.startID[this.modelToEdit.constructor.type.toLowerCase()].default;

                            var tosend = JSON.stringify({StartNodeID: startID, lng: "fr"});

                            var callbackWSCall = function(data){
                                $('#defaultNode').fancytree({
                                    source     : data,
                                    checkbox   : false,
                                    selectMode : 1,
                                    activeNode : startID,
                                    click : _.bind(function(event, data) {
                                        that.globalChannel.trigger('nodeSelected' + that.modelToEdit.get('id'), data);
                                        $('input[name="'+pathname+'"]').val(data.node.data.fullpath);
                                        createFullpathAutocomplete();
                                    }, this)
                                });
                                $('#defaultNode').fancytree("getTree").activateKey(savednode);
                            };

                            if (window.trees[WebServiceUrl]) {
                                callbackWSCall(window.trees[WebServiceUrl]);
                            }
                            else {
                                $.ajax({
                                    data: tosend,
                                    type: 'POST',
                                    url: WebServiceUrl,
                                    contentType: 'application/json',
                                    //  If you run the server and the back separately but on the same server you need to use crossDomain option
                                    //  The server is already configured to used it
                                    crossDomain: true,

                                    //  Trigger event with ajax result on the formView
                                    success: _.bind(function (data) {
                                        callbackWSCall(data);
                                    }, this)
                                });
                            }
                        }
                        else {
                            var callBackWSCall = function(data){
                                $('#defaultNode').fancytree({
                                    source: data['d'],
                                    checkbox : false,
                                    selectMode : 1,
                                    click : _.bind(function(event, data) {
                                        this.globalChannel.trigger('nodeSelected' + this.modelToEdit.get('id'), data);
                                    }, this)
                                });
                                $('#defaultNode').fancytree("getTree").activateKey(savednode);
                            };

                            if (window.trees[AppConfig.paths.thesaurusWSPath]) {
                                callBackWSCall(window.trees[AppConfig.paths.thesaurusWSPath]);
                            }
                            else {
                                $.getJSON(AppConfig.paths.thesaurusWSPath, _.bind(function(data) {
                                    callBackWSCall(data);
                                }, this)).error(function(a,b,c) {
                                    alert ("can't load ressources !");
                                });
                            }
                        }
                        createFullpathAutocomplete();
                    }
                } else if (this.modelToEdit.constructor.type === 'TreeView') {

                     this.setTreeViewConfiguration();

                } else if (_.contains(['Select', 'CheckBox', 'Radio'], this.modelToEdit.constructor.type)) {
                     this.setMultipleFieldConfiguration();
                 }

                this.initScrollBar();

                var getAllFieldsetsNames = function()
                {
                    var toret = [];

                    $.each(that.modelToEdit.collection.models, function(index, value){
                        var linkedFieldset = value.attributes.linkedFieldset;
                        if (linkedFieldset && linkedFieldset.length > 0)
                            toret.push(linkedFieldset);
                    });

                    return (toret);
                };

                var getAllInputNames = function()
                {
                    var toret = [];

                    $.each(that.modelToEdit.collection.models, function(index, value){
                        var linkedFieldset = value.attributes.linkedFieldset;
                        if (linkedFieldset && linkedFieldset.length > 0)
                            toret.push(linkedFieldset);
                    });

                    return (toret);
                };

                var elLinkedFieldset = $("#settingFieldPanel [name='linkedFieldset']");

                if (elLinkedFieldset.length > 0)
                {
                    elLinkedFieldset.autocomplete({
                        minLength: 1,
                        source : getAllFieldsetsNames()
                    });
                }

                var elFieldName = $("#settingFieldPanel [name='name']");

                if (elFieldName.length > 0)
                {
                    elFieldName.autocomplete({
                        minLength: 1,
                        source : this.modelToEdit.collection.contextInputNames
                    });
                }

                var getCompatibleInputs = function()
                {
                    var toret = [];
                    var compatibilityToUse = AppConfig.allowedConvert.default;

                    if (AppConfig.allowedConvert[window.context])
                        compatibilityToUse = AppConfig.allowedConvert[window.context];

                    $.each(compatibilityToUse, function(index, value){
                        if (_.contains(value, that.modelToEdit.constructor.type))
                        {
                            $.each(value, function(subindex, subvalue){
                                if (subvalue != that.modelToEdit.constructor.type)
                                    toret.push(subvalue);
                            });
                        }
                    });

                    return(toret);
                };

                var hideTypeConverter = true;
                $.each(getCompatibleInputs(), function(index, value){
                    if ( $("#inputTypeList option[value='"+value+"']").length == 0)
                    {
                        $('#inputTypeList').append($('<option>', {
                            value: value,
                            text: value
                        }));
                    }
                    hideTypeConverter = false;
                });

                if (hideTypeConverter)
                {
                    $(".convertArea").hide();
                }
                else
                {
                    $("#inputTypeList").selectpicker("refresh");
                }

                $.each(that.modelToEdit.collection.schemaDefinition, function(index, value){
                    if (value.validators && value.validators[0].type == "required")
                    {
                        $("#settingFieldPanel #form label[for="+that.modelToEdit.cid+"_"+index+"]").append(" <span style='color: red;'>*</span>");
                    }
                });

                if(that.modelToEdit.attributes.originalID && that.modelToEdit.attributes.originalID > 0)
                {
                    $("#originalIDArea").show();
                    $("#fieldOriginalID").text(that.modelToEdit.attributes.originalID);
                }

            }, this));
        },

        /**
         * For enumeration field like Checkbox, select ... we used a backgrid to manage values
         * We used the EnumerationView
         *
         * At start we used backbone forms modalAdapter but the generated code is hard to maintain add we prefered a "in-live" modification instead of modal view.
         */
        setMultipleFieldConfiguration : function() {
            require(['editionPageModule/views/SettingViews/EnumerationView'], _.bind(function(EnumarationView) {

                this.$el.find('.setting-tabs').show();

                this.subSettingView = new EnumarationView({
                    el : '#field-values>div',
                    model : this.modelToEdit
                }).render();


            }, this));
        },

        /**
         * Some field like Treeview need to run specific configuration
         */
        setTreeViewConfiguration : function() {
            $('.settings form input[name="defaultNode"]').replaceWith('<div id="defaultNode"></div>');
            $('.settings form #defaultNode').fancytree({
                source: [
                    {title: "Node 1", key: "1"},
                    {title: "Folder 2", key: "2", folder: true, children: [
                        {title: "Node 2.1", key: "3"},
                        {title: "Node 2.2", key: "4"}
                    ]}
                ],
                selectMode : 1,
                click : _.bind(function(event, data) {
                    this.mainChannel.trigger('nodeSelected' + field.get('id'), data);
                }, this)
            });
        },


        /**
         * Remove last form and clean html content
         */
        removeForm : function() {
            //  I know it's bad but it works for the moment ;)
            setTimeout(_.bind(function() {
                this.$el.find('#form').html('');
                this.form.undelegateEvents();
                this.form.$el.removeData().unbind();
                this.form.remove();
                Backbone.View.prototype.remove.call(this.form);

                //  Update scrollBar
                this.$el.find('.scroll').scrollTop(0);
                this.$el.find('.scroll').slimScroll('update');

                this.form = null;
            }, this), 500);
        },


        /**
        * Reset the select element with pre configuration field name
        */
        resetSelect : function() {
            this.$el.find('#getField select').html('<option value="" disabled selected>Select an option</option>');
        },

        /**
        * View rendering callbak
        */
        onRender : function(options) {
            this.$el.i18n();
            this.initForm();
        },

        initScrollBar : function() {
            this.$el.find('.scroll').slimScroll({
                height        : '80%',
                railVisible   : true,
                alwaysVisible : true,
                railColor     : "#111",
                disableFadeOut: true
            });
            this.$el.find('.scroll').slimScroll({scrollTo: "0px"});
            setTimeout(_.bind(function(){
                this.$el.find('.scroll').scrollTop(0);
            }, this), 200);
        },

        /**
        * Event send when user change select value
        * Set value to the current vield
        *
        * @param  {Object} e jQuery event
        */
        selectChanged : function(e) {
            var choice = this.fieldWithSameType[ $(e.target).val() ];

            this.form.setValue(choice)

            if(_.contains(choice['validators'], "required")) {
                this.form.setValue({'required': true});
                this.$el.find('input[name="required"]').prop('checked', true)
            } else {
                this.form.setValue({'required': false});
                this.$el.find('input[name="required"]').prop('checked', false)
            }
        },


        /**
        * Send an event on form channel when user wants to clear current form
        */
        cancel : function(event, avoidUserValidation){

            var self = this;
            self.globalChannel.trigger('nodeReset' + self.modelToEdit.get('id'));

            var cancelSettingPanel = function(){
                self.removeForm();
                self.mainChannel.trigger('formCancel');
            };

            if (this.hasFieldsChanged && !avoidUserValidation){
                swal({
                    title: translater.getValueFromKey('configuration.cancel.yousure') || "Vraiment ?",
                    text: translater.getValueFromKey('configuration.cancel.unsavedchanges') || "Vous avez effectué de changements !",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: translater.getValueFromKey('configuration.cancel.yescancel') || "Oui, quitter !",
                    cancelButtonText: translater.getValueFromKey('configuration.cancel.stay') || "Non, continuer.",
                    closeOnConfirm: false }, function(){
                        cancelSettingPanel();
                        $(".sweet-overlay").remove();
                        $(".sweet-alert").remove();
                    });
            }
            else {
                cancelSettingPanel();
            }
        },


        /**
        * Check generated form values and send events if all is good
        */
        saveChange : function() {
            var nameCounter = 0;
            var that = this;
            var savedDefaultNode = this.modelToEdit.get("defaultNode");
            var savedFullpath = this.modelToEdit.get("fullpath");

            $.each(this.modelToEdit.collection.models, function(value, index){
                if (index.attributes.name == $("#form [name='name']").val())
                {
                    if (that.modelToEdit.attributes.name != $("#form [name='name']").val()){
                        nameCounter++;
                    }
                }
            });

            if (nameCounter == 0) {

                if (this.subSettingView !== null) {
                    //  In this case wa have a sub setting view
                    //  This view is used for example to set Checkbox values
                    this.subSettingView.commitValues();
                }

                var commitResult = this.form.commit();
                if (commitResult === undefined) {
                    this.modelToEdit.set("validated", true);

                    // TODO Should test input Type attribute, but Thesaurus type at first creation seems to be undefined
                    // TODO Need to find why to get a proper testing method ...
                    if (this.modelToEdit.attributes.defaultNode != undefined)
                    {
                        this.modelToEdit.set("defaultNode", savedDefaultNode);
                        this.modelToEdit.set("fullpath", savedFullpath);
                    }

                    if (!this.modelToEdit.get('isLinkedField')) {
                        this.modelToEdit.set('linkedField', '');
                        this.modelToEdit.set('linkedFieldTable', '');
                    }

                    this.formChannel.trigger('field:change', this.modelToEdit.get('id'));

                    this.removeForm();
                    this.mainChannel.trigger('formCommit');

                    $("#dropField"+this.modelToEdit.get('id')+" .field-label span").css("color", "white");
                }
                else
                {
                    swal(
                        translater.getValueFromKey('modal.save.uncompleteFielderror') || "Erreur",
                        translater.getValueFromKey('modal.save.uncompleteFieldProp') || "Champ obligatoire non renseigné",
                        "error"
                    );
                }
            }
            else {
                swal(
                    translater.getValueFromKey('configuration.save.fail') || "Echec !",
                    translater.getValueFromKey('configuration.save.samename') || "Votre champs ne peut avoir le même nom qu'un autre champ du formulaire",
                    "error"
                )
            }
        },

        /**
        * Save current field as a configuration field
        */
            //TODO
        saveField : function() {
            var formCommitResult = this.form.commit();
            if (formCommitResult) {

                //  If something wrong we move to the first incorrect field
                var offsetTop = $('input[name="' + Object.keys(formCommitResult)[0] + '"]').offset().top;
                this.$el.find('.scroll').scrollTop( offsetTop );
                this.$el.find('.scroll').slimScroll('update');

            } else {
                var formValue = this.form.getValue();
                formValue['type'] = this.currentFieldType;

                this.formChannel.trigger('saveConfiguration', {
                    field : formValue
                });
            }
        },

        applyTemplateField : function() {
            var that = this;

            var templateInputName = $("#templateList option:selected").text();
            if (templateInputName.length > 0){
                $.ajax({
                    data: {},
                    type: 'GET',
                    url: this.URLOptions.fieldConfigurationURL + "/" + templateInputName,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: function (data) {
                        $.each(data.result, function(key, value){
                            if (that.modelToEdit.attributes[key] != undefined && key != "name" && key != "id")
                            {
                                that.modelToEdit.attributes[key] =  value;
                            }
                        });
                        that.formChannel.trigger('editModel', that.modelToEdit.get('id'));
                        swal(
                            translater.getValueFromKey('configuration.save.loadsuccess') || "Chargement réussit !",
                            translater.getValueFromKey('configuration.save.loadsuccessMsg') || "Le template a bien été chargé",
                            "success"
                        );
                    },
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log("Ajax Error: " + xhr);
                    }, this)
                });
            }
        },

        /**
        * Change a checkbox state
        */
        checkboxChange : function(e) {
            this.hasFieldsChanged = true;
            $('label[for="' + $(e.target).prop('id') + '"]').toggleClass('selected');
        },

        /**
         * Remember field value has changed
         */
        formControlChange : function(e) {
            this.hasFieldsChanged = true;
            switch(e.currentTarget.name)
            {
                case "defaultValue":
                    swal({
                        title: translater.getValueFromKey('modal.editionField.fieldEditAlert') || "Alerte d'édition de champ",
                        text: translater.getValueFromKey('modal.editionField.defaultValueEdit') || "Attention, en éditant la propriété 'valeur par défaut', vous pourriez avoir envie de mettre a jour les données de bases de données liées à cette valeur",
                        type: "info"
                    });
                    break;
            }
        },

        showConvertType : function() {
            $(".convertStep1").hide();
            $(".convertStep2").show();
        },

        convertAction : function() {
            var that = this;
            swal({
                title              : translater.getValueFromKey('settings.actions.convertTitle') || "Confirmation de convertion",
                text               : translater.getValueFromKey('settings.actions.convertValidate') || "L'input sera convertit sans retour possible !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : translater.getValueFromKey('settings.actions.convertYes') || "Oui, convertir",
                cancelButtonText   : translater.getValueFromKey('settings.actions.convertNo') || "Annuler"
            }, function(isConfirm) {
                if (isConfirm) {
                    that.formChannel.trigger('remove', that.modelToEdit.attributes.id);
                    var fieldType = $("#inputTypeList option:selected").text() + 'Field';
                    that.modelToEdit.attributes.id = 0;
                    that.formChannel.trigger('addNewElement', fieldType, that.modelToEdit.attributes);
                    that.formChannel.trigger('editModel', that.modelToEdit.get('id'));
                }
            });
        },

        /**
         * Display success message when field has been saved as pre configurated field
         */
        displayConfigurationSaveSuccess : function() {
            this.mainChannel.trigger('unsetTemplateList');
            swal(
                translater.getValueFromKey('configuration.save.success') || "Sauvé !",
                translater.getValueFromKey('configuration.save.successMsg') || "Votre champs a bien été sauvgeardé",
                "success"
            )
        },

        /**
         * Display en error message when field couldn't be saved
         */
        displayConfigurationSaveFail : function() {
            swal(
                translater.getValueFromKey('configuration.save.fail') || "Echec !",
                translater.getValueFromKey('configuration.save.failMsg') || "Votre champs n'a pas pu être sauvegardé",
                "error"
            )
        }

    });

    return SettingFieldPanelView;

});
