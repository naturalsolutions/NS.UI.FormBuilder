define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var AutocompleteField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                defaultValue : "",
                hint         : "Write some text",
                url          : ""
            });
        },

        schema: function() {
            return _.extend(BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : 'Default value'
                    fieldClass : 'advanced',
                    editorClass : 'span10'
                },
                hint: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                url: {
                    type: 'Text',
                    editorClass : 'span10'
                }
            });
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                            '<hint>'         + this.get('hint')         + '</hint>' +
                            '<url>'          + this.get('url')          + '</url>';
        },

        initialize: function(options) {
            BaseField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Autocomplete",
        xmlTag : 'field_autocomplete',
        i18n   : 'autocomplete'
    });

    return AutocompleteField;

});