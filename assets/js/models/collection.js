/**
 * @fileOverview collection.js
 *
 * Describe form model for the application
 * Inherited from Backbone collection
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['backbone', 'models/fields'], function(Backbone, Fields) {

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
        initialize: function(models, options) {
            this.name           = options.name || 'My form';
            this.count          = 0;
            this.description    = options.description || "";
            this.keywords       = options.keywords || ["protocol"];
            //  Bind
            _.bindAll(this, 'updateWithXML', 'clearAll', 'getSize', 'tagNameToClassName', 'addElement', 'addTableElement', 'getJSON', 'getJSONFromModel');
        },

        /**
         * Allow to arrange the collection through model id
         *
         * @param {formBuild.BaseModel} model  model
         * @returns {integer} comparaison between id
         */
        comparator: function(model) {
            return model.get(model.id);
        },

        /**
         * Return collection size
         * @returns {integer} collection size
         */
        getSize: function( ) {
            return this.length;
        },

        /**
         * Clear form collection
         */
        clearAll: function() {
            while (this.models.length > 0) {
                var el = this.at(this.models.length - 1);
                el.trigger('destroy', el);
            }
            this.count = 0;
        },

        getKeywords : function() {
          var xml = "";
          _.each(this.keywords, function(el, idx) {
              xml += '<keyword>' + el + '</keyword>';
          });
          return '<keywords>' + xml + '</keywords>';
        },

        /**
         * Extract XML code from models values
         * @returns {string} XML code
         */
        getXML: function() {
            var arr     = this.models.slice(1, this.models.length),
                xml     = $.parseXML('<?xml version="1.0" ?><form id="test attribute"   xmlns="http://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3schools.com note.xsd"></form>'),
                xmlDoc  = $(xml);

            xmlDoc.find('form').append(
                '<name>' + this.name + '</name><description>' + this.description + '</description>' + this.getKeywords() + '<fields></fields>'
            );
            this.sort();

            _.each(arr, function(el, idx) {
                if (el.get('isDragged') !== true) {
                    xmlDoc.find('fields').append(
                        '<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>'
                    );
                }
            });

            return (new XMLSerializer()).serializeToString(xml);
        },

        getJSONFromModel : function(model) {
            var subModel = { validators : [] };

            switch (model.constructor.type) {
                case 'Numeric' :
                    subModel['type'] = 'Number';
                    break;

                case 'LongText':
                    subModel['type'] = 'TextArea';
                    break;

                case 'Radio' :
                case 'CheckBox':
                case  'Select':
                    subModel['options'] = $.map(model.get('itemList')['items'], function(item) {
                        return  {
                            val : item['value'],
                            label : item['en']
                        }
                    });
                    subModel['type'] = (model.constructor.type === "CheckBox") ? 'Checkboxes' : model.constructor.type;
                    break;

                case 'Table':
                case 'Subform' : 
                    var item = null;
                    subModel['subSchema'] = {}
                    $.map(model.get('fields'), _.bind(function(field) {
                        subModel['subSchema'][(field.get('label') + field.get('id'))] = this.getJSONFromModel(field);

                    }, this));
                    subModel['type'] = 'Object';
                    break;

                default :
                    subModel['type'] = model.constructor.type;
                    break;
            }

            subModel['help'] = model.get('hint');
            subModel['title'] = model.get('title');
            if (model.get('required')) {
                subModel.validators.push('required');
            }
            return subModel;
        },

        getJSON : function() {
            var json = {}, subModel = null;
            json.name        = this.name;
            json.description = this.description;
            json.keywords    = this.keywords;
            json.schema = {};

            this.map( _.bind(function(model) {
                if (model.constructor.type != undefined && (!model.get('isDragged')) ) {

                    subModel = this.getJSONFromModel(model);

                    if (json.schema[model.get('label')] !== undefined) {
                        model.set('label', model.get('label') + model.get('id'));
                    }

                    json.schema[model.get('label')] = subModel;
                }
            }, this));

            return json;
        },

        /**
         *
         * @param {type} tag
         * @returns {unresolved}
         */
        tagNameToClassName: function(tag) {
            var split = tag.split('_');
            split[1] = split[1][0].toUpperCase() + split[1].slice(1);
            split[0] = split[0][0].toUpperCase() + split[0].slice(1);
            return split.reverse().join("");
        },

        /**
         * Add a new field on the form collection
         *
         * @param {type} element
         * @param {type} nameType
         * @returns {undefined}
         */
        addElement: function(nameType, properties) {
              var field   = properties || {};
              field['id'] = this.getSize();
              var el      = new Fields[nameType](field);

              this.add (el);
              this.trigger('newElement', el);
        },

        addTableElement : function(nameType) {
            var field   = properties || {};
            field['id'] = this.getSize();
            var el      = new Fields[nameType](field);

            this.add (el);
            return el;
        },

        /**
         * Update form with XML content
         *
         * @param {type} content
         * @param {type} name
         * @returns {undefined}
         */
        updateWithXML: function(content) {
            this.reset();
            var xmlDoc          = $.parseXML(content),
                fieldNameType   = "",
                form            = app.utilities.XmlToJson( $(xmlDoc).find('form') );

            _.each(form['fields'], _.bind(function(el, idx) {

                fieldNameType = this.tagNameToClassName(idx);
                if (el.length > 1) {
                    _.each(el, _.bind(function(subElement, subIndex) {
                        this.addElement(subElement, fieldNameType);
                    }, this));
                } else {
                    this.addElement(el, fieldNameType);
                }

            }, this));
        },

        addTableFieldFromJSON  : function(schema, name) {
            var fields = {}, subField = null;
            _.each(schema.subSchema, _.bind(function(el, idx){
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
              fields : fields
            })
        },

        updateWithJSON : function(content, name) {
          this.name        = name;
          this.description = content.description;
          this.keywords    = content.keywords;

          var tmpObject = null, field = null;
          _.each(content.schema, _.bind(function(el, idx){
            if (el.type === 'Object') {
                this.addTableFieldFromJSON(el, idx);
            } else {
                field = _.pick(el, 'help');
                field['label'] = idx;
                if (el.validators !== undefined && el.validators.length > 0) {
                    field['required'] = schema.validators['required'] !== undefined;
                    field['readonly'] = schema.validators['required'] !== undefined;
                }
                this.addElement( (el.type === 'TextArea' ? 'LongText' : el.type) + 'Field', field)
            }
          }, this));
        }

    });

    return Form;
})