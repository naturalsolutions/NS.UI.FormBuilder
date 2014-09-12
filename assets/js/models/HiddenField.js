define(['backbone'], function(Backbone) {

    var HiddenField = Backbone.Model.extend({
        defaults: {
            id: 0,
            name: {
                label: {
                    value: "field",
                    lang: "en"
                },
                displayLabel: "field"
            },
            value: ""
        },
        getSchemaProperty: function(index, property) {
            models.BaseField.prototype.getSchemaProperty.apply(this, arguments);
        },

        changePropertyValue: function(index, value) {
            models.BaseField.prototype.changePropertyValue.apply(this, arguments);
        },

        getXML: function() {
            return "<name>" +
                "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                "</name>" +
                "<value>" + this.get('value') + '</value>';
        }
    }, {
        type: 'Hidden',
        xmlTag: 'field_hidden',
        i18n: 'hidden',
        schema: {
            id: {
                type: "integer"
            },
            name: {
                type: "object",
                elements: {
                    label: {
                        type: "object",
                        elements: {
                            value: {
                                type: "string"
                            },
                            lang: {
                                type: "string"
                            }
                        }
                    },
                    displayLabel: {
                        type: "string"
                    }
                }
            },
            value: {
                type: "string"
            }
        }
    });

    return HiddenField;

});
