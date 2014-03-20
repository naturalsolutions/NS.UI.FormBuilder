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
var formBuilder = (function(formBuild) {

    /**
     * Basic field model, it's only used for inheritance
     */
    formBuild.BaseField  = Backbone.Model.extend({
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

    formBuild.TextField = formBuild.BaseField.extend({
        defaults: {
            value       : "",
            placeholder : "Write some text",
            size        : 255
        },
        initialize: function() {},
        getXML: function() {
            var xml =   formBuild.BaseField.prototype.getXML.apply(this, arguments);
            xml     += '<value>'        + this.get('value')         + '</value>';
            xml     += '<placeholder>'  + this.get('placeholder')   + '</placeholder>';
            xml     += '<size>'         + this.get('size')          + '</size>';
            return xml;
        }
    }, {
        type    : "text",
        xmlTag  : 'field_text'
    });

    formBuild.OptionsField  = formBuild.BaseField.extend({
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
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
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

    formBuild.CheckBoxField = formBuild.OptionsField.extend({
        getXML: function() {
            var xml =   formBuild.OptionsField.prototype.getXML.apply(this, arguments);
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

    formBuild.RadioField  = formBuild.OptionsField.extend({
        getXML: function() {
            var xml =   formBuild.OptionsField.prototype.getXML.apply(this, arguments);
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
    _.defaults(formBuild.TextField.prototype.defaults,        formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.OptionsField.prototype.defaults,     formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.RadioField.prototype.defaults,       formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.CheckBoxField.prototype.defaults,    formBuild.BaseField.prototype.defaults);

    formBuild.DateField       = formBuild.TextField.extend({
        defaults: {
            format: "dd/mm/yyyy"
        },
        initialize: function() {},
        getXML: function() {
            var xml =   formBuild.TextField.prototype.getXML.apply(this, arguments);
            xml += '<format>' + this.get("format") + '</format>';
            return xml;
        }
    }, {
        type: "date",
        xmlTag: 'field_date'
    });

    formBuild.NumericField    = formBuild.TextField.extend({
        defaults: {
            minValue    : 0,
            maxValue    : 100,
            step        : 1
        },
        initialize : function() {},
        getXML : function() {
            var xml =   formBuild.TextField.prototype.getXML.apply(this, arguments);
            xml += '<min>' + this.get("minValue") + '</min>';
            xml += '<max>' + this.get("maxValue") + '</max>';
            xml += '<step>' + this.get("step") + '</step>';
            return xml;
        }
    }, {
        type: 'numeric',
        xmlTag: 'field_numeric'
    });

    formBuild.LongTextField = formBuild.TextField.extend({
        defaults: {
            resizable: false
        },
        initialize : function() {},
        getXML : function() {
            var xml =   formBuild.TextField.prototype.getXML.apply(this, arguments);
            xml += '<resizable>' + this.get("resizable") + '</resizable>';
            return xml;
        }
    }, {
        type: 'longText',
        xmlTag: 'field_longText'
    });

    //  Copy Textfield properties to model who extends it
    _.defaults(formBuild.NumericField.prototype.defaults,     formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.DateField.prototype.defaults,        formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.LongTextField.prototype.defaults,    formBuild.TextField.prototype.defaults);

    return formBuild;

})(formBuilder);