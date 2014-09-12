define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var FileField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                defaultValue: "",
                file: "",
                mimeType: "*",
                size: 200 //  specify max file size in ko
            })
        },

        initialize: function() {
            BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml + "<file>" + this.get('file') + '</file>' +
                "<defaultValue>" + this.get('defaultValue') + '</defaultValue>' +
                "<mimeType>" + this.get('mimeType') + '</mimeType>' +
                "<size>" + this.get('size') + '</size>';
        }
    }, {
        type: "File",
        xmlTag: 'field_file',
        i18n: 'file',
        schema: function() {
            return _.extend(BaseField.constructor.schema, {
                defaultValue: {
                    type: "string"
                },
                file: {
                    type: "string"
                },
                mimeType: {
                    type: "string"
                },
                size: {
                    type: "integer",
                    display: "Maximum size"
                }
            });
        }

    });

    return FileField;

});