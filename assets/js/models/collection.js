/**
 * @fileOverview collection.js
 *
 * Describe form model for the application
 * Inherited from Backbone collection
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['backbone', 'models/fields'], function (Backbone, Fields) {

    /**
     * Implement form object as a fields collection
     */
    var Form = Backbone.Collection.extend({
        model: Fields.BaseField,

        /**
         * Init form collection
         *
         * @param {type} models
         * @param {type} options
         */
        initialize: function (models, options) {
            this.name = options.name || 'My form';
            this.count = 0;
            this.description = options.description || "";
            this.keywords = options.keywords || ["protocol"];
            //  Bind
            _.bindAll(this, 'clearAll', 'getSize', 'addElement', 'addTableElement', 'getJSON', 'getJSONFromModel');
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
            while (this.models.length > 0) {
                var el = this.at(this.models.length - 1);
                el.trigger('destroy', el);
            }
            this.count = 0;
        },

        getKeywords: function () {
            var xml = "";
            _.each(this.keywords, function (el, idx) {
                xml += '<keyword>' + el + '</keyword>';
            });
            return '<keywords>' + xml + '</keywords>';
        },

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

        getJSONFromModel: function (model) {
            var subModel = { validators: [] };

            switch (model.constructor.type) {
                case 'Numeric':
                    subModel['type'] = 'Number';
                    break;

                case 'LongText':
                    subModel['type'] = 'TextArea';
                    break;

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

                case 'Table':
                    var item = null;
                    subModel['subSchema'] = {}
                    $.map(model.get('fields'), _.bind(function (field) {
                        subModel['subSchema'][(field.get('label') + field.get('id'))] = this.getJSONFromModel(field);

                    }, this));
                    subModel['type'] = 'Object';
                    break;

                default:
                    subModel['type'] = model.constructor.type;
                    break;
            }

            subModel['help'] = model.get('hint');
            subModel['title'] = model.get('title');
            subModel['editorClass'] = model.get('editorClass');
            subModel['fieldClass'] = model.get('fieldClass');
            if (model.get('required')) {
                subModel.validators.push('required');
            }
            return subModel;
        },

        getJSON: function () {
            var json         = {}, subModel = null;
            json.name        = this.name;
            json.description = this.description;
            json.keywords    = this.keywords;
            json.schema      = {};
            json.fieldsets   = [];

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
            var field = properties || {};
            field['id'] = this.getSize();
            var el = new Fields[nameType](field);
            this.add(el);
            this.trigger('newElement', el);
        },

        addTableElement: function (nameType) {
            var field = properties || {};
            field['id'] = this.getSize();
            var el = new Fields[nameType](field);

            this.add(el);
            return el;
        },

        addTableFieldFromJSON: function (schema, name) {
            var fields = {}, subField = null;
            _.each(schema.subSchema, _.bind(function (el, idx) {
                subField = _.pick(el, 'help');
                if (el.validators.length > 0) {
                    subField['required'] = el.validators['required'] !== undefined;
                    subField['readonly'] = el.validators['required'] !== undefined;
                }
                subField['label'] = idx;
                subField['isDragged'] = true;
                subField.type = el.type === 'TextArea' ? 'LongText' : el.type;

                fields[idx] = subField;

            }, this))
            this.addElement('TableField', {
                fields: fields
            })
        },

        updateWithJSON: function (JSONUpdate) {
            this.name        = JSONUpdate["name"];
            this.description = JSONUpdate["description"];
            this.keywords    = JSONUpdate["keywords"];

            var field = null, fieldset = [];

            _.each(JSONUpdate['fieldsets'], function (el, idx) {
                fieldset = fieldset.concat(el["fields"]);
            });

            _.each(JSONUpdate["schema"], _.bind(function (el, idx) {

                //  Add field if it is not in the fieldset

                if (!_.contains(fieldset, idx)) {
                    field = _.pick(el, 'title', 'help', 'editorClass', 'fieldClass')
                    if (el["validators"] !== undefined && el["validators"].length > 0) {
                        field['required'] = el["validators"]['required'] !== undefined;
                        field['readonly'] = el["validators"]['required'] !== undefined;
                    }

                    //  Add the field to the collection
                    this.addElement((el.type === 'TextArea' ? 'LongText' : el.type) + 'Field', field)
                }
                field = null;


            }, this));

            //  Fieldset Section
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
        }

    });

    return Form;
})