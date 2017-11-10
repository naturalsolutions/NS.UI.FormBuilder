define([
    'jquery',
    'marionette',
    'text!../templates/EditionPageLayout.html',
    '../views/FormPanelView',
    '../views/SettingFieldPanelView',
    '../models/Fields',
    '../../Translater',
    'tools',
    'app-config'
], function($, Marionette, EditionPageLayoutTemplate,
            FormPanelView, SettingFieldPanelView,
            Fields, Translater, tools, AppConfig) {
    var t = Translater.getTranslater();

    return Backbone.Marionette.LayoutView.extend({
        template : function() {
            return _.template(EditionPageLayoutTemplate) ({
                collection : this.fieldCollection.getAttributesValues(),
                context: this.context,
                fieldTypes: this.fieldTypes,
                topcontext: AppConfig.appMode.topcontext,
                readonly: AppConfig.readonlyMode
            });
        },

        attributes: function() {
            return {
                "data-context": this.context,
                "data-topcontext": AppConfig.appMode.topcontext,
                "data-readonly": AppConfig.readonlyMode,
                "class": "edition"
            };
        },

        events : {
            'click #save': 'save',
            'click #exit': 'exit',
            'click  .attachedFiles .addBtn'           : 'triggerFileClick',
            'change .attachedFiles input[type="file"]': 'fileInputChanged',
            'click  .attachedFiles .remove'           : 'removeAttachedFile',
            'click  .attachedFiles .download'         : 'downloadAttachedFile',

            'click .fieldTypes > div'                 : 'appendToDrop'
        },

        regions : {
            centerPanel : '#gridView',
            settingFormPanel : '#settingFormPanel',
            settingFieldPanel : '#settingFieldPanel'
        },

        initialize : function(options) {
            this.options = options;
            this.linkedFieldsList = options.linkedFieldsList;
            this.fieldCollection = options.fieldCollection;
            this.URLOptions = options.URLOptions;
            this.context = this.fieldCollection.context;
            this.formFilesBinaryList = {};
            this.initFieldTypes();

            this.mainChannel = Backbone.Radio.channel('edition');
            this.mainChannel.on('setTemplateList', this.setTemplateList, this);
            this.mainChannel.on('unsetTemplateList', this.unsetTemplateList, this);


            this.formChannel = Backbone.Radio.channel('form');
            this.formChannel.on('editField', this.editField, this);

            _.bindAll(this, 'template');
        },

        editField: function(id) {
            if (this.settingFieldPanel == undefined) {
                this.addRegion('settingFieldPanel', '#settingFieldPanel');
                this.settingFieldPanel =  this.getRegion('settingFieldPanel');
            }

            this.settingFieldPanel.show(new SettingFieldPanelView({
                URLOptions             : this.URLOptions,
                linkedFieldsList       : this.linkedFieldsList,
                modelToEdit            : this.fieldCollection.get(id),
                fieldsList             : this.fieldCollection.getFieldList(id)
            }, this.savedTemplateList));
        },

        onRender : function() {
            this.generateFormProperties();
            this.formPanel = new FormPanelView({
                fieldCollection : this.fieldCollection,
                URLOptions : this.URLOptions
            }, AppConfig.readonlyMode);
            this.centerPanel.show(this.formPanel);
            this.$el.i18n();
        },

        exit: function() {
            this.formChannel.trigger('exit', false);
        },

        setTemplateList : function(templateList) {
            this.savedTemplateList = templateList;
        },

        unsetTemplateList : function() {
            this.savedTemplateList = undefined;
        },

        /**
         * save blob
         */
        save: function() {
            var formValidation = this.form.validate();
            if (formValidation === null) {
                // filter new files only (deletion not implemented in back, todo)
                var newFiles = _.filter(this.formFilesBinaryList,
                    function(el) {
                        return !el.id || el.id === -1;
                    });
                newFiles = Object.values(newFiles);
                var formData = this.form.getValue();
                formData.fileList = Object.values(newFiles);
                formData.keywordsEn = formData.keywordsEn.split(",");
                formData.keywordsFr = formData.keywordsFr.split(",");
                formData.id = this.fieldCollection.id;
                this.fieldCollection.updateCollectionAttributes(formData);
                this.fieldCollection.save();

                $(".formTitle").text(this.fieldCollection.name);

                // disable "delete file" buttons"
                $(".remove").addClass("disabled");
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
                tools.swal("error", 'modal.save.uncompleteFormerror', 'modal.save.uncompleteFormerror');
            }
        },

        /* ----------------------- */
        /* Form properties section */
        /* ----------------------- */
        generateFormProperties: function(form) {
            if (!form) {
                form = this.fieldCollection;
            }
            var that = this;
            if (this.generatedAlready) {
                alert('u');
                return;
            }
            this.generatedAlready = true;

            require(['backbone-forms'], _.bind(function() {
                var datas = form.getAttributesValues(),
                    schemaDefinition = form.schemaDefinition,
                    keywordFr = [],
                    keywordEn = [];

                schemaDefinition.keywordsFr.value = keywordFr;
                schemaDefinition.keywordsEn.value = keywordEn;

                this.form = new Backbone.Form({
                    schema: schemaDefinition,
                    data  : datas
                }).render();

                // Init linked field (childForm?)
                $.ajax({
                    data: {},
                    type: 'GET',
                    url: this.URLOptions.childforms + "/" + form.id,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: function (data) {
                        data = JSON.parse(data);
                        $(data).each(function () {
                            $(".childFormsList").show();
                            if ($("#childform" + this.id).length == 0)
                                $(".childList").append("<div id='childform" + this.id + "'><a target=_blank href='#form/" + this.id + "'>" + this.name + "</a></div>");
                        });
                    },
                    error: function (err) {
                        console.log("error retreiving childforms: " + err);
                    }
                });

                this.$el.find('#form').append(this.form.el);
                this.$el.find('.scroll').slimScroll({
                    height        : '100%',
                    railVisible   : true,
                    alwaysVisible : true,
                    railColor     : "#111",
                    disableFadeOut: true
                });

                // append * to required
                $.each(form.schemaDefinition, function(index, value){
                    if (value.validators && value.validators[0].type == "required") {
                        $("#settingFormPanel #form label[for="+index+"]").append("<span>*</span>");
                    }
                });

                if (form.fileList) {
                    $.each(form.fileList, function(index, value){
                        that.addAttachedFile(value.Pk_ID, value.name, value.filedata);
                    });
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

        triggerFileClick: function(){
            $(".attachedFiles input[type='file']").trigger("click");
        },

        fileInputChanged: function(){
            var input = $('.attachedFiles input[type="file"]')[0];
            var file = input.files[0];
            if (!file) {
                return;
            }

            var that = this;
            var reader = new FileReader();
            reader.onload = function(){
                that.addAttachedFile(0, file.name, reader.result);
                // clear input
                input.value = '';

            };
            reader.readAsDataURL(file);
        },

        addAttachedFile: function(pk, name, data) {
            if (this.formFilesBinaryList[name]) {
                name = tools.dedupeFilename(name);
            }

            // prepare element
            var $file = $("<div class='file row'>");
            var $name = $("<span class='name col-md-8'>").html(name);
            var $ctrlDownload = $("<span class='download col-md-1'>");
            $ctrlDownload.attr('title', t.getValueFromKey("actions.download"));
            var $ctrlRemove = $("<span class='remove col-md-1'>");
            $ctrlRemove.attr('title', t.getValueFromKey("actions.delete"));
            var $type = $("<span class='type col-md-1'>");
            switch (name.split(".").pop()) {
                default:
                    $type.addClass("default");
            }

            // trim extra chars in name
            if (name.length > 25) {
                var displayName = name.substring(0, 22) + '...';
                $name.html(displayName);
                $name.attr("title", name);
            }

            // insert in DOM
            $file.data("name", name)
                .append($type)
                .append($name)
                .append($ctrlDownload)
                .append($ctrlRemove);
            $(".filesList").append($file);

            // add to binary files
            var binFile = {
                "name": name,
                "filedata": data
            };

            if (pk) {
                // already existing file
                binFile.id = pk;
                // disable remove button for existing files (not implemented in back)
                $ctrlRemove.addClass("disabled");
            } else {
                // new file was added, scroll to bottom so we can see it
                $("#settingFormPanel .scroll").slimScroll({
                    scrollTo: "9999px"
                });
                binFile.id = -1;
            }
            this.formFilesBinaryList[name] = binFile;
        },

        downloadAttachedFile : function(el){
            var name = $(el.target).parent().data("name");
            var data = this.formFilesBinaryList[name].filedata;
            data = "data:application/octet-stream;" + data.split(";")[1];
            var a = document.createElement("a");
            a.href = data;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        removeAttachedFile: function(el){
            // check that control isn't disabled
            if ($(el.target).hasClass("disabled")) {
                return;
            }
            var $file = $(el.target).parent();
            var name = $file.data("name");
            delete this.formFilesBinaryList[name];
            $file.remove();
        },

        /* -------------- */
        /* Fieldtypes bar */
        /* -------------- */
        initFieldTypes : function() {
            var context = this.context;

            // no soup for you
            if (!AppConfig.appMode[context] || context == "all") {
                return;
            }

            // insert each field found from specific context in config
            var fieldTypes = [];
            $.each(AppConfig.appMode[context], function (i, fieldType) {
                var field = Fields[fieldType];
                if (!field) {
                    // try appending "Field" suffix
                    fieldType += "Field";
                    field = Fields[fieldType];
                    if (!field) {
                        console.warn('initFieldTypes: field "' + fieldType + '" from config does not exist');
                        return;
                    }
                }
                fieldTypes.push({
                    type: fieldType,
                    i18n             : fieldType.replace('Field', '').toLowerCase(),
                    doubleColumn     : field.doubleColumn !== undefined,
                    fontAwesomeClass : field.fontAwesomeClass
                });
            });
            this.fieldTypes = fieldTypes;
        },

        appendToDrop : function(e) {
            var fieldType = $(e.target).data("type");
            if (!Fields[fieldType]) {
                tools.swal('error', 'modal.field.error', 'modal.field.errorMsg');
                return;
            }
            this.fieldCollection.addElement(fieldType);
        }
    });
});
