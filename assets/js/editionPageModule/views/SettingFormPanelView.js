define([
    'jquery',
    'marionette',
    'text!../templates/SettingFormPanelView.html',
    'text!../templates/SettingFormPanelViewReneco.html',
    'backbone.radio',
    '../../Translater',
    '../../app-config',
    'jquery-ui',
        'i18n',
    'bootstrap-select',
    'slimScroll'
], function($, Marionette, SettingFormPanelViewTemplate, SettingFormPanelViewTemplateReneco, Radio, Translater, AppConfig) {

    /**
     * Setting view
     * This view display form (generated with backbone-forms) to edit form or field properties
     *
     * See collection/FieldCollection to see form schema
     * See models/Fields to see form schema for each field type like text field, number, etc ...
     */
    var SettingFormPanelView = Backbone.Marionette.ItemView.extend({

        /**
        * jQuery event triggered by the view
        * @type {Object}
        */
        events : {
            'click #cancel'               : 'cancel',
            'click #saveChange'           : 'saveChange',
            'change .checkboxField input' : 'checkboxChange',
            'change .form-control'        : 'formControlChange',
            'click #saveTemplate'         : 'saveTemplate',
            'click .addFileText'          : 'triggerFileClick',
            'click .addFileBtn'           : 'triggerFileClick',
            'change .formAddFileRealAdd'  : 'associationFileSelected',
            'click .removeFileAssoc'      : 'deleteFileAssociation',
            'click .downloadFileAssoc'    : 'downloadFileAssoc'
        },


        /**
        * Setting view template initialization
        */
        template : function(){
            var topcontext = "";
            if (AppConfig.appMode.topcontext != "classic")
            {
                topcontext = AppConfig.appMode.topcontext
            }

            if (topcontext == "reneco")
            {
                return _.template(SettingFormPanelViewTemplateReneco);
            }
            else
            {
                return _.template(SettingFormPanelViewTemplate);
            }
        },


        /**
        * View constructor, init grid channel
        */
        initialize : function(options) {
            this.URLOptions = options.URLOptions;
            this.formToEdit = options.formToEdit;
            this.form       = null;
            this.formFilesBinaryList = [];

            /*
            if (this.formToEdit.length == 0 && (this.formToEdit.name.toLowerCase() != "new form" ||
                (this.formToEdit.name.toLowerCase() == "new form" && this.formToEdit.id != 0)))
            {
                console.log("XXX yo, i'm here !", this.formToEdit, JSON.stringify(this.formToEdit));
                delete this;
                return;
            }
            */

            this.hasFieldsChanged = false;

            // I don't know why but i have to specify a model otherwise i've an error on serializeModel callback
            // It's weird bacause i havn't to do this in SettingFieldPanelView
            this.model = new Backbone.Model({});

            //  Init backbone radio channel
            this.initMainChannel();

            this.translater = Translater.getTranslater();

            this.generateForm(this.formToEdit);
        },


        /**
        * Init main radio channel for communicate in the editionPageModule
        */
        initMainChannel : function() {
            //  The edition channel is the main channel ONLY in the editionPageModule
            this.mainChannel = Backbone.Radio.channel('edition');

            //  Event send by BaseView or BaseView inherited view for duplicate model
            this.mainChannel.on('triggerFormSettingsRender', this.triggerRender, this);
            this.mainChannel.on('manualSaveChange', this.saveChange, this);
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
                this.$el.find('.scroll').slimScroll({scrollTo : 0});

                this.form = null;
            }, this), 500);
        },

        /**
        * View rendering callbak
        */
        onRender : function() {

            /*
            if (this.formToEdit.length == 0 && (this.formToEdit.name.toLowerCase() != "new form" ||
                (this.formToEdit.name.toLowerCase() == "new form" && this.formToEdit.id != 0)))
            {
                console.log("XXX yo i'm here again !", this.formToEdit, JSON.stringify(this.formToEdit));
                delete this;
                return;
            }
            */

            this.$el.i18n();
            //this.$el.find('.scroll').slimScroll({
            //    height : '100%'
            //});
        },

        triggerRender : function()
        {
            this.render();
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
        * Send an event on form channel when user wants to clear current form
        */
        cancel : function(){

            var self = this;
            var cancelSettingPanel = function(){
                self.removeForm();
                self.mainChannel.trigger('formCancel');
            };

            if (this.hasFieldsChanged){
                swal({
                    title: this.translater.getValueFromKey('configuration.cancel.yousure') || "Vraiment ?",
                    text: this.translater.getValueFromKey('configuration.cancel.unsavedchanges') || "Vous avez effectué de changements !",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: this.translater.getValueFromKey('configuration.cancel.yescancel') || "Oui, quitter !",
                    cancelButtonText: this.translater.getValueFromKey('configuration.cancel.stay') || "Non, continuer.",
                    closeOnConfirm: true }, function(){
                    cancelSettingPanel();
                    $(".sweet-alert").find("button").trigger("click");
                        window.onkeydown = null;
                        window.onfocus = null;
                    });
            }
            else {
                cancelSettingPanel();
            }
        },


        /**
        * Check generated form values and send events if all is good
        * This function concerns generated form for field AND main form
        */
        saveChange : function(callbackSuccess) {
            var that = this;

            if (this.hasbeendestoyed || this.form.data.context == "all"){
                if (this.form.data.context == "all")
                    console.log("Error ! A form might not be created inside the 'all' context !");
                this.destroy();
                return(false);
            }

            var formValidation = this.form.validate();

            if (formValidation === null) {
                var filesToSend = [];
                $.each(this.formFilesBinaryList, function(index, value){
                    console.log(value.id, value.Pk_ID);
                    if (!value.id && !value.Pk_ID)
                    {
                        console.log("SENDING FILE !", value, value.id, value.Pk_ID);
                        filesToSend.push(value);
                        that.formFilesBinaryList[index].id = -1;
                    }
                });

                this.mainChannel.trigger('editionDone', _.extend({}, this.form.getValue(), {fileList:filesToSend}));
                $("#collectionName").css('color', "white");

                if (callbackSuccess)
                {
                    callbackSuccess();
                    $('.removeFileAssoc').remove();
                }

                //this.removeForm();
                //return (true);
            } else {

                this.$el.find('.scroll').scrollTop(0);
                this.$el.find('.scroll').scrollTop( $($("#settingFormPanel [name='" + Object.keys(formValidation)[0] + "']")).offset().top -
                    this.$el.find('.scroll').offset().top - 60);

                if ((_.size(this.form.fields) - 1) == _.size(formValidation)) {
                    //  We display a main information
                    this.$el.find('.general-error').html(
                        '   <h2>' + this.translater.getValueFromKey('error.general') + '</h2>' +
                        '   <p>' + this.translater.getValueFromKey('error.message') + '</p>'
                    ).show();
                } else {
                    $(this.form.el).find('p[data-error]').show();
                    this.$el.find('.general-error').html('').hide();
                }
                swal({
                    title:this.translater.getValueFromKey('modal.save.uncompleteFormerror') || "Erreur",
                    text:this.translater.getValueFromKey('modal.save.uncompleteFormerror') || "Champ obligatoire non renseigné",
                    type:"error",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });

                //return (false);
            }
        },


        /**
        * Change a checkbox state
        */
        checkboxChange : function(e) {
            var clickedLabel = $('label[for="' + $(e.target).prop('id') + '"]');
            clickedLabel.toggleClass('selected');
            this.formControlChange(e, clickedLabel.hasClass('selected'));
        },

        /**
         * Remember form value has changed
         */
        formControlChange : function(e, checkboxIsSelected) {
            this.hasFieldsChanged = true;

            switch(e.currentTarget.name)
            {
                case "propagate":
                    if (checkboxIsSelected){
                        swal({
                            title: this.translater.getValueFromKey('modal.editionField.fieldEditAlert') || "Alerte d'édition de champ",
                            text: this.translater.getValueFromKey('modal.editionField.propagationactivated') || "Attention, vérifie ta conf de propagation !",
                            type: "info",
                            closeOnConfirm: true
                        }, function(){
                            window.onkeydown = null;
                            window.onfocus = null;
                        });
                    }
                    break;
            }
        },

        initChildForms : function() {
            $.ajax({
                data: {},
                type: 'GET',
                url: this.URLOptions.childforms + "/" + this.formToEdit.id,
                contentType: 'application/json',
                crossDomain: true,
                success: _.bind(function (data) {
                    data = JSON.parse(data);

                    $(data).each(function(){
                        $(".childFormsList").show();
                        if ($("#childform"+this.id).length == 0)
                            $(".childList").append("<div id='childform"+this.id+"'><a target=_blank href='#form/"+this.id+"'>"+this.name+"</a></div>");
                    });
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    console.log("Ajax Error: " + xhr);
                }, this)
            });
        },

        displayContextExtentions : function() {
            var context = window.context;
            $.each($(".formExtension"), function(index, value){
                if ($(this).attr("context") == context || $(this).attr("topcontext") == AppConfig.appMode.topcontext)
                {
                    $(this).show();
                }
            })
        },

        /**
        * Generate form for edit main form object properties
        *
        * @param  {Object} formSchema main form object schema
        */
        generateForm : function(formToEdit) {
            var that = this;

            if (this.generatedAlready)
            {
                delete this;
                return;
            }

            this.generatedAlready = true;

            /*
            if (this.formToEdit.length == 0)
            {
                console.log("XXX yo i'm finally here !", this.formToEdit, JSON.stringify(this.formToEdit));
                delete this;
                return;
            }
            */

            require(['backbone-forms'], _.bind(function() {
                if (this.form !== null) {
                    //  Remove last form and create new with new model
                    this.removeForm()
                }

                //
                //  We need to pass keyword value from data to the schema
                //  Because the pillbox-editor i use get value directly from the schema
                //

                if (formToEdit)
                {
                    var datas           = formToEdit.getAttributesValues(),
                    keywordFr           = [],
                    keywordEn           = [],
                    schemaDefinition    = formToEdit.schemaDefinition;

                    _.each(datas.keywordsEn, function(el, idx) {
                        keywordEn.push( typeof el == 'object' ? el : { key : el, value : el });
                    });

                    _.each(datas.keywordsFr, function(el, idx) {
                        keywordFr.push( typeof el == 'object' ? el : { key : el, value : el });
                    });

                    schemaDefinition.keywordsFr.value = keywordFr;
                    schemaDefinition.keywordsEn.value = keywordEn;

                    this.form = new Backbone.Form({
                        schema: schemaDefinition,
                        data  : datas
                    }).render();

                    // Init linked field
                    this.initChildForms();

                    this.$el.find('#form').append(this.form.el);
                    this.$el.find('#getField').hide();

                    this.initScrollBar();

                    // Init contextual form extentions
                    this.displayContextExtentions();

                    this.mainChannel.trigger('formCreated');
                }

                $.each(this.formToEdit.schemaDefinition, function(index, value){
                    if (value.validators && value.validators[0].type == "required")
                    {
                        $("#settingFormPanel #form label[for="+index+"]").append(" <span style='color: red;'>*</span>");
                    }
                });

                if (formToEdit.fileList)
                {
                    $.each(formToEdit.fileList, function(index, value){
                        $('#formAssociatedFileListLabel').show();
                        $("#formLinkedFilesList").append("<span>"+value.name+"<a class='downloadFileAssoc' filedata='"+value.filedata+"'" +
                            " fileName='"+value.name+"'>Download</a><br/></span>");
                        that.formFilesBinaryList.push({"id":""+value.Pk_ID, "name":""+value.name, "filedata":value.filedata});
                    })
                }

                $('select#typeIndividus').on('change', function(){
                    var groupselect = $('select#groupe');

                    if($(this).val().toLowerCase().indexOf("nouvel") !== -1){
                        $(groupselect).find('option[value="null"]').show();
                        $(groupselect).val('null');
                        $(groupselect).attr("disabled", true);
                    }
                    else
                    {
                        if ($(groupselect).find('option[value="null"]').is(':selected')){
                            $(groupselect).val([]);
                        }
                        $(groupselect).find('option[value="null"]').hide();
                        $(groupselect).attr("disabled", false);
                    }
                });

            }, this));

        },

        /**
         * Send event to EditionPageController for save current form as template form
         */
        saveTemplate : function() {

            var formValidation = this.form.validate();

            if (formValidation === null) {
                var values = this.form.getValue();
                values['isTemplate'] = true;
                this.mainChannel.trigger('saveTemplate', values);
            }
        },

        triggerFileClick : function(){
            $(".formAddFileRealAdd").trigger("click");
        },

        associationFileSelected : function(){
            var that = this;
            var flRdr = new FileReader();
            var myFile2 = $('.formAddFileRealAdd')[0].files[0];

            var fileLoaded = function(){
                that.formFilesBinaryList.push({"name":""+myFile2.name, "filedata":""+flRdr.result});
                $("#formLinkedFilesList").append("<span>"+myFile2.name+"<a class='removeFileAssoc' value='"+myFile2.name+"'>" +
                    "Remove</a><br/></span>");

                $('#formAssociatedFileListLabel').show();
            };

            flRdr.onload = fileLoaded;
            flRdr.readAsDataURL(myFile2);
        },

        deleteFileAssociation : function(el){
            var that = this;

            $.each(that.formFilesBinaryList, function(index, fileObj){
                if (fileObj.name == $(el.target).attr("value"))
                {
                    that.formFilesBinaryList.splice(index, 1);
                    $(el.target).parent().remove();
                    if (that.formFilesBinaryList.length == 0)
                        $('#formAssociatedFileListLabel').hide();
                    return false;
                }
            });
        },

        downloadFileAssoc : function(el){

            var stringtobinarray = function(datastr){
                var binary = atob(datastr);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return(array);
            };

            var filename = $(el.target).attr("fileName");
            var filedata = $(el.target).attr("fileData");
            var filetype = filedata.split(";")[0].split(":")[1];
            var rawdata = stringtobinarray(filedata.split(";")[1].split(",")[1]);

            var file = new File([new Blob([new Uint8Array(rawdata)], { type: filetype })],
                filename, {type: filetype, lastModified: Date.now()});

            var todlfile = window.URL.createObjectURL(file);

            var a = document.createElement("a");
            a.href = todlfile;
            a.download = $(el.target).attr("fileName") || "FBLinkedFile";
            document.body.appendChild(a);
            a.click();
        },

        onDestroy : function(){
            this.hasbeendestoyed = true;
        }

    });

    return SettingFormPanelView;

});
