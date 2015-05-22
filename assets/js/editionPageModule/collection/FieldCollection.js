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
    'backbone',
    '../models/fields',
    'backbone.radio',
    '../../Translater'
], function (Backbone, Fields, Radio, Translater) {

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var pillboxTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <p class="help-block" data-error></p>\
            <div data-editor >\
                <div data-initialize="pillbox" class="pillbox" id="pillbox<%= key %>">\
                    <ul class="clearfix pill-group" id="pillbox<%= key %>List">\
                        <li class="pillbox-input-wrap btn-group">\
                            <a class="pillbox-more">and <span class="pillbox-more-count"></span> more...</a>\
                            <input type="text" class="form-control dropdown-toggle pillbox-add-item" placeholder="add item">\
                            <button type="button" class="dropdown-toggle sr-only">\
                                <span class="caret"></span>\
                                <span class="sr-only">Toggle Dropdown</span>\
                            </button>\
                            <ul class="suggest dropdown-menu" role="menu" data-toggle="dropdown" data-flip="auto"></ul>\
                        </li>\
                    </ul>\
                </div>\
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
        schema : {
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
                type        : 'Text',
                title       : translater.getValueFromKey('form.keywords.fr'),
                editorClass : 'form-control hide',
                template    : pillboxTemplate
            },
            keywordsEn : {
                type        : 'Text',
                title       : translater.getValueFromKey('form.keywords.en'),
                editorClass : 'form-control hide',
                template    : pillboxTemplate
            }
        },

        /**
        * Init form collection
        *
        * @param {type} models
        * @param {type} options
        */
        initialize: function (models, options) {
            this.count       = 0;

            this.url = options.url;

            this.id            = options.id || 0;
            this.name          = options.name           || 'My form';
            this.descriptionFr = options.descriptionFr  || "";
            this.descriptionEn = options.descriptionEn  || "";
            this.keywordsFr    = options.keywordsFr     || ["formulaire"];
            this.keywordsEn    = options.keywordsEn     || ["form"];
            this.labelFr       = options.labelFr        || "";
            this.labelEn       = options.labelEn        || "";
            this.tag           = "";

            //  Bind
            _.bindAll(this, 'clearAll', 'getSize', 'addElement', 'getJSON', 'getJSONFromModel', 'removeElement');

            this.initFormChannel();
        },

        /**
         * Init form channel
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            this.formChannel.on('remove', this.removeElement);

            //  Event send by BaseView or BaseView herited view for duplicate model
            this.formChannel.on('copyModel', this.copyModel, this);
        },

        /**
         * Duplicate model in the collection
         *
         * @param modelToCloneID model to duplicate ID
         */
        copyModel : function(modelToCloneID) {
            var originModel = this.at(modelToCloneID),
                nameType    = originModel.constructor.type + 'Field'

            this.addElement(nameType, _.omit(originModel.attributes, 'id'));
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
            var fieldset = {
                legend: model.get('legend'),
                fields: []
            };

            _.each(model.get('fields'), function (el, idx) {
                fieldset['fields'].push(el.get('name'));
            });

            return fieldset;
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

                case 'Radio':
                case 'CheckBox':
                case 'Select':
                    subModel['options'] = $.map(model.get('itemList')['items'], function (item) {
                        return {
                            val: item['value'],
                            label: item['en']
                        }
                    });
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

            return json;
        },

        addField : function(field, ifFieldIsInFieldset) {
            if (this.isAValidFieldType(field.constructor.type)) {

                //  Update field
                field.set('isUnderFieldset', ifFieldIsInFieldset !== undefined ? ifFieldIsInFieldset : false);
                field.set('id', this.getSize());
                //  Add it
                this.add(field);

            }
        },

        /**
         * Add a new field on the form collection
         *
         * @param {string} nameType
         * @param {object} properties
         * @param {boolean} isUnderFieldset
         */
        addElement: function (nameType, properties, isUnderFieldset) {

            field = properties || {};

            field['id']   = this.getSize();
            field['name'] = 'Field' + this.getSize();

            //  Add field
            this.addField(new Fields[nameType](field), isUnderFieldset);
        },

        /**
         * Remove element from collection
         *
         * @param  {integer} id model to remove id
         */
        removeElement : function(id) {
            var item = this.get(id);
            this.remove( item );
        },

        /**
         * Update collection : create field and fieldset from JSON data
         *
         * @param  {object} JSONUpdate JSON data
         */
        updateWithJSON : function(JSONUpdate) {

            var fn = _.bind(function(JSONUpdate, callback) {

                //  Update form attribute
                this.updateCollectionAttributes(JSONUpdate);

                // Create fieldsets but empty
                this.createFieldsets(JSONUpdate);

                // Create all fields
                this.createFieldFromSchema(JSONUpdate);

                callback();
            }, this);

            fn(JSONUpdate, _.bind(function() {
                this.formChannel.trigger('updateFinished');
            }, this));

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

            var fieldTmpProperties = _.pick(newFieldProperties, 'title', 'help', 'editorClass', 'fieldClass', 'labelFr', 'labelEn', 'name', 'required', 'readonly');

            return new Fields[newFieldProperties['type'] + 'Field'](fieldTmpProperties);
        },

        /**
         * Update collection attributes
         *
         * @param  {Object} JSONUpdate JSON data
         */
        updateCollectionAttributes : function(JSONUpdate) {

            this.id            = JSONUpdate['id'] !== undefined ? JSONUpdate['id'] : this.id;
            this.name          = JSONUpdate["name"];

            this.descriptionFr = JSONUpdate["descriptionFr"];
            this.descriptionEn = JSONUpdate["descriptionEn"];

            this.keywordsFr    = JSONUpdate["keywordsFr"];
            this.keywordsEn    = JSONUpdate["keywordsEn"];

            this.labelFr       = JSONUpdate["labelFr"];
            this.labelEn       = JSONUpdate["labelEn"];

            this.tag           = JSONUpdate["tag"];
        },

        /**
         * Create fieldset and sub field from JSON data
         *
         * @param  {Object} JSONUpdate JSON data
         */
        createFieldsets : function(JSONUpdate) {

            var field = null, currentField = null;

            _.each(JSONUpdate['fieldsets'], _.bind(function (el, idx) {

                field = {
                    legend: el['legend'],
                    fields: []
                };

                //  Add all fields for the current fieldset
                _.each(el["fields"], _.bind(function (name, index) {

                    currentField = JSONUpdate['schema'][name];

                    if (this.isAValidFieldType( currentField['type'] )) {
                        field.fields.push( this.createFieldWithJSON(currentField) );
                    }

                }, this));

                //  Create subFormField
                this.addElement('SubformField', field, false);

            }, this));
        },

        /**
         * Create all field from JSON schema
         *
         * @param  {Object} JSONUpdate JSON data
         */
        createFieldFromSchema : function(JSONUpdate) {

            var fieldset = [],
                schema = [];

            _.each(JSONUpdate['fieldsets'], function (el, idx) {
                fieldset = fieldset.concat(el["fields"]);
            });

            //  Convert current schema object in array
            //  We need to convert it in array for sort it by field order
            _.each(JSONUpdate["schema"], function(element, index) {
                schema.push(element);
            });

            schema = _.sortBy(schema, "order");

            _.each(schema, _.bind(function (el, idx) {
                //  Add new field
                if (this.isAValidFieldType(el['type'])) {
                    this.addField(
                        this.createFieldWithJSON(el),
                        _.contains(fieldset, el.name)
                    );
                }
            }, this));
        },

        /**
         * Return collection attributes values
         * @return {[Object} attributes values
         */
        getAttributesValues : function() {
            return _.pick(this, _.keys(this.schema));
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


        save : function() {
            var PostOrPut = this.id > 0 ? 'PUT' : 'POST';
            var url = this.id > 0 ? (this.url + '/' + this.id) : this.url;

            $.ajax({
                data        : JSON.stringify(this.getJSON()),
                type        : PostOrPut,
                url         : url,
                contentType : 'application/json',
                //  If you run the server and the back separately but on the same server you need to use crossDomain option
                //  The server is already configured to used it
                crossDomain : true,

                //  Trigger event with ajax result on the formView
                success: _.bind(function() {
                    this.formChannel.trigger('save:success');
                }, this),
                error: _.bind(function() {
                    this.formChannel.trigger('save:fail');
                }, this)
            });
        }
    });

    return Form;

});
