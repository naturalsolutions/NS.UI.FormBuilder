define([
    'jquery',
    'marionette',
    'text!../templates/EditionPageLayout.html',
    'text!../templates/GridRowActions.html',
    '../views/FormPanelView',
    '../models/Fields',
    '../../Translater',
    'tools',
    'app-config',
    'backbone-forms'
], function($, Marionette, EditionPageLayoutTemplate, GridRowActionsTemplate,
            FormPanelView, Fields, Translater, tools, AppConfig) {
    var t = Translater.getTranslater();

    return Backbone.Marionette.LayoutView.extend({
        template : function() {
            return _.template(EditionPageLayoutTemplate) ({
                collection : this.fieldCollection.getAttributesValues(),
                context: this.context,
                fieldTypes: this.fieldTypes,
                topcontext: AppConfig.topcontext,
                readonly: AppConfig.readonlyMode
            });
        },

        attributes: function() {
            return {
                "data-context": this.context,
                "data-topcontext": AppConfig.topcontext,
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

            'click .fieldTypes td'                    : 'appendToDrop',
            'keyup .rows'                             : 'gridKeypress',
            'focus #settingFormPanel input'           : 'clearSelected',
            'focus #settingFormPanel textarea'        : 'clearSelected',
            'focus #settingFormPanel select'          : 'clearSelected',
            'click .btnDelete'                        : 'deleteField',
            'click .btnConvert'                       : 'convertField',
            'click .btnOk'                            : 'closeEdit'
        },

        regions : {
            centerPanel : '#gridView',
            settingFormPanel : '#settingFormPanel'
        },

        initialize : function(options) {
            this.options = options;
            this.linkedFieldsList = options.linkedFieldsList;
            this.fieldCollection = options.fieldCollection;
            this.fieldCollection.linkedFieldsList = options.linkedFieldsList;
            this.URLOptions = options.URLOptions;
            this.context = this.fieldCollection.context;
            this.formFilesBinaryList = {};

            this.mainChannel = Backbone.Radio.channel('edition');
            this.mainChannel.on('setTemplateList', this.setTemplateList, this);
            this.mainChannel.on('unsetTemplateList', this.unsetTemplateList, this);


            this.formChannel = Backbone.Radio.channel('form');
            this.formChannel.on('editField', this.editField, this);
            this.formChannel.on('setSelected', this.setSelected, this);
            this.formChannel.on('closeEdit', this.closeEdit, this);

            _.bindAll(this, 'template', 'clearSelected');

            this.update(this.fieldCollection);
        },

        update: function(fieldCollection) {
            this.fieldCollection = fieldCollection;
            this.fieldCollection.dataUpdated = false;
            this.fieldCollection.pendingChanges = false;
            this.context = fieldCollection.context;
            this.initFieldTypes();
        },

        editField: function(model, panelTitle, form) {
            this.setSelected(model);
            this.editing = model;
            model.view.$el.addClass("editing");

            // disable formPanel while editing field
            $("#formPanel").addClass("disabled");

            // update panel title
            $("#fieldPropertiesPanel").find("h2").attr("data-i18n", panelTitle).i18n();

            // display panel
            $("#fieldPropertiesPanel").show().css({width: $("td.options").outerWidth()});

            // insert form with padding & slimscrollIt
            var padding = 11 + $("#fieldPropertiesPanel h2").outerHeight();
            this.$el.find("#fieldPropertiesPanel").find(".properties")
                .html(form.$el)
                .slimScroll({
                    height: 'calc(100% - ' + padding + 'px)',
                    railVisible: true,
                    alwaysVisible : true
                });
            $("#fieldPropertiesPanel").addClass("display");
        },

        setSelected: function(model) {
            if (this.selected === model) {
                return;
            } else if (this.selected) {
                this.selected.view.$el.removeClass("selected");
            }

            this.selected = model;
            this.selected.view.$el.addClass("selected");
            this.renderActions(this.selected);
        },

        clearSelected: function() {
            if (!this.selected || this.editing) {
                return;
            }
            this.selected.view.$el.removeClass("selected");
            this.selected = null;
            this.renderActions(null);
        },

        closeEdit: function() {
            if (!this.editing) return;

            this.editing.view.$el.find("input[name='name']").focus();
            this.editing.view.$el.removeClass("editing");
            this.editing = null;

            // re-enable panel
            $("#formPanel").removeClass("disabled");
            $("#fieldPropertiesPanel").removeClass("display").delay(500).hide(0);
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

        renderActions: function(model) {
            if (!model) {
                // clear gridRowActions section
                this.$el.find("#gridRowActions").empty().removeClass("enabled");
                return;
            }

            var $el = $(_.template(GridRowActionsTemplate)({
                model: model
            }));
            $el.i18n();
            this.$el.find("#gridRowActions").html($el).addClass("enabled");
        },

        exit: function() {
            var exit = _.bind(function() {
                this.formChannel.trigger('exit', this.fieldCollection.dataUpdated);
            }, this);

            if (!this.fieldCollection.pendingChanges || this.readonly) {
                exit();
                return;
            }

            // form was edited, display confirmation popup
            tools.swal("warning", "modal.clear.title", "modal.clear.loosingModifications", {
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : t.getValueFromKey('modal.exit.yes'),
                cancelButtonText   : t.getValueFromKey('modal.clear.no')
            }, null, exit);
        },

        gridKeypress: function(e) {
            if (e.keyCode === 27) {
                this.clearSelected();
                this.form.$el.find("#name").focus();
            }
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
            this.clearSelected();
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

            // manually remove error on input change, to match behaviour of fields view
            this.form.$el.find("input, select, textarea").on("change", function(e) {
                var $errField = $(e.target).closest(".error");
                $errField.removeClass("error");
                $errField.find(".error-block").html(null);
                that.fieldCollection.pendingChanges = true;
            });

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
            tools.appendRequired(this.form.$el, form.schemaDefinition);

            // append files if any
            if (form.fileList) {
                $.each(form.fileList, function(index, value){
                    that.addAttachedFile(value.Pk_ID, value.name, value.filedata);
                });
            }

            // set custom double binding between #group and #typeIndividus
            // this is track specific - todo NotLikeThat
            var $groupe = $(this.form.el).find('select#groupe');
            var $typeIndividus = $(this.form.el).find('select#typeIndividus');
            var updateGroupe = function() {
                if($typeIndividus.val().toLowerCase().indexOf("nouvel") !== -1) {
                    if ($groupe.val() == 'null') {
                        // skip if value is already null to avoid
                        // losing $groupe.data('previous')
                        return;
                    }

                    $groupe.find('option[value="null"]').show();
                    $groupe.data('previous', $groupe.val());
                    $groupe.val('null');
                    $groupe.attr("disabled", true);
                } else {
                    if ($groupe.find('option[value="null"]').is(':selected')) {
                        var prev = $groupe.data('previous');
                        var val = prev ? prev : [];
                        $groupe.val(val);
                    }
                    $groupe.find('option[value="null"]').hide();
                    $groupe.attr("disabled", false);
                }
            };

            // trigger updateGroupe on typeIndividus change
            $typeIndividus.on('change', updateGroupe);

            // manually disable #group if set to null
            if ($groupe.val() == 'null') $groupe.attr("disabled", true);
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
            if (!AppConfig.contexts[context] || context == "all") {
                return;
            }

            // insert each field found from specific context in config
            var fieldTypes = [];
            $.each(tools.getContextConfig(context, "inputTypes"), function (i, fieldType) {
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
            this.fieldCollection.pendingChanges = true;
            var fieldType = $(e.target).data("type");
            if (!Fields[fieldType]) {
                tools.swal('error', 'modal.field.error', 'modal.field.errorMsg');
                return;
            }
            var model = this.fieldCollection.addElement(fieldType);
            this.setSelected(model);
            model.view.$el.find("input[name='name']").focus();
        },

        deleteField: function(noSwal) {
            if (!this.selected) {
                return;
            }

            var goDelete = _.bind(function() {
                this.fieldCollection.pendingChanges = true;
                this.fieldCollection.removeElement(model);
                this.clearSelected();
            }, this);

            var model = this.selected;
            if (model.get('new') || (noSwal === true)) {
                // no confirmation if element is new, or asked with noSwal arg
                goDelete();
            } else {
                // pass to BaseView.removeView, which needs to be rewritten
                // todo but not now
                model.view.removeView(goDelete);
            }
        },

        convertField: function() {
            var toConvert = this.selected;

            var selectOptions = toConvert.get("compatibleFields")
            if (!selectOptions || selectOptions.length === 0) {
                console.error("no compatible fields set for model", this.get("type"), this.get("id"));
                return;
            }

            tools.swalSelect("warning",
                "settings.actions.convertTitle",
                "settings.actions.convertValidate",
                "settings.actions.convertLabel",
                toConvert.get("compatibleFields"),
                {
                    confirmButtonColor : "#DD6B55",
                    confirmButtonText  : t.getValueFromKey('settings.actions.convertYes'),
                    cancelButtonText   : t.getValueFromKey('settings.actions.convertNo')
                }, _.bind(function(targetFieldType) {
                    this.fieldCollection.pendingChanges = true;

                    if (!toConvert.get('new')) {
                        // notify field convertion only if field already exists
                        toConvert.set("converted", toConvert.get("id"));
                    }
                    this.deleteField(true);

                    // model.id needs to be deleted.
                    // Otherwise backbone somehow retreives existing
                    // item on new Field(props) instead of actually creating a new object.
                    delete(toConvert.attributes.id);

                    // insert and select new element
                    var model = this.fieldCollection.addElement(targetFieldType, toConvert.attributes);
                    this.setSelected(model);
                    model.view.$el.find("input[name='name']").focus();
                }, this));
        }
    });
});
