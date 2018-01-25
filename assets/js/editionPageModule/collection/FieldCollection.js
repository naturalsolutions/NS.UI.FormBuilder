/**
* @fileOverview collection.js
*
* Describe form model for the application
* Inherited from Backbone collection
*
* @author          MICELI Antoine (miceli.antoine@gmail.com)
* @version         1.0
*/

define([
    'jquery',
    'lodash',
    'backbone',
    '../models/Fields',
    'backbone.radio',
    '../../Translater',
    '../editor/CheckboxEditor',
    'app-config',
    'tools',
    '../editor/LanguagesEditor',
    './CollectionExtention',
    './staticInputs/ContextStaticInputs',
    'text!../templates/FieldTemplate.html'
], function ($, _, Backbone,
             Fields, Radio, translater, CheckboxEditor, AppConfig, tools,
             LanguagesEditor, CollectionExtention, ContextStaticInputs, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);
    var extention = CollectionExtention;
    var staticInputs = ContextStaticInputs;

    /**
    * Implement form object as a fields collection
    */
    var Form = Backbone.Collection.extend({
        options: {},

        /**
         * Collection schema for backbone forms generation
         * @type {Object}
         */
        defaultSchema : {
            name : {
                type        : "Text",
                title       : translater.getValueFromKey('form.name'),
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                },
                function test(value) {
                    if (value.length > 55) {
                        return {
                            type: 'String too wide',
                            message: translater.getValueFromKey('schema.maxlength55')
                        };
                    }
                }]
            },

            translations: {
                type: LanguagesEditor,
                title: translater.getValueFromKey("languages.title"),
                template: fieldTemplate,
                languages: {
                    // todo some kind of conf value ?
                    fr: {
                        name: translater.getValueFromKey('languages.fr'),
                        extraValidators: [{
                            type : 'required',
                            message : translater.getValueFromKey('form.validation'),
                            targets: ["Name", "Description"]
                        }],
                        required: true
                    },
                    en: {
                        name: translater.getValueFromKey('languages.en'),
                        extraValidators: [{
                            type : 'required',
                            message : translater.getValueFromKey('form.validation'),
                            targets: ["Name", "Description"]
                        }],
                        required: true
                    },
                    ar: {
                        name: translater.getValueFromKey('languages.ar')
                    }
                },
                schema: {
                    Name: {
                        type        : "Text",
                        title       : translater.getValueFromKey("languages.label"),
                        template    : fieldTemplate,
                        validators  : [
                            function test(value) {
                                if (value.length > 55) {
                                    return {
                                        type: 'String too wide',
                                        message: translater.getValueFromKey('schema.maxlength55')
                                    };
                                }
                            }]
                    },
                    Description: {
                        type        : "TextArea",
                        title       : translater.getValueFromKey("languages.description"),
                        template    : fieldTemplate,
                        validators  : [
                            function test(value) {
                                if (value.length > 255) {
                                    return {
                                        type: 'String too wide',
                                        message: translater.getValueFromKey('schema.maxlength255')
                                    };
                                }
                            }]
                    },
                    Keywords: {
                        type        : "Text",
                        title       : translater.getValueFromKey("languages.keywords"),
                        template    : fieldTemplate
                    }
                }
            },
            obsolete : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "form-group checkBoxEditor",
                title       : translater.getValueFromKey('schema.obsolete')
            },
            propagate : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "form-group checkBoxEditor",
                title       : translater.getValueFromKey('schema.propagate'),
                handlers    : [
                    // notify user this is serious matter
                    function(checked) {
                        if (checked) {
                            tools.swal('info',
                                'modal.editionField.fieldEditAlert',
                                'modal.editionField.propagationactivated');
                        }
                    }
                ]
            },
            context : {
                type        : "Hidden",
                template    : fieldTemplate
            }
        },

        getDefaultSchema : function (){
            var toret = _.cloneDeep(this.defaultSchema);
            $.extend(toret, extention.getSchemaExtention(this.options));
            return (toret);
        },

        /**
        * Init form collection
        *
        * @param {type} models
        * @param {type} options
        */
        initialize: function (models, options) {
            // init all extentions, allows some pre-fetching at app startup (done only once)
            CollectionExtention.initAllExtensions(options);

            var that = this;
            setExtention(options.context);
            setStatics(options.context);

            that.options = options;

            this.schemaDefinition = this.getDefaultSchema();

            $.each(extention.getSchemaExtention(options), function(index, value){
                that.schemaDefinition[index] = value;
            });

            var opt = options || {};

            this.url           = opt.url            || "";
            this.templateURL   = opt.templateURL    || "";

            this.id              = opt.id             || 0;
            this.name            = opt.name           || 'My form';
            this.tag             = opt.tag            || "";
            this.translations    = opt.translations   || {};
            this.obsolete        = opt.obsolete       || false;
            this.propagate       = opt.propagate      || false;
            this.context         = opt.context        || "";
            this.isTemplate      = opt.isTemplate     || false;
            this.fileList        = opt.fileList       || [];
            this.originalID      = opt.originalID     || 0;

            this.fieldstodelete  = [];

            extention.initializeExtention(options);

            $.each(extention.jsonExtention(), function(index, value){
                that[index] = opt[index] || value || "";
            });

            //  Bind
            _.bindAll(this, 'clearAll', 'getNextPropertyValue', 'addElement', 'getJSON', 'getJSONFromModel', 'removeElement');
        },

        getNextPropertyValue: function(property, dflt) {
            if (this.models.length === 0) {
                return dflt ? dflt: 1;
            }
            // return highest property + 1
            return Math.max.apply(Math,
                Object.values(this.models).map(
                    function(o) {
                        return o.get(property);
                    })) + 1;
        },

        /**
         * reorderItems cleans order of all this.models with compulsory fields first
         */
        reorderItems: function() {
            if (this.models.length == 0) return;
            var compulsoryFields = _.sortBy(_.filter(this.models, function(el) {
                return el.get('compulsory');
            }), function(el) {return el.get('order');});
            var normalFields = _.sortBy(_.filter(this.models, function(el) {
                return !el.get('compulsory');
            }), function(el) {return el.get('order');});
            var $cont = this.models[0].view.$container;

            var order = 0;
            _.each($.merge(Object.values(compulsoryFields), Object.values(normalFields)),
                function(field) {
                    var $el = field.view.$el.detach();
                    if (order === 0) {
                        $cont.prepend($el);
                    } else {
                        $cont.children().eq(order - 1).after($el);
                    }

                    field.view.updateIndex(order);
                    order++;
                });
        },

        /**
        * Clear form collection
        */
        clearAll: function () {
            /* TODO Ugly, must find a better way */
            var that = this;
            $.each($(".dropField"), function(index, value){
                that.fieldstodelete.push($(value).attr("id").replace("dropField", ""));
            });
            $(".dropField").remove();
            this.reset();
        },

        /**
         * Serialize model data to JSON
         *
         * @param  {Object} model model to serialize
         * @return {object}       model data serialized
         */

        getJSONFromModel: function (model) {
            var valuesToKeep = ["converted"];
            var valuesToKeepIfExists = {converted:["originalID"]};

            var subModel = model.getJSON();
            // delete meta field for backend usage
            delete subModel.meta;

            switch (model.constructor.type) {
                case 'CheckBox':
                    subModel['type'] = (model.constructor.type === "CheckBox") ? 'Checkboxes' : model.constructor.type;
                    break;

                default:
                    subModel['type'] = model.constructor.type;
                    break;
            }

            $.each(valuesToKeep, function(index, value){
               subModel[value] = model.attributes[value];
            });

            $.each(valuesToKeepIfExists, function(index, value){
               if (subModel[index])
               {
                   $.each(valuesToKeepIfExists[index], function(subindex, subvalue){
                       subModel[subvalue] = model.attributes[subvalue];
                   });
               }
            });

            return subModel;
        },

        /**
         * Serialize collection to JSON object
         *
         * @return {object} serialized collection data
         */
        getJSON: function (PostOrPut) {
            var getBinaryWeight = function(editModeVal) {
                var toret = editModeVal;
                if (!$.isNumeric(editModeVal))
                {
                    var loop = 1;
                    toret = 0;
                    for (var index in editModeVal) {
                        if(editModeVal[index])
                            toret += loop;
                        loop *= 2;
                    }
                }
                return(toret);
            };

            var setUnexistingStuff = function(mymodel){
                var compulsoryProps = ['editorClass', 'fieldClassEdit', 'fieldClassDisplay'];

                $.each(compulsoryProps, function(index, value){
                    if (!mymodel[value])
                        mymodel[value] =  '';
                });
            };

            var json         = {
                //  form properties
                name          : this.name,
                translations  : this.translations,
                tag           : this.tag || "",
                obsolete      : this.obsolete,
                propagate     : this.propagate,
                isTemplate    : this.isTemplate || false,
                context       : this.context,
                fileList      : this.fileList || [],
                //  form inputs
                schema        : {},
            }, subModel = null;

            var that = this;

            $.each(extention.jsonExtention(that), function(index, value){
                json[index] = that[index];
            });

            if (PostOrPut == "POST")
            {
                json.schema = staticInputs.getStaticInputs(this);
                json = staticInputs.applyRules(this, json);
                if (Object.keys(json.schema).length > 0) {
                    $.each(json.schema, function(k, v) {
                        // in case field was already added and
                        // there was an ajax error on save,
                        // do not re-add
                        if (that.findWhere({name: v.name})) {
                            return;
                        }
                        that.createField(v, v.type);
                    });
                }
            }

            this.reorderItems();

            this.map(_.bind(function (model) {
                if (model.constructor.type != undefined) {
                    subModel = this.getJSONFromModel(model);

                    if (!model.get("compulsory") && json.schema[model.get('name')] !== undefined) {
                        model.set('name', model.get('name') + model.get('id'));
                    }

                    if (model.get('name'))
                        json.schema[model.get('name')] = subModel;
                    else {
                        subModel.parentFormName = json.name;

                        json.schema["childform" + ((Object.keys(json.schema).length + 1) || "1")] = subModel;
                    }

                }
            }, this));

            $.each(json.schema, function(index, inputVal){
                inputVal.editMode = getBinaryWeight(inputVal.editMode);
                setUnexistingStuff(inputVal);
            });

            $.each(json, function(index, value){
                try{
                    json[index] = json[index].trim();
                }
                catch(e){

                }
            });

            $.each(json.schema, function(topindex, topvalue){
                $.each(topvalue, function(index, value){
                    try{
                        json.schema[topindex][index] = json.schema[topindex][index].trim();
                    }
                    catch(e){

                    }
                });
            });

            json.actif = !json.obsolete;
            return json;
        },

        /**
         * Add field in the form if this is a valid type
         *
         * @param field                 field to add
         */
        addField : function(field) {
            if (!this.isAValidFieldType(field.constructor.type)) {
                return false;
            }
            // is this a static field? (compulsory)
            field.set('compulsory', staticInputs.getCompulsoryInputs().indexOf(field.get('name')) > -1);

            if (!field.get('id')) {
                field.set('id', this.getNextPropertyValue('id', 1));
                field.set('new', true);
            }
            this.add(field);
            return field;
        },

        addElement: function (nameType, properties) {
            var field = properties || {};
            if (field['order'] === undefined)
                field['order'] = this.getNextPropertyValue('order', 0);
            var ctxLinkedFields = this.linkedFieldsList[this.context];
            if (ctxLinkedFields) {
                field['linkedFieldsList'] = ctxLinkedFields.linkedFieldsList;
                field['linkedTablesList'] = ctxLinkedFields.tablesList;
            }
            field['context'] = this.context;
            if (nameType.indexOf("Field") === -1) {
                nameType += "Field";
            }
            return this.addField(new Fields[nameType](field));
        },

        removeElement : function(model) {
            if (!model) return;

            var id = model.get("id");

            // remove dom element by hand cause it's faster than re-rendering
            model.view.$el.remove();
            model.trigger('destroy', model);
            if (!model.get('new')) {
                this.fieldstodelete.push(id);
            }
        },

        /**
         * Update collection : create field from JSON data
         *
         * @param  {object} JSONUpdate JSON data
         */
        updateWithJSON : function(JSONUpdate) {
            this.reset();
            this.JSONUpdate = JSONUpdate;
            //  Update form attribute
            this.updateCollectionAttributes(JSONUpdate);
        },

        /**
         * Check if the string in parameter is a valid field type
         *
         * @param typeToBeValidated string to test
         * @returns {boolean} if the string is a valid field type
         */
        isAValidFieldType : function(typeToBeValidated) {
            return Fields[typeToBeValidated + 'Field'] !== undefined;
        },

        /**
         * Update collection attributes
         *
         * @param  {Object} JSONUpdate JSON data
         */
        updateCollectionAttributes : function(JSONUpdate) {
            if (!JSONUpdate) return;
            this.id            = JSONUpdate['id'] !== undefined ? JSONUpdate['id'] : this.id;
            this.name          = JSONUpdate["name"];
            this.translations  = JSONUpdate["translations"];
            this.tag           = JSONUpdate["tag"];
            this.obsolete      = JSONUpdate["obsolete"];
            this.propagate     = JSONUpdate["propagate"];
            this.isTemplate    = JSONUpdate["isTemplate"];
            this.fileList      = JSONUpdate["fileList"];
            this.originalID    = JSONUpdate["originalID"];
            this.schema        = _.sortBy(JSONUpdate["schema"], function(el) {
                return el.order;
            });

            var that = this;

            $.each(extention.jsonExtention(), function(index, value){
                that[index] = JSONUpdate[index] || value || "";
            });
        },

        creadeFields: function() {
            var that = this;
            $(that.schema).each(function() {
                that.createField(this, "");
            });
        },

        createField: function(fieldObj, fieldType) {
            if (fieldObj.type == 'Checkboxes') {
                fieldObj.type = 'CheckBox';
            }

            if (this.isAValidFieldType(fieldObj.type) || this.isAValidFieldType(fieldType)) {
                return this.addElement((fieldObj.type || fieldType) + "Field", fieldObj, false);
            } else {
                // todo some kind of swal
                console.error("provided field type is not valid");
                return null;
            }
        },

        /**
         * Return collection attributes values
         */
        getAttributesValues : function() {
            return _.pick(this, _.keys(this.schemaDefinition));
        },

        /**
         * Save collection, send POST or PUT request to the back
         */
        save : function() {
            var that = this;
            that.showSpinner();

            var hasDuplicates = function(array) {
                return (new Set(array)).size !== array.length;
            };

            var tmpForm = new Backbone.Form({
                schema: that.getDefaultSchema(),
                data: that.getAttributesValues()
            }).render();

            var formValidation = tmpForm.validate();

            var fieldsValidation = true;

            var formValues = [];
            var formNames = [];

            $.each(that.models, function (index, value) {
                var fieldModel = that.get(value.id);
                if (!fieldModel.get("compulsory")) {
                    var fieldErrors = fieldModel.view.validate();
                    if (fieldErrors) {
                        fieldsValidation = false;
                        fieldModel.view.setValidationErrors(fieldErrors);
                    }
                }

                formValues.push({
                    id: value.get("id"),
                    name: value.get("name")
                });
                formNames.push(value.get("name"));
            });

            var fieldNamesHasDuplicates = hasDuplicates(formNames);

            if (formValidation != null && Object.keys(formValidation).length == 1 &&
                formValidation.importance && $('input#importance').val() == 0)
            {
                formValidation = null;
            }

            if (formValidation === null && fieldsValidation && !fieldNamesHasDuplicates) {
                $.each(that.models, function (index, value) {
                    delete that.get(value.id).attributes.validated;
                });

                var PostOrPut = that.id > 0 ? 'PUT' : 'POST';
                var url = that.id > 0 ? (that.url + '/' + that.id) : that.url;
                var dataToSend = JSON.stringify(that.getJSON(PostOrPut));

                $.ajax({
                    data: dataToSend,
                    type: PostOrPut,
                    url: url,
                    contentType: 'application/json',
                    //  If you run the server and the back separately but on the same server you need to use crossDomain option
                    //  The server is already configured to used it
                    crossDomain: true,

                    //  Trigger event with ajax result on the formView
                    success: _.bind(function (formData) {
                        // update form id (new form)
                        that.id = formData.id;
                        Backbone.history.navigate(
                            // replace last part of hash with new form id
                            Backbone.history.location.hash.replace(/\/[^\/]*$/, "/" + that.id),
                            {trigger: false}
                        );
                        if (formData.schema) {
                            // update field ids (new fields)
                            $.each(formData.schema, function (i, field) {
                                for (var i in that.fieldstodelete) {
                                    if (that.fieldstodelete[i] === field.id) return;
                                }

                                var curField = that.findWhere({
                                    name: field.name
                                });

                                if (!curField) {
                                    that.createField(field, field.type);
                                } else {
                                    curField.set('id', field.id);
                                    curField.set('new', false);
                                }
                            });
                        }

                        if (that.fieldstodelete && that.fieldstodelete.length > 0)
                        {
                            $.ajax({
                                data: JSON.stringify({fieldstodelete:that.fieldstodelete}),
                                type: 'DELETE',
                                url: that.url + "/" + that.id + "/deletefields",
                                contentType: 'application/json',
                                crossDomain: true,
                                success: function () {},
                                error: function (xhr) {
                                    console.error("error deleting fields", xhr);
                                }
                            });
                            that.fieldstodelete = [];
                        }

                        that.showSpinner(true);

                        // refresh forms list to update childForms options
                        tools.loadForms(that.context, false, true);
                        that.displaySuccessMessage();
                    }, that),
                    error: _.bind(function (xhr) {
                        that.showSpinner(true);
                        switch (xhr.status) {
                            case 418:
                                var errLabel = tools.parseErrorLabel(xhr.responseText);
                                switch (errLabel) {
                                    case "NAME":
                                        this.displayFailMessage("modal.save.formSimilarName");
                                        break;
                                    case "FRNAME":
                                        this.displayFailMessage("modal.save.formSimilarFrName");
                                        break;
                                    case "ENNAME":
                                        this.displayFailMessage("modal.save.formSimilarEnName");
                                        break;
                                    default:
                                        this.displayFailMessage("modal.save.418", xhr.responseText);
                                        break;
                                }
                                break;
                            case 508:
                                this.displayFailMessage("modal.save.circularDependency");
                                break;
                            default:
                                if (xhr.responseText.indexOf("customerror::") > -1)
                                    this.displayFailMessage(xhr.responseText.split("::")[1], xhr.responseText.split("::")[2]);
                                else if (xhr.responseText.indexOf('<!DOC') == -1) {
                                    this.displayFailMessage(xhr.responseText);
                                } else {
                                    this.displayFailMessage(xhr.status + " " + xhr.statusText);
                                }

                                break;
                        }
                    }, that)
                });
            }
            else {
                if (formValidation != null) {
                    $("#collectionName").css('color', "red");
                    tools.swal("error", "modal.save.uncompleteFormerror", "modal.save.uncompleteForm");
                }
                else if (!fieldsValidation) {
                    tools.swal("error", "modal.save.uncompleteFielderror", "modal.save.uncompleteField");
                }
                else if (fieldNamesHasDuplicates) {
                    tools.swal("error", "modal.save.hasDuplicateFieldNamesError", "modal.save.hasDuplicateFieldNames");
                    var savedNames = [];
                    $.each(formValues, function(index, value){
                        if (savedNames.indexOf(value.name) > -1){
                            $.each(formValues, function(subindex, subvalue){
                                if (subvalue.name == value.name)
                                {
                                    $("#dropField"+subvalue.id+" .field-label span").css("color", "red");
                                }
                            });
                        }
                        else
                        {
                            savedNames.push(value.name);
                        }
                    });
                }
                that.showSpinner(true);
            }
        },

        displaySuccessMessage : function() {
            this.dataUpdated = true;
            this.pendingChanges = false;
            tools.swal("success", "modal.save.success", "modal.save.successMsg");
        },

        displayFailMessage : function(textKey, textValue) {
            if (textKey) {
                tools.swal("error", "modal.save.error",
                    translater.getValueFromKey(textKey) + (textValue ? " -> " + textValue : ""));
            }
            else {
                tools.swal("error", "modal.save.error", "modal.save.errorMsg");
            }
        },

        showSpinner : function(hide) {
            var hidden = {'visibility': 'hidden'};
            var visible = {'visibility': 'visible'};
            $(".saveSpinner").css(hide? hidden: visible);
            $("#save").css(hide? visible: hidden);
        }
    });

    var setExtention = function(extentionToSet){
        var context = extentionToSet || window.context || $("#contextSwitcher .selected").text();
        extention = CollectionExtention.getModeExtention(context.toLowerCase());
    };

    var setStatics = function(staticsToSet){
        var context = staticsToSet ||  window.context || $("#contextSwitcher .selected").text();
        staticInputs = ContextStaticInputs.getStaticMode(context.toLowerCase());
    };

    return Form;
});
