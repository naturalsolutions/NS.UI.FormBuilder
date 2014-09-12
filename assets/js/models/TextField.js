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

        schema: function() {
            return _.extend(BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    display     : 'Default value',
                    fieldClass : 'advanced',
                    editorClass : 'span10'
                },
                hint: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                size: {
                    type: 'Number',
                    editorClass : 'span10'
                }
            })
        },

        initialize: function(options) {
            BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                            '<hint>'         + this.get('hint')         + '</hint>' +
                            '<size>'         + this.get('size')         + '</size>' +
                            '<multiline>'    + this.get('multiline')    + '</multiline>';
        }

    }, {

        type   : "Text",
        xmlTag : 'field_text',
        i18n   : 'text'
    });

    return TextField;

});