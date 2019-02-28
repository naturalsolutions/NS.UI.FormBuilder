define([
    'jquery',
    'backbone',
    'marionette',
    'text!../templates/EditionPageLayout.html',
    'text!../templates/GridRowActions.html',
    '../views/FormPanelView',
    '../models/Fields',
    '../../Translater',
    'tools',
    'app-config',
    'backbone-forms'
], function($, Backbone, Marionette, EditionPageLayoutTemplate, GridRowActionsTemplate,
            FormPanelView, Fields, t, tools, AppConfig) {
    return Backbone.Marionette.View.extend({
        template : function() {
            return _.template(EditionPageLayoutTemplate) ({
                collection : this.fieldCollection,
                formUrl: this.formUrl,
                formBaseUrl: this.formBaseUrl,
                context: this.context,
                fieldTypes: this.fieldTypes,
                topcontext: AppConfig.topcontext,
                readonly: this.fieldCollection.readonly
            });
        },

        attributes: function() {
            return {
                "data-context": this.context,
                "data-topcontext": AppConfig.topcontext,
                "class": "edition"
            };
        },

        events : {
            'click .actionSave': 'save',
            'click #exit': 'exit',
            'click  .attachedFiles .addBtn'             : 'triggerFileClick',
            'change .attachedFiles input[type="file"]'  : 'fileInputChanged',
            'click  .attachedFiles .remove'             : 'removeAttachedFile',
            'click  .attachedFiles .download'           : 'downloadAttachedFile',
            'click  .versions tr'                       : 'displayVersion',

            'click .fieldTypes td'                      : 'appendToDrop',
            'keyup .rows'                               : 'gridKeypress',
            'focus #settingFormPanel input'             : 'clearSelected',
            'focus #settingFormPanel textarea'          : 'clearSelected',
            'focus #settingFormPanel select'            : 'clearSelected',
            'click .btnDelete'                          : 'deleteField',
            'click .btnConvert'                         : 'convertField',
            'click #fieldPropertiesPanel .btnOk'        : 'closeEdit',
            'click #fieldPropertiesPanel h2'            : 'closeEdit'
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

            this.formChannel = Backbone.Radio.channel('form');
            this.formChannel.on('editField', this.editField, this);
            this.formChannel.on('setSelected', this.setSelected, this);

            _.bindAll(this, 'template', 'clearSelected');

            this.update(this.fieldCollection);
            this.formPanel = new FormPanelView({
                fieldCollection : this.fieldCollection,
                URLOptions : this.URLOptions
            });
        },

        update: function(fieldCollection) {
            this.fieldCollection = fieldCollection;
            this.fieldCollection.dataUpdated = false;
            this.fieldCollection.pendingChanges = false;
            this.context = fieldCollection.context;
            this.formUrl = false;
            if (this.context.toLowerCase() === 'track' && fieldCollection.originalID) {
                this.formUrl =
                    AppConfig.trackFormURL.replace("#originalID#", fieldCollection.originalID);
            }

            this.formBaseUrl = tools.replaceLastSlashItem(Backbone.history.location.hash, '');
            if (this.fieldCollection.currentForm) {
                this.fieldCollection.currentFormUrl =
                    this.formBaseUrl + this.fieldCollection.currentForm;
            }

            this.$el.attr("data-readonly", this.fieldCollection.readonly);
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

            // notify view that its form was inserted in DOM
            this.editing.view.trigger("open", form);

            var focusEl = form.$el.find("input:not(:hidden)")[0];
            if (focusEl) focusEl.focus();
        },

        setSelected: function(model, focus) {
            if (this.selected === model) {
                return;
            } else if (this.selected && this.selected.view) {
                this.selected.view.$el.removeClass("selected");
            }

            this.selected = model;
            this.selected.view.$el.addClass("selected");
            if (focus === true) {
                this.selected.view.$el.find("input[name='name']").focus();
            }
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

            var view = this.editing.view;
            this.editing = null;
            view.$el.removeClass("editing");
            view.trigger("close");
            view.$el.find("input[name='name']").focus();

            // clearSelected if readonly
            if (this.fieldCollection.readonly) {
                this.clearSelected();
            }

            // re-enable panel
            $("#formPanel").removeClass("disabled");
            $("#fieldPropertiesPanel").removeClass("display").hide();
        },

        onRender : function() {
            this.generateFormProperties();
            this.getRegion('centerPanel').show(this.formPanel);
            this.formPanel.refresh();
            this.$el.i18n();
        },

        renderActions: function(model) {
            if (!model) {
                // clear gridRowActions section
                this.$el.find(".inputActions").empty();
                return;
            }

            var $el = $(_.template(GridRowActionsTemplate)({
                model: model
            }));
            $el.i18n();
            this.$el.find(".inputActions").html($el);
        },

        exit: function(url) {
            if (typeof(url) !== 'string') {
                url = "#back/" +
                    this.fieldCollection.context + "/" + this.fieldCollection.dataUpdated;
            }

            var exit = _.bind(function() {
                if (this.editing)
                    this.editing.view.trigger("close");

                Backbone.history.navigate(url, {trigger: true});
            }, this);

            if (!this.fieldCollection.pendingChanges) {
                exit();
                return;
            }

            // form was edited, display confirmation popup
            tools.swal("warning", "modal.clear.title", "modal.clear.loosingModifications",
                {
                    buttons: {
                        cancel: t.getValueFromKey('modal.clear.no'),
                        confirm: {
                            text: t.getValueFromKey('modal.exit.yes'),
                            value: true,
                            className: "danger"
                        }
                    }
                }, null, exit);
        },

        displayVersion: function(e) {
            this.exit(this.formBaseUrl + $(e.currentTarget).attr("data-id"));
        },

        gridKeypress: function(e) {
            if (e.keyCode === 27) {
                this.clearSelected();
                this.form.$el.find("#name").focus();
            }
        },

        save: function() {
            this.clearSelected();
            this.closeEdit();
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
                formData.id = this.fieldCollection.id;
                formData.state = this.fieldCollection.state;
                this.fieldCollection.updateCollectionAttributes(formData);
                this.fieldCollection.save();
            } else {
                tools.swal("error", 'modal.save.formPropertiesError', 'modal.save.formPropertiesErrorMsg');
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
                schemaDefinition = form.schemaDefinition;

            //Extend Backbone Form to implement middleware form, can be usefull
            var NsForm = Backbone.Form.extend({
                beforeRender: function(){
                    //pass
                },
                render: function(){
                    Backbone.Form.prototype.render.call(this);
                    this.afterRender();
                    return this;
                },
                afterRender: function(){
                    //pass
                }
            });

            this.form = new NsForm({
                schema: schemaDefinition,
                data  : datas
            }).render();

            // disable autocomplete, spellcheck etc.
            tools.disableInputAutoFeats(this.form.$el);

            // disable submit, it throws to an unwanted url redirection
            this.form.$el.on("submit", function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            // manually remove error on input change, to match behaviour of fields view
            this.form.$el.find("input, select, textarea").on("change", function(e) {
                var $errField = $(e.target).closest(".error");
                $errField.removeClass("error");
                $errField.find(".error-block").html(null);
                that.fieldCollection.pendingChanges = true;
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
            this.formFilesBinaryList = {};
            if (form.fileList) {
                $.each(form.fileList, function(index, value){
                    that.addAttachedFile(value.Pk_ID, value.name, value.filedata);
                });
            }

            // disable inputs, buttons & return
            if (this.fieldCollection.readonly) {
                this.form.$el.find("input, select, textarea, .remove").attr("disabled", true).addClass("disabled");
                return
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
                    $groupe.val('null').trigger("change");
                    $groupe.attr("disabled", true).addClass("notallowed");
                } else {
                    if ($groupe.find('option[value="null"]').is(':selected')) {
                        var prev = $groupe.data('previous');
                        var val = prev ? prev : [];
                        $groupe.val(val).trigger("change");
                    }
                    $groupe.find('option[value="null"]').hide();
                    $groupe.attr("disabled", false).removeClass("notallowed");
                }
            };

            // trigger updateGroupe on typeIndividus change
            $typeIndividus.on('change', updateGroupe);

            // manually disable #group if set to null
            if ($groupe.val() == 'null') $groupe.attr("disabled", true).addClass("notallowed");
        },

        /* ---------------------- */
        /* Attached files section */
        /* ---------------------- */
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
                // mark pending changes
                that.fieldCollection.pendingChanges = true;
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

            // prepare element todo table layout would be way simpler than bootstrap
            var $file = $("<tr class='file row'>");
            var $name = $("<td class='name'>").html(name);
            var $ctrlDownload = $("<td class='download'>");
            $ctrlDownload.attr('title', t.getValueFromKey("actions.download"));
            var $ctrlRemove = $("<td>");
            if (!this.fieldCollection.readonly) {
                $ctrlRemove.addClass('remove');
                $ctrlRemove.attr('title', t.getValueFromKey("actions.delete"));
            }
            var $type = $("<td class='type'>");
            var typeClass = "default";
            switch (name.split(".").pop().toLowerCase()) {
                case "doc":
                case "docx":
                case "odt":
                    typeClass = "doc";
                    break;
                case "xls":
                case "xlsx":
                case "ods":
                    typeClass = "xls";
                    break;
                case "jpg":
                case "svg":
                case "bmp":
                case "gif":
                    typeClass = "jpg";
                    break;
                case "png":
                    typeClass = "png";
                    break;
                case "pdf":
                    typeClass = "pdf";
                    break;
                default:
                    typeClass = "default";
            }
            $type.addClass(typeClass);

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
            this.$el.find(".filesList").append($file);

            // add to binary files
            var binFile = {
                "name": name,
                "filedata": data
            };

            binFile.id = pk? pk: -1;
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
            // mark pending changes
            this.fieldCollection.pendingChanges = true;
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
            if ($(e.target).attr("data-disabled") == "true") {
                return;
            }

            this.fieldCollection.pendingChanges = true;
            var fieldType = $(e.target).data("type");
            if (!Fields[fieldType]) {
                tools.swal('error', 'modal.field.error', 'modal.field.errorMsg');
                return;
            }
            var model = this.fieldCollection.addElement(fieldType);

            // there is an occasional bug where the "add" event triggered by
            // fieldCollection.add(obj), that should be listened by FormPanel, does
            // not occur. This hack tries to workaround this faulty behavior
            if (model.view === undefined) {
                this.formPanel.addElement(model);
            }
            this.setSelected(model, true);
        },

        deleteField: function(noSwal) {
            if (!this.selected) {
                return;
            }

            var goDelete = _.bind(function() {
                var sibling = model.view.$el.next();
                if (sibling.length == 0 || sibling.hasClass("static")) {
                    sibling = model.view.$el.prev();
                }
                var siblingId = sibling.data("id");

                this.fieldCollection.pendingChanges = true;
                this.fieldCollection.removeElement(model);
                this.clearSelected();

                // select sibling if available
                if (siblingId && !sibling.hasClass("static")) {
                    this.setSelected(this.fieldCollection.findWhere({id: siblingId}), true);
                }
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

            var selectOptions = toConvert.get("compatibleFields");
            if (!selectOptions || selectOptions.length === 0) {
                tools.swal("warning",
                    "settings.actions.noCompatibleFieldsTitle",
                    t.getValueFromKey(
                        "settings.actions.noCompatibleFields",
                        {
                            type: t.getValueFromKey("fields." + toConvert.get("meta").i18n.toLowerCase())
                        }
                    )
                );
                return;
            }

            tools.swalSelect("warning",
                "settings.actions.convertTitle",
                t.getValueFromKey("settings.actions.convertValidate", {field: toConvert.get('name')}),
                "settings.actions.convertLabel",
                toConvert.get("compatibleFields"),
                {
                    buttons: {
                        cancel: t.getValueFromKey('settings.actions.convertNo'),
                        confirm: {
                            text: t.getValueFromKey('settings.actions.convertYes'),
                            value: true,
                            className: "danger"
                        }
                    }
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
                    model.set('new', toConvert.get('new'));
                    this.setSelected(model, true);
                }, this));
        }
    });
});
