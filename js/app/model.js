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
    formBuild.BaseField = Backbone.Model.extend({
        defaults: {
            id: "",
            label: "My label",
            name: {
                label: {
                    value: "",
                    lang: "en"
                },
                displayLabel: ""
            },
            required: false,
            readOnly: false
        },
        initialize: function() {
        },
        getXML: function() {
            return  "<label>" + this.get('label') + '</label>' +
                    "<name>" +
                    "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                    "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                    "</name>" +
                    "<required>" + this.get('required') + '</required>' +
                    "<readOnly>" + this.get('readOnly') + '</readOnly>';
        }
    });

    formBuilder.HorizontalLine = Backbone.Model.extend({
        defaults: {
            order: 1
        },
        getXML: function() {
            return '<order>' + this.get('order') + '</order>';
        }
    }, {
        type: 'hr',
        xmlTag: 'field_horizontalLine'
    });

    formBuild.HiddenField = Backbone.Model.extend({
        defaults: {
            id: 1,
            name: {
                label: {
                    value: "",
                    lang: "en"
                },
                displayLabel: ""
            },
            defaultValue: ""
        },
        getXML: function() {
            return  "<name>" +
                    "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                    "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                    "</name>" +
                    "<value>" + this.get('value') + '</value>';
        }
    }, {
        type: 'hidden',
        xmlTag: 'field_hidden'
    });

    formBuild.TextField = formBuild.BaseField.extend({
        defaults: {
            defaultValue: "",
            hint        : "Write some text",
            size        : 255
        },
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
            xml += '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                    '<hint>' + this.get('hint') + '</hint>' +
                    '<size>' + this.get('size') + '</size>';
            return xml;
        }
    }, {
        type: "text",
        xmlTag: 'field_text'
    });

    formBuild.EnumerationField = formBuild.BaseField.extend({
        defaults: {
            options: [],
            defaultValue: 0
        },
        addOption: function(lab, val, select) {
            this.get('options').push({
                label: lab,
                value: val
            });
            this.set('defaultValue', select);
            this.trigger('change');
        },
        removeOption: function(index) {
            this.get('options').splice(index, 1);
            this.trigger('change');
        },
        updateSelectedOption: function(select) {
            this.set('defaultValue', select);
        },
        updateOption: function(index, lab, val) {
            this.get('options')[index] = {
                label: lab,
                value: val
            };
            this.trigger('change');
        },
        getOption: function(index) {
            return this.get('options')[index];
        },
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments) + '<defaultValue>' + this.get('defaultValue') + '</defaultValue>';
            _.each(this.get('options'), function(el) {
                xml +=  '<option>' +
                        '   <label>' + el["label"] + '</label>' +
                        '   <value>' + el["value"] + '</value>' +
                        '</option>';
            });
            return xml;
        }
    }, {
        type: 'options',
        xmlTag: 'field_enum'
    });

    formBuild.CheckBoxField = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        }
    }, {
        type: 'checkbox',
        xmlTag: 'field_checkbox',
    });

    formBuild.RadioField = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        }
    }, {
        type: 'radio',
        xmlTag: 'field_radio'
    });

    formBuild.SelectField = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        }
    }, {
        type: 'select',
        xmlTag: 'field_select'
    });

    //  Copy Basefield properties to model who extends it
    _.defaults(formBuild.TextField.prototype.defaults,          formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.EnumerationField.prototype.defaults,   formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.RadioField.prototype.defaults,         formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.CheckBoxField.prototype.defaults,      formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.SelectField.prototype.defaults,        formBuild.EnumerationField.prototype.defaults);

    formBuild.DateField = formBuild.TextField.extend({
        defaults: {
            format: "dd/mm/yyyy"
        },
        getXML: function() {
            return formBuild.TextField.prototype.getXML.apply(this, arguments) + '<format>' + this.get("format") + '</format>';
        }
    }, {
        type: "date",
        xmlTag: 'field_date'
    });

    formBuild.NumericField = formBuild.TextField.extend({
        defaults: {
            minValue: 0,
            maxValue: 100,
            step: 1
        },
        getXML: function() {
            return  formBuild.TextField.prototype.getXML.apply(this, arguments) +
                    '<min>' + this.get("minValue") + '</min>' +
                    '<max>' + this.get("maxValue") + '</max>' +
                    '<step>' + this.get("step") + '</step>';
        }
    }, {
        type: 'numeric',
        xmlTag: 'field_numeric'
    });

    formBuild.LongTextField = formBuild.TextField.extend({
        defaults: {
            resizable: false
        },
        getXML: function() {
            return formBuild.TextField.prototype.getXML.apply(this, arguments) + '<resizable>' + this.get("resizable") + '</resizable>';
        }
    }, {
        type: 'longText',
        xmlTag: 'field_longText'
    });

    //  Copy Textfield properties to model who extends it
    _.defaults(formBuild.NumericField.prototype.defaults,   formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.DateField.prototype.defaults,      formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.LongTextField.prototype.defaults,  formBuild.TextField.prototype.defaults);

    return formBuild;

})(formBuilder);