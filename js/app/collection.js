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

var formBuilder = (function(formBuild) {


    /**
     * Implement form object as a fields collection
     */
    formBuild.Form = Backbone.Collection.extend({
        model: formBuild.BaseField,

        initialize: function(models, options) {
            this.name   = options.name || 'My form';
            this.count  = 0;
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

        /**
         * Extract XML code from models values
         * @returns {string} XML code
         */
        getXML: function() {
            var arr     = this.models.slice(1, this.models.length);
            var xml     = $.parseXML('<?xml version="1.0" ?><form id="test attribute"   xmlns="http://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3schools.com note.xsd"></form>');
            var xmlDoc  = $(xml);

            xmlDoc.find('form').append('<name>' + this.name + '</name>');
            xmlDoc.find('form').append("<fields></fields>");
            this.sort();

            _.each(arr, function(el, idx) {
                xmlDoc.find('fields').append('<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>');
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
        
        addElement: function(element, nameType) {
            var el = new formBuild[nameType](element);
            if (el !== null) {
                this.add(el);
            }
        },
        
        /**
         * 
         * @param {type} content
         * @returns {undefined}
         */
        updateWithXml: function(content) {
            this.reset();
            
            var xmlDoc = $.parseXML(content), element = null, fieldNameType = "", array = null;
            
            var form = $.xml2json(xmlDoc);
            delete form['xmlns'];
            delete form['xmlns:xsi'];
            delete form['xsi:schemaLocation'];
            
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

    return formBuild;

})(formBuilder);