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
$(document).ready(function() {
    app.Form = Backbone.Collection.extend({
        model: app.BaseField,
        initialize: function(models, options) {
            this.name           = options.name || 'My form';
            _.bindAll(this, 'updateWithXml');
        },
        getSize : function() {
            return this.models.length;
        },
        getXML: function() {
            var arr     = this.models.slice(1, this.models.length);
            var xml     = $.parseXML('<?xml version="1.0" ?><form id="test attribute"   xmlns="http://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3schools.com note.xsd"></form>');
            var xmlDoc  = $(xml);

            xmlDoc.find('form').append('<name>' + this.name + '</name>');
            xmlDoc.find('form').append("<fields></fields>");

            _.each(arr, function(el, idx) {
                xmlDoc.find('fields').append( '<' + el.constructor.xmlTag + '>' + el.getXML() + '</' + el.constructor.xmlTag + '>');
            });

            return (new XMLSerializer()).serializeToString(xml);
        },
        validateXML: function(xmlContent) {
            var result = "aa", form = this;
            $.ajax({
                url         : 'xml/NS_Schema.xsd',
                dataType    : 'html',
                async       : false,
            }).done(function(data) {
                var Module = {
                    xml         : xmlContent,
                    schema      : data,
                    arguments   : ["--noout", "--schema", 'NS_Schema.xsd', 'output.xml']
                };
                var xmllint = validateXML(Module);
                if (xmllint.indexOf('validates') > 0) {
                    form.reset();
                    form.updateWithXml(xmlContent);
                    result = true;
                } else {
                    var split = xmllint.split(':');
                    result = {
                        error   : split[3],
                        element : split[2],
                        message : split[split.length - 1].split('.', 1)[0]
                    };
                }
            }).error(function( jqXHR, textStatus, errorThrown) {
                throw errorThrown.message;
            });
            return result;
        },
        updateWithXml: function(content) {
            this.reset();
            var xmlDoc          = $.parseXML(content),
                xml             = $(xmlDoc),
                form            = this,
                elements        = null,
                elements        = new Array();
            this.name           = xml.find('form').find('name').first().text();

            xml.find('form').find('fields').children().each( function(idx, el) {

                var array = {
                    id          : $(el).find('id').text(),
                    name        : $(el).find('name').text(),
                    label       : $(el).find('label').first().text(),
                    required    : $(el).find('required').text(),
                    cssclass    : $(el).find('cssclass').text(),
                    order       : $(el).find('order').text()
                }, element = null;

                switch ($(el).prop('tagName')) {
                    case 'field_text':
                        element = new app.TextField({
                            value       : $(el).find('value').text(),
                            size        : $(el).find('size').text(),
                            placeholder : $(el).find('placeholder').text()
                        });
                        break;
                    case 'field_date':
                        element = new app.DateField({
                            value       : $(el).find('value').text(),
                            size        : $(el).find('size').text(),
                            placeholder : $(el).find('placeholder').text(),
                            format      : $(el).find('format').text(),
                        });
                        break;
                    case 'field_longText':
                        element = new app.LongTextField({
                            value       : $(el).find('value').text(),
                            size        : $(el).find('size').text(),
                            placeholder : $(el).find('placeholder').text(),
                            resizable   : $(el).find('resizable').text()
                        });
                        break;
                    case 'field_numeric':
                        element = new app.NumericField({
                            value       : $(el).find('value').text(),
                            size        : $(el).find('size').text(),
                            placeholder : $(el).find('placeholder').text(),
                            min         : $(el).find('min').text(),
                            max         : $(el).find('max').text(),
                            step        : $(el).find('step').text()
                        });
                        break;
                    case 'field_checkbox':
                        var checkbox = [];
                        $(el).find('checkbox').each( function(index, each) {
                           checkbox.push({
                               label    : $(each).find('label').text(),
                               value    : $(each).find('value').text(),
                               selected : $(each).find('selected').text()
                           });
                        });
                        element = new app.CheckBoxField({
                            checkboxs: checkbox
                        });
                        break;
                    case 'field_select':
                        var options = [];
                        $(el).find('option').each( function(index, each) {
                           options.push({
                               label    : $(each).find('label').text(),
                               value    : $(each).find('value').text(),
                               selected : $(each).find('selected').text()
                           });
                        });
                        element = new app.OptionsField({
                            select: options
                        });
                        break;
                    case 'field_radio':
                        var radios = [];
                        $(el).find('radio').each( function(index, each) {
                           radios.push({
                               label    : $(each).find('label').text(),
                               value    : $(each).find('value').text(),
                               selected : $(each).find('selected').text()
                           });
                        });
                        element = new app.RadioField({
                            radio: radios
                        });
                        break;
                }
                if (element !== null) {
                    element.set(array);
                    elements.push (element);
                }
            });
            elements.sort(function(a, b) {
                return parseInt(a.get('order')) - parseInt(b.get('order'));
            });
            _.each(elements, function(el, idx) {
                form.add(el)
            });
        }
    });
});