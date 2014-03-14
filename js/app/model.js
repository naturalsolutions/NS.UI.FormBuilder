/**
 * @fileOverview model.js
 * This file implements all field models
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
$(document).ready(function() {

    app = {};

    /**
     * Basic field model, it's only used for inheritance
     */
    app.BaseField       = Backbone.Model.extend({
        defaults: {
            id          : "basefield",
            label       : "My label",
            name        : "basefield",
            cssclass    : "",
            required    : false,
            order       : 1
        },
        initialize: function() {},
        getXML: function() {
            var xml = "", obj = this;
            _.each(['id', 'label', 'name', 'required', 'order', 'cssclass'], function(el) {
                xml += '<' + el + '>' + obj.get(el) + '</' + el + '>';
            });
            return xml;
        }
    });

    app.TextField       = app.BaseField.extend({
        defaults: {
            value       : "",
            placeholder : "Write some text",
            size        : 255
        },
        initialize: function() {},
        getXML: function() {
            var xml =   app.BaseField.prototype.getXML.apply(this, arguments);
            xml     += '<value>'        + this.get('value')         + '</value>';
            xml     += '<placeholder>'  + this.get('placeholder')   + '</placeholder>';
            xml     += '<size>'         + this.get('size')          + '</size>';
            return xml;
        }
    }, {
        type    : "text",
        xmlTag  : 'field_text'
    });

    app.OptionsField    = app.BaseField.extend({
        defaults: {
            options: []
        },
        initialize: function() {},
        addOption : function(lab, val, select) {
            this.get('options').push({
                label   : lab,
                value   : val,
                selected: select
            });
            this.trigger('change');
        },
        removeOption: function(index) {
            this.get('options').splice(index, 1);
            this.trigger('change');
        },
        updateSelectedOption: function(index, select) {
            _.each (this.get('options'), function(el, idx) {
                el['selected'] = false;
            });
            this.get('options')[index]['selected'] = select;
        },
        updateOption : function(index, lab, val, select) {
          this.get('options')[index] = {
              label     : lab,
              value     : val,
              selected  : select
          };
          this.trigger('change');
        },
        getOption : function(index) {
            return this.get('options')[index];
        },
        getXML: function() {
            var xml =   app.BaseField.prototype.getXML.apply(this, arguments);
            var tag = this.constructor.subTag;
            _.each(this.get('options'), function(el) {
                xml += '<' + tag + '>';
                xml += '<label>'    + el["label"]    + '</label>';
                xml += '<value>'    + el["value"]    + '</value>';
                xml += '<selected>' + el["selected"] + '</selected>';
                xml += '</' + tag + '>';
            });
            return xml;
        }
    }, {
        type    : 'options',
        xmlTag  : 'field_select',
        subTag  : 'option'
    });

    app.CheckBoxField   = app.OptionsField.extend({
        getXML: function() {
            var xml =   app.OptionsField.prototype.getXML.apply(this, arguments);
            return xml;
        },
        updateSelectedOption : function(index, select) {
            this.get('options')[index]['selected'] = select;
        }
    }, {
        type    : 'checkbox',
        xmlTag  : 'field_checkbox',
        subTag  : 'checkbox'
    });

    app.RadioField      = app.OptionsField.extend({
        getXML: function() {
            var xml =   app.OptionsField.prototype.getXML.apply(this, arguments);
            return xml;
        },
        updateSelectedOption : function(index, select) {
            this.get('options')[index]['selected'] = select;
        }
    }, {
        type    : 'radio',
        xmlTag  : 'field_radio',
        subTag  : 'radio'
    });

    //  Copy Basefield properties to model who extends it
    _.defaults(app.TextField.prototype.defaults,        app.BaseField.prototype.defaults);
    _.defaults(app.OptionsField.prototype.defaults,     app.BaseField.prototype.defaults);
    _.defaults(app.RadioField.prototype.defaults,       app.BaseField.prototype.defaults);
    _.defaults(app.CheckBoxField.prototype.defaults,    app.BaseField.prototype.defaults);

    app.DateField       = app.TextField.extend({
        defaults: {
            format: "dd/mm/yyyy"
        },
        initialize: function() {},
        getXML: function() {
            var xml =   app.TextField.prototype.getXML.apply(this, arguments);
            xml += '<format>' + this.get("format") + '</format>';
            return xml;
        }
    }, {
        type: "date",
        xmlTag: 'field_date'
    });

    app.NumericField    = app.TextField.extend({
        defaults: {
            minValue    : 0,
            maxValue    : 100,
            step        : 1
        },
        initialize : function() {},
        getXML : function() {
            var xml =   app.TextField.prototype.getXML.apply(this, arguments);
            xml += '<min>' + this.get("minValue") + '</min>';
            xml += '<max>' + this.get("maxValue") + '</max>';
            xml += '<step>' + this.get("step") + '</step>';
            return xml;
        }
    }, {
        type: 'numeric',
        xmlTag: 'field_numeric'
    });

    app.LongTextField = app.TextField.extend({
        defaults: {
            resizable: false
        },
        initialize : function() {},
        getXML : function() {
            var xml =   app.TextField.prototype.getXML.apply(this, arguments);
            xml += '<resizable>' + this.get("resizable") + '</resizable>';
            return xml;
        }
    }, {
        type: 'longText',
        xmlTag: 'field_longText'
    });

    //  Copy Textfield properties to model who extends it
    _.defaults(app.NumericField.prototype.defaults,     app.TextField.prototype.defaults);
    _.defaults(app.DateField.prototype.defaults,        app.TextField.prototype.defaults);
    _.defaults(app.LongTextField.prototype.defaults,    app.TextField.prototype.defaults);

});