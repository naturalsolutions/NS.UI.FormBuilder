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
    'backbone',
    '../models/fields',
    'backbone.radio',
    '../../Translater',
    '../editor/CheckboxEditor',
    'pillbox-editor'
], function ($, Backbone, Fields, Radio, Translater,CheckboxEditor, PillboxEditor) {

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

    /**
    * Implement form object as a fields collection
    */
    var Form = Backbone.Collection.extend({
        model: Fields.BaseField,

        /**
         * Collection schema for backbone forms generation
         * @type {Object}
         */
        schemaDefinition : {
            name : {
                type        : "Text",
                title       : translater.getValueFromKey('form.name'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            tag : {
                type        : "Text",
                title       : translater.getValueFromKey('form.tag') + ' <i>(' + translater.getValueFromKey('optional') + ')</i>',
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            labelFr   : {
                type        : "Text",
                title       : translater.getValueFromKey('form.label.fr'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            labelEn   : {
                type        : "Text",
                title       : translater.getValueFromKey('form.label.en'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            labelEn   : {
                type        : "Text",
                title       : translater.getValueFromKey('form.label.en'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            descriptionEn : {
                type        : "TextArea",
                title       : translater.getValueFromKey('form.description.en'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            descriptionFr : {
                type        : "TextArea",
                title       : translater.getValueFromKey('form.description.fr'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            keywordsFr : {
                type        : PillboxEditor,
                title       : translater.getValueFromKey('form.keywords.fr')
            },
            keywordsEn : {
                type        : PillboxEditor,
                title       : translater.getValueFromKey('form.keywords.en')
            },
            obsolete : {
                type        : CheckboxEditor,
                fieldClass  : "checkBoxEditor",
                title       : translater.getValueFromKey('schema.obsolete')
            }
        },

        /**
        * Init form collection
        *
        * @param {type} models
        * @param {type} options
        */
        initialize: function (models, options) {
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
            this.isTemplate      = opt.isTemplate     || false;
            this.fieldstodelete  = [];

            //  Bind
            _.bindAll(this, 'clearAll', 'getSize', 'addElement', 'addNewElement', 'getJSON', 'getJSONFromModel', 'removeElement');

            this.initFormChannel();
            this.initHookChannel();
        },

        /**
         * Init form channel
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Event send from BaseView or inherited view when user wants to remove a field
            this.formChannel.on('remove', this.removeElement);

            //  Event send by BaseView or BaseView inherited view for duplicate model
            this.formChannel.on('copyModel', this.copyModel, this);

            //
            //  Field queue events
            //

            //  Event send form formPanelView for add the next field to the collection
            //  See createFieldFromSchema method
            this.formChannel.on('nextField', this.nextField, this);

            //  Next fieldset event send by subFormView
            this.formChannel.on('nextFieldSet', this.createFieldsets, this);

            //  Event send by SettingFieldPanelView when a field has changed
            this.formChannel.on('field:change', this.fieldChange, this);
        },


        initHookChannel : function() {
            this.hookChannel = Backbone.Radio.channel('hook');
        },

        fieldChange : function(id) {
            this.hookChannel.trigger('field:change', this, this.get('id'));
        },

        /**
         * Duplicate model in the collection
         *
         * @param modelToCloneID model to duplicate ID
         */
        copyModel : function(modelToCloneID) {
            var originModel = this.at(modelToCloneID),
                nameType    = originModel.constructor.type + 'Field'

            this.addElement(nameType, _.omit(originModel.attributes, 'id'), false);
        },

        /**
        * Allow to arrange the collection through model id
        *
        * @param {formBuild.BaseModel} model  model
        * @returns {integer} comparaison between id
        */
        comparator: function (model) {
            return model.get(model.id);
        },

        /**
        * Return collection size
        * @returns {integer} collection size
        */
        getSize: function () {
            return this.length;
        },

        /**
        * Clear form collection
        */
        clearAll: function () {
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
                cid      : model.cid
            };
        },

        /**
         * Serialize model data to JSON
         *
         * @param  {Object} model model to serialize
         * @return {object}       model data serialized
         */
        getJSONFromModel: function (model) {
            var subModel = model.getJSON();

            switch (model.constructor.type) {
                case 'CheckBox':
                    subModel['type'] = (model.constructor.type === "CheckBox") ? 'Checkboxes' : model.constructor.type;
                    break;

                default:
                    subModel['type'] = model.constructor.type;
                    break;
            }

            return subModel;
        },

        /**
         * Serialize collection to JSON object
         *
         * @return {object} serialized collection data
         */
        getJSON: function () {
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
                    };
                }
                return(toret);
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
                isTemplate    : this.isTemplate || false,
                //  form inputs
                schema        : {},
                fieldsets     : []
            }, subModel = null;

            this.map(_.bind(function (model) {
                if (model.constructor.type === 'Subform') {
                    json.fieldsets.push(this.getFieldsetFromModel(model));
                } else if (model.constructor.type != undefined) {

                    subModel = this.getJSONFromModel(model);

                    if (json.schema[model.get('name')] !== undefined) {
                        model.set('name', model.get('name') + model.get('id'));
                    }

                    json.schema[model.get('name')] = subModel;
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
            });

            $.each(json.schema, function(index, val){val.editMode = getBinaryWeight(val.editMode);});

            return json;
        },

        /**
         * Add field in the form if this is a valid type
         *
         * @param field                 field to add
         * @param ifFieldIsInFieldset   if field in under a fieldset
         */
        addField : function(field, ifFieldIsInFieldset, scrollToBottom) {
            if (this.isAValidFieldType(field.constructor.type)) {
                //  Update field
                field.set('isUnderFieldset', ifFieldIsInFieldset === true);

                if (field.get('id') === 0 || field.get('id') == undefined) {
                    field.set('id', this.getSize() + 1);
                }
                if (field.get('name') == Fields.BaseField.prototype.defaults.name)
                    field.set('name', field.get('name') + " " + field.get('id'));

                this.add(field);

                //  Send event when field is added to the form
                this.hookChannel.trigger('field:add', this, field);

                if (ifFieldIsInFieldset) {

                    var fieldset = this.get(field.get('subFormParent'));
                    fieldset.addField(field);

                }

                if (scrollToBottom){
                    var scrollArea = $(".slimScrollDiv #scrollSection");
                    var lastItemofScrollArea = scrollArea.find('div.dropField:last');

                    if (lastItemofScrollArea.offset()){
                        scrollArea.animate({
                            scrollTop: lastItemofScrollArea.offset().top + lastItemofScrollArea.outerHeight(true)
                        }, 500);
                    }
                }

                return field.get('id');
            }
        },

        /**
         * Add a field on the form collection
         *
         * @param {string} nameType
         * @param {object} properties
         * @param {boolean} isUnderFieldset
         */
        addElement: function (nameType, properties, isUnderFieldset) {
            var field = properties || {};
            //  We check if the field name is the default name or not (if a form was imported the name can be different but can't be modified)
            field['name']  = field['name'] == 'Field' ? 'Field' + this.getSize() : field['name'];
            field['order'] = this.getSize();

            //
            //  We add a new file is un the collection
            //  addField return new added field id
            //  addElement return so this id
            //

            return this.addField(new Fields[nameType](field), isUnderFieldset);
        },

        /**
         * Add a new field on the form collection
         *
         * @param {string} nameType
         * @param {object} properties
         * @param {boolean} isUnderFieldset
         */
        addNewElement: function (nameType, properties, isUnderFieldset) {
            var field = properties || {};
            field['name']  = field['name'] == 'Field' ? 'Field' + this.getSize() : field['name'];
            field['order'] = this.getSize();

            return this.addField(new Fields[nameType](field), isUnderFieldset, true);
        },

        /**
         * Remove sub field from a subForm
         *
         * @param subFormId sub form to remove id
         */
        destroySubElement : function(subFormId) {
            console.log("04 ---------------------");
            console.log(this.map);
            this.map(function(model, idx) {
                console.log("11 ---------------------");
                console.log(model);
                console.log("41 ---------------------");
                console.log(subFormId);
                console.log("23 ---------------------");
                console.log(idx);
                if (model.get('subFormParent') == subFormId) {
                    console.log("37 ---------------------");
                    console.log("triggered destroy !");
                    model.trigger('destroy', model);
                }
            })
        },

        /**
         * Remove element from collection
         *
         * @param  {integer} id model to remove id
         */
        removeElement : function(id) {
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

                console.log("98 -----------------");
                console.log(item);
                //  We used trigger instead destroy method, the DELETE ajax request is not send
                item.trigger('destroy', item);
            }

            if (this.id > 0)
                this.fieldstodelete.push(id);
        },

        /**
         * Update collection : create field and fieldset from JSON data
         *
         * @param  {object} JSONUpdate JSON data
         */
        updateWithJSON : function(JSONUpdate) {
            this.JSONUpdate = JSONUpdate;
            //  Update form attribute
            this.updateCollectionAttributes(JSONUpdate);

            this.createFieldsets();
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
         * Create a new field with properties in parameter
         *
         * @param {array} newFieldProperties properties array
         */
        createFieldWithJSON : function(newFieldProperties) {
            return new Fields[newFieldProperties['type'] + 'Field'](newFieldProperties);
        },

        /**
         * Update collection attributes
         *
         * @param  {Object} JSONUpdate JSON data
         */
        updateCollectionAttributes : function(JSONUpdate) {

            this.id                   = JSONUpdate['id'] !== undefined ? JSONUpdate['id'] : this.id;
            this.name                 = JSONUpdate["name"];

            this.descriptionFr        = JSONUpdate["descriptionFr"];
            this.descriptionEn        = JSONUpdate["descriptionEn"];

            this.keywordsFr           = JSONUpdate["keywordsFr"];
            this.keywordsEn           = JSONUpdate["keywordsEn"];

            this.labelFr              = JSONUpdate["labelFr"];
            this.labelEn              = JSONUpdate["labelEn"];

            this.tag                  = JSONUpdate["tag"];

            this.obsolete             = JSONUpdate["obsolete"];
            this.isTemplate           = JSONUpdate["isTemplate"];
        },

        /**
         * Create fieldset and sub field from JSON data
         *
         * @param  {Object} JSONUpdate JSON data
         */
        createFieldsets : function() {

            if (this.JSONUpdate['fieldsets'].length > 0) {

                var fieldset = {
                    legend   : this.JSONUpdate['fieldsets'][0]['legend'],
                    fields   : this.JSONUpdate['fieldsets'][0]['fields'],
                    multiple : this.JSONUpdate['fieldsets'][0]['multiple']
                };

                var subFormID = this.addElement('SubformField', fieldset, false);

                _.each(fieldset['fields'], _.bind(function(el, idx) {
                    this.JSONUpdate['schema'][ el ]['subFormParent']   = subFormID;
                    this.JSONUpdate['schema'][ el ]['isUnderFieldset'] = true;
                }, this));

                this.JSONUpdate['fieldsets'].shift();
            } else {

                //  All fieldset was been added, now we can add field
                if (_.size(this.JSONUpdate["schema"]) > 0) {
                    // Create all fields
                    this.createFieldFromSchema(this.JSONUpdate);
                }
            }
        },

        /**
         * Create all field from JSON schema
         *
         * @param  {Object} JSONUpdate JSON data
         */
        createFieldFromSchema : function(JSONUpdate) {

            this.schema = [];

            //  Convert current schema object in array
            //  We need to convert it in array for sort it by field order
            _.each(JSONUpdate["schema"], _.bind(function(element, index) {
                if (element.type == 'Checkboxes') {
                    element.type = 'CheckBox';
                }
                this.schema.push(element);
            }, this));

            this.schema = _.sortBy(this.schema, function(el) {
                return el.order;
            });

            //  When we add the field on the collection, the form panel listen the event and get the adapted view with requireJS
            //  According to the view weight, the views can be created in a wrong order
            //
            //  E.G : we have a text field and a long text, the text in first and the long at the end
            //  If the requireJS request is too long the Long text could be created before the text
            //
            //  So i create a minimal queue with backbone event
            //  When the view is rendered the formPanelView send an event to the collection "Ok next field" and we add the next field in the collection

            this.nextField();

            //  Now we wait the formPanelview next event
        },

        /**
         * Add the next field on the collection
         */
        nextField : function() {
            if (this.schema != undefined && this.schema.length > 0) {

                var firstFieldToAdd = this.schema[0];

                if (this.isAValidFieldType(firstFieldToAdd.type)) {
                    this.addField( this.createFieldWithJSON(firstFieldToAdd), firstFieldToAdd['isUnderFieldset']);
                }

                this.schema.shift();
            } else {
                this.formChannel.trigger('collectionUpdateFinished');
            }
        },

        /**
         * Return collection attributes values
         * @return {[Object} attributes values
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

            _.each(this.models, function(el, idx) {
                if (el.constructor.type != undefined && el.get('id') != modelID) {
                    fieldsList.push(el.get('name'))
                }
            })

            return fieldsList;
        },

        /**
         * Save collection, send POST or PUT request to the back
         */
        save : function() {
            if (!this.formChannel)
                this.initFormChannel();
            var PostOrPut = this.id > 0 ? 'PUT' : 'POST';
            var url = this.id > 0 ? (this.url + '/' + this.id) : this.url;
            var that = this;
            var savedFieldsToDelete = this.fieldstodelete;
            this.fieldstodelete = [];
            $.ajax({
                data        : JSON.stringify(this.getJSON()),
                type        : PostOrPut,
                url         : url,
                contentType : 'application/json',
                //  If you run the server and the back separately but on the same server you need to use crossDomain option
                //  The server is already configured to used it
                crossDomain : true,

                //  Trigger event with ajax result on the formView
                success: _.bind(function(data) {
                    this.id = data.form.id;
                    var savedid = this.id;
                    if (data.form.schema) {
                        $.each(data.form.schema, function (index, inputVal) {
                            $.each(that.models, function (modelindex, modelinputVal) {
                                if (modelinputVal.attributes.name == index) {
                                    that.models[modelindex].attributes.id = inputVal.id;
                                }
                            });
                        });
                    }
                    $.each(savedFieldsToDelete, function(index, inputVal) {
                        $.ajax({
                            data: {},
                            type: 'DELETE',
                            url: that.url + "/" + savedid + "/field/" + inputVal,
                            contentType: 'application/json',
                            crossDomain: true,
                            success: _.bind(function (data) {
                                this.formChannel.trigger('save:success');
                            }, this),
                            error: _.bind(function (xhr, ajaxOptions, thrownError) {
                                this.fieldstodelete.push(inputVal);
                                this.formChannel.trigger('save:fail');
                            }, this)
                        });
                    });
                    if (this.fieldstodelete.length == 0){
                        this.formChannel.trigger('save:success');
                    }
                }, this),
                error: _.bind(function(xhr, ajaxOptions, thrownError) {
                    this.formChannel.trigger('save:fail');
                }, this)
            });
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
        }
    });

    return Form;

});
