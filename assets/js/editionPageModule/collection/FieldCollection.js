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
                title       : translater.getValueFromKey('form.tag'),
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

            this.name          = options.name           || 'My form';
            this.descriptionFr = options.descriptionFr  || "";
            this.descriptionEn = options.descriptionEn  || "";
            this.keywordsFr    = options.keywordsFr     || ["formulaire"];
            this.keywordsEn    = options.keywordsEn     || ["form"];
            this.labelFr       = options.labelFr        || "";
            this.labelEn       = options.labelEn        || "";
            this.tag           = options.tag            || "";

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
                tag           : this.tag,
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

        /**
        * Add a new field on the form collection
        *
        * @param {type} element
        * @param {type} nameType
        * @returns {undefined}
        */
        addElement: function (nameType, properties) {

            if (Fields[nameType] != undefined) {

                var field   = properties || {};
                field['id'] = this.getSize();

                var el      = new Fields[nameType](field);

                el.set('name', 'Field' + this.length)
                this.add(el);

                //  Send event
                this.trigger('newElement', el);
            }

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
         * Send a backbone event to the form view when update is done
         *
         * @param  {object} JSONUpdate JSON data
         */
        updateWithJSON: function (JSONUpdate) {

            // Update collection attributes
            this.updateCollectionAttributes(JSONUpdate);
            // Create field
            this.createFieldFromSchema(JSONUpdate);
            // Create fieldsets
            this.createFieldsets(JSONUpdate);

            // Send event when update is done
            this.formChannel.trigger('updateFinished');
        },

        /**
         * Update collection attributes
         *
         * @param  {Object} JSONUpdate JSON data
         */
        updateCollectionAttributes : function(JSONUpdate) {
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

            var field = null;

            _.each(JSONUpdate['fieldsets'], _.bind(function (el, idx) {

                field = {
                    legend: el['legend'],
                    fields: []
                };

                _.each(el["fields"], function (name, index) {
                    if (Fields[JSONUpdate['schema'][name]['type'] + 'Field'] !== undefined) {

                        field.fields.push(
                            new Fields[JSONUpdate['schema'][name]['type'] + 'Field']({
                                id          : field['fields'].length,
                                title       : JSONUpdate['schema'][name]['title'],
                                help        : JSONUpdate['schema'][name]['help'],
                                editorClass : JSONUpdate['schema'][name]['editorClass'],
                                fieldClass  : JSONUpdate['schema'][name]['fieldClass'],
                                required    : JSONUpdate['schema'][name]['validators']['required'] !== undefined,
                            })
                        );
                    }
                });

                this.addElement('SubformField', field);

            }, this));
        },

        /**
         * Create all field from JSON schema
         *
         * @param  {Object} JSONUpdate JSON data
         */
        createFieldFromSchema : function(JSONUpdate) {
            var field = null, fieldset = [];

            _.each(JSONUpdate['fieldsets'], function (el, idx) {
                fieldset = fieldset.concat(el["fields"]);
            });

            _.each(JSONUpdate["schema"], _.bind(function (el, idx) {

                //  Add field if it is not in the fieldset

                if (!_.contains(fieldset, idx)) {
                    field = _.pick(el, 'title', 'help', 'editorClass', 'fieldClass', 'labelFr', 'labelEn')
                    if (el["validators"] !== undefined && el["validators"].length > 0) {
                        field['required'] = el["validators"]['required'] !== undefined;
                        field['readonly'] = el["validators"]['required'] !== undefined;
                    }

                    //  Add the field to the collection
                    this.addElement((el['type']) + 'Field', field)
                }
                field = null;

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
        }

    });

    return Form;

});
