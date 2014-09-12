define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var TextField = BaseField.extend({

        defaults : function() {
            return _.extend(BaseField.prototype.defaults, {
                defaultValue : "",
                hint         : "Write some text",
                size         : 255,
                multiline    : false
            });
        },

        initialize: function(options) {
            BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml + '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                '<hint>' + this.get('hint') + '</hint>' +
                '<size>' + this.get('size') + '</size>' +
                '<multiline>' + this.get('multiline') + '</multiline>';
        }

    }, {

        type: "Text",
        xmlTag: 'field_text',
        i18n: 'text',
        schema: function() {
            return _.extend(BaseField.constructor.schema, {
                defaultValue: {
                    type: "string",
                    display: "Default value",
                    section: "advanced"
                },
                hint: {
                    type: "string"
                },
                size: {
                    type: "integer"
                }
            })
        }

    });

    return TextField;

});