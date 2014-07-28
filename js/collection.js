/**
 * @fileOverview collection.js
 * This file describ form collection model
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *                  model.js
 *                  xmllint
 *                  blod
 *                  FileSaver
 *                  NS_Schema.xsd
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

var formBuilder = (function(app) {
    
    /**
     * Implement form object as a fields collection
     */
    app.collections.Form = Backbone.Collection.extend({
        model: app.models.BaseField,

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
            _.bindAll(this, 'updateWithXml', 'clearAll', 'getSize', 'tagNameToClassName', 'addElement');
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
                xmlDoc.find('fields').append(
                    '<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>'
                );
            });

            return (new XMLSerializer()).serializeToString(xml);
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
        addElement: function(element, nameType) {
            var el = new app.models[nameType](element);
            if (el !== null) {
                this.add(el);
            }
        },
        
        /**
         * Update form with XML content
         * 
         * @param {type} content
         * @param {type} name
         * @returns {undefined}
         */
        updateWithXml: function(content, name) {
            this.reset();
            this.name = name;
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
        }
    
    });

    return app;
    
})(formBuilder);