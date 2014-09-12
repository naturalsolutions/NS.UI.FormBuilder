define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var AutocompleteField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                defaultValue: "",
                hint: "Write some text",
                url: ""
            });
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml + '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                '<hint>' + this.get('hint') + '</hint>' +
                '<url>' + this.get('url') + '</url>';
        },

        initialize: function(options) {
            BaseField.prototype.initialize.apply(this, arguments);
        }

    }, {

        type: "Autocomplete",
        xmlTag: 'field_autocomplete',
        i18n: 'autocomplete',
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
                url: {
                    type: "string"
                }
            })
        }

    });

    return AutocompleteField;

});