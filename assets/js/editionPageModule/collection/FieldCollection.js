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
    './CollectionExtention',
    './staticInputs/ContextStaticInputs'
], function ($, _, Backbone, Fields, Radio, Translater, CheckboxEditor, AppConfig, CollectionExtention, ContextStaticInputs) {

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var translater = Translater.getTranslater();
    var extention = CollectionExtention;
    var staticInputs = ContextStaticInputs;

    /**
    * Implement form object as a fields collection
    */
    var Form = Backbone.Collection.extend({
        model: Fields.BaseField,
        options: {},

        /**
         * Collection schema for backbone forms generation
         * @type {Object}
         */
        defaultSchema : {
            name : {
                type        : "Text",
                title       : translater.getValueFromKey('form.name'),
                editorClass : 'form-control',
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
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.form.name')
                }
            },
            labelFr   : {
                type        : "Text",
                title       : translater.getValueFromKey('form.label.fr'),
                editorClass : 'form-control',
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
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.form.label.fr')
                }
            },
            labelEn   : {
                type        : "Text",
                title       : translater.getValueFromKey('form.label.en'),
                editorClass : 'form-control',
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
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.form.label.en')
                }
            },
            descriptionFr : {
                type        : "TextArea",
                title       : translater.getValueFromKey('form.description.fr'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                },
                function test(value) {
                    if (value.length > 255) {
                        return {
                            type: 'String too wide',
                            message: translater.getValueFromKey('schema.maxlength255')
                        };
                    }
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.form.description.fr')
                }
            },
            descriptionEn : {
                type        : "TextArea",
                title       : translater.getValueFromKey('form.description.en'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                },
                function test(value) {
                    if (value.length > 255) {
                        return {
                            type: 'String too wide',
                            message: translater.getValueFromKey('schema.maxlength255')
                        };
                    }
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.form.description.en')
                }
            },
            keywordsFr : {
                type        : "Text",
                title       : translater.getValueFromKey('form.keywords.fr'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            keywordsEn : {
                type        : "Text",
                title       : translater.getValueFromKey('form.keywords.en'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            obsolete : {
                type        : CheckboxEditor,
                fieldClass  : "form-group checkBoxEditor",
                title       : translater.getValueFromKey('schema.obsolete')
            },
            propagate : {
                type        : CheckboxEditor,
                fieldClass  : "form-group checkBoxEditor",
                title       : translater.getValueFromKey('schema.propagate')
            },
            context : {
                type        : "Hidden",
                editorClass : 'form-control',
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
            this.descriptionFr   = opt.descriptionFr  || "";
            this.descriptionEn   = opt.descriptionEn  || "";
            this.keywordsFr      = opt.keywordsFr     || ["formulaire"];
            this.keywordsEn      = opt.keywordsEn     || ["form"];
            this.labelFr         = opt.labelFr        || "";
            this.labelEn         = opt.labelEn        || "";
            this.tag             = opt.tag            || "";
            this.obsolete        = opt.obsolete       || false;
            this.propagate       = opt.propagate      || false;
            this.context         = opt.context        || "";
            this.isTemplate      = opt.isTemplate     || false;
            this.fileList        = opt.fileList       || [];
            this.originalID      = opt.originalID     || 0;

            this.fieldstodelete  = [];
            this.fieldsexcludedfromdelete = [];
            this.totalAddedElements = 0;
            this.checkedfields = 0;
            this.maxfields = 0;
            this.working = false;

            extention.initializeExtention(options);

            $.each(extention.jsonExtention(), function(index, value){
                that[index] = opt[index] || value || "";
            });

            $.each(extention.rulesList(), function(index, value){
                that.schemaDefinition[index].validators.push(value);
            });

            //  Bind
            _.bindAll(this, 'clearAll', 'lastIndex', 'addElement', 'getJSON', 'getJSONFromModel', 'removeElement');

            this.hookChannel = Backbone.Radio.channel('hook');
            this.mainChannel = Backbone.Radio.channel('edition');
            this.formChannel = Backbone.Radio.channel('form');
            //  Event send from BaseView or inherited view when user wants to remove a field
            this.formChannel.on('remove', this.removeElement);
            //  Event send by BaseView or BaseView inherited view for duplicate model
            this.formChannel.on('copyModel', this.copyModel, this);
            //  Event send by SettingFieldPanelView when a field has changed
            this.formChannel.on('field:change', this.fieldChange, this);
        },

        comparator: function (model) {
            return model.get(model.id);
        },

        lastIndex: function () {
            if (this.models.length === 0) return 0;
            // return highest order + 1
            return Math.max.apply(Math,
                Object.values(this.models).map(
                    function(o) {
                        return o.get('order');
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
            $cont.empty();

            var order = 0;
            _.each($.merge(Object.values(compulsoryFields), Object.values(normalFields)),
                function(field) {
                    $cont.append(field.view.$el);
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
         * Serialize subform field and sub field
         *
         * @param  {object} model subform to serialize
         * @return {object}       subform data serialized
         */
        getFieldsetFromModel: function (model) {
            return {
                legend   : model.get('legend'),
                fields   : model.get('fields'),
                multiple : model.get('multiple'),
                cid      : model.cid,
                order    : model.get('order')
            };
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
                descriptionFr : this.descriptionFr,
                descriptionEn : this.descriptionEn,
                keywordsEn    : this.keywordsEn,
                keywordsFr    : this.keywordsFr,
                labelFr       : this.labelFr,
                labelEn       : this.labelEn,
                tag           : this.tag || "",
                obsolete      : this.obsolete,
                propagate     : this.propagate,
                isTemplate    : this.isTemplate || false,
                context       : this.context,
                fileList      : this.fileList || [],
                //  form inputs
                schema        : {},
                fieldsets     : []
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
                        var f = that.createField(v, v.type);
                        f.set('skip', true);
                    });
                    this.reorderItems();
                }
            }

            this.map(_.bind(function (model) {
                if (model.constructor.type === 'Subform') {
                    json.fieldsets.push(this.getFieldsetFromModel(model));
                } else if (model.constructor.type != undefined) {
                    // skip newly created static inputs
                    if (model.get('skip')) return;

                    subModel = this.getJSONFromModel(model);

                    if (json.schema[model.get('name')] !== undefined) {
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
                $.each(json.fieldsets, function(index, fieldsetVal){
                    if (inputVal.linkedFieldset != fieldsetVal.legend + " " + fieldsetVal.cid &&
                        $.inArray(inputVal.name, fieldsetVal.fields) != -1){
                        fieldsetVal.fields = $.grep(fieldsetVal.fields, function(value){
                            return value != inputVal.name;
                        });
                    }
                });

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
            console.log("json to return", json);
            return json;
        },

        /**
         * Add field in the form if this is a valid type
         *
         * @param field                 field to add
         * @param ifFieldIsInFieldset   if field in under a fieldset
         * @param newElement            if field is a new element
         */
        addField : function(field) {
            if (!this.isAValidFieldType(field.constructor.type)) {
                return false;
            }
            // is this a static field? (compulsory)
            field.set('compulsory', staticInputs.getCompulsoryInputs().indexOf(field.get('name')) > -1);

            this.totalAddedElements++;
            if (!field.get('id')) {
                field.set('id', this.totalAddedElements);
                field.set('new', true);
                this.fieldsexcludedfromdelete.push(field.get('id'));
            }
            this.add(field);
            return field;
        },

        addElement: function (nameType, properties) {
            console.log("addNewElement-", nameType);
            var field = properties || {};
            if (field['order'] === undefined)
                field['order'] = this.lastIndex();
            return this.addField(new Fields[nameType](field));
        },

        /**
         * Remove sub field from a subForm
         *
         * @param subFormId sub form to remove id
         */
        destroySubElement : function(subFormId) {
            this.map(function(model, idx) {
                if (model.get('subFormParent') == subFormId) {
                    model.trigger('destroy', model);
                }
            })
        },

        /**
         * Remove element from collection
         *
         * @param  {integer} id model to remove id
         */
        removeElement : function(id, avoidSettingsClosure) {
            var item = this.get(id);

            if (item !== undefined) {
                //  If the field is a subForm field we remove all subFormField
                if (item.constructor.type == 'Subform') {
                    this.destroySubElement(item.get('id'));
                }

                if (item.get('subFormParent') !== undefined) {
                    var fieldSet = this.get(item.get('subFormParent'));
                    fieldSet.removeField(item.get('name'));
                }

                this.hookChannel.trigger('field:remove', this, item);

                //  We used trigger instead destroy method, the DELETE ajax request is not send
                item.trigger('destroy', item);

                if ($.inArray(item.get('id'), this.fieldsexcludedfromdelete) == '-1')
                {
                    this.fieldstodelete.push(item.get('id'));
                }

                if (!avoidSettingsClosure)
                    this.formChannel.trigger('cancelFieldEdition', null, true, item.get('id'));
            }
        },

        /**
         * Update collection : create field and fieldset from JSON data
         *
         * @param  {object} JSONUpdate JSON data
         */
        updateWithJSON : function(JSONUpdate) {
            this.JSONUpdate = JSONUpdate;
            this.models = [];
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
            this.descriptionFr = JSONUpdate["descriptionFr"];
            this.descriptionEn = JSONUpdate["descriptionEn"];
            this.keywordsFr    = JSONUpdate["keywordsFr"];
            this.keywordsEn    = JSONUpdate["keywordsEn"];
            this.labelFr       = JSONUpdate["labelFr"];
            this.labelEn       = JSONUpdate["labelEn"];
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
            console.log("createField", fieldObj.name, fieldObj.order);
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
         * Return fields list
         * @param  {[type]} modelID id of field to excluse of the list
         * @return {[Array} list of field
         */
        getFieldList : function(modelID) {
            var fieldsList = [];

            _.each(this.models, function(el) {
                if (el.constructor.type != undefined && el.get('id') != modelID) {
                    fieldsList.push(el.get('name'))
                }
            });

            return fieldsList;
        },

        /**
         * Save collection, send POST or PUT request to the back
         */
        save : function() {
            // todo this looks quite ugly
            // first and foremost - remove trigger-y mess
            var that = this;
            that.showSpinner();

            var hasDuplicates = function(array) {
                return (new Set(array)).size !== array.length;
            };

            if (!that.formChannel)
                that.initFormChannel();

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
                if (!fieldModel.attributes.validated) {
                    var fieldForm = new Backbone.Form({
                        model: fieldModel
                    }).render();

                    if (!fieldForm.staticfield)
                    {
                        var fieldformresult = fieldForm.validate();
                        if (fieldformresult != null &&
                            $.inArray(fieldModel.attributes.name, staticInputs.getCompulsoryInputs()) == -1)
                        {
                            fieldsValidation = false;
                            $("#dropField"+value.id+" .field-label span").css("color", "red");
                        }
                    }

                    formValues.push({
                        id:fieldForm.model.attributes.id,
                        name:fieldForm.model.attributes.name
                    });
                    formNames.push(fieldForm.model.attributes.name);
                }
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
                    success: _.bind(function (data) {
                        // update form id (new form)
                        that.id = data.form.id;
                        // todo insert fuckers staticinputz ------ into current shit
                        if (data.form.schema) {
                            // update field ids (new fields)
                            $.each(data.form.schema, function (i, field) {
                                var curField = that.findWhere({
                                    name: field.name
                                });
                                if (!curField) {
                                    that.createField(field, field.type);
                                } else {
                                    curField.set('id', field.id);
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
                                success: _.bind(function (data) {
                                }, that),
                                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                                    that.formChannel.trigger('save:fail');
                                }, that)
                            });
                        }

                        that.fieldstodelete = [];
                        that.fieldsexcludedfromdelete = [];

                        var displaySaveSuccess = function(){
                            setTimeout(function () {
                                if (that.fieldstodelete.length == 0) {
                                    that.formChannel.trigger('save:success');
                                    that.showSpinner(true);
                                }
                                else
                                    displaySaveSuccess();
                            }, 200);

                            window.formbuilder.formedited = false;
                        };

                        displaySaveSuccess();
                    }, that),
                    error: _.bind(function (xhr) {
                        if (xhr.status == 418)
                        {
                            if (xhr.responseText.indexOf("ERR:NAME") !== -1)
                            {
                                that.formChannel.trigger('save:fail', "modal.save.formSimilarName");
                            }
                            else if (xhr.responseText.indexOf("ERR:FRNAME") !== -1)
                            {
                                that.formChannel.trigger('save:fail', "modal.save.formSimilarFrName");
                            }
                            else if (xhr.responseText.indexOf("ERR:ENNAME") !== -1)
                            {
                                that.formChannel.trigger('save:fail', "modal.save.formSimilarEnName");
                            }
                            else
                            {
                                that.formChannel.trigger('save:fail', "modal.save.418");
                            }
                            $("#collectionName").css('color', "red");
                        }
                        else if (xhr.status == 508)
                        {
                            that.formChannel.trigger('save:fail', "modal.save.circularDependency");
                        }
                        else
                        {
                            if (xhr.responseText.indexOf("customerror") > -1)
                                that.formChannel.trigger('save:fail', xhr.responseText.split("::")[1], xhr.responseText.split("::")[2]);
                            else
                                that.formChannel.trigger('save:fail');
                        }
                        that.showSpinner(true);
                    }, that)
                });
            }
            else {
                if (formValidation != null)
                {
                    that.formChannel.trigger('save:formIncomplete');
                    $("#collectionName").css('color', "red");
                }
                else if (!fieldsValidation)
                {
                    that.formChannel.trigger('save:fieldIncomplete');
                }
                else if (fieldNamesHasDuplicates)
                {
                    that.formChannel.trigger('save:hasDuplicateFieldNames');
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

        saveAsTemplate : function() {

            $.ajax({
                data        : JSON.stringify(this.getJSON()),
                type        : 'POST',
                url         : this.templateURL,
                contentType : 'application/json',
                //  If you run the server and the back separately but on the same server you need to use crossDomain option
                //  The server is already configured to used it
                crossDomain : true,

                //  Trigger event with ajax result on the formView
                success: _.bind(function(data) {
                    this.formChannel.trigger('template:success');
                }, this),
                error: _.bind(function() {
                    this.formChannel.trigger('fail:success');
                }, this)
            });
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
