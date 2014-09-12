define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var FileField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                defaultValue : "",
                file         : "",
                mimeType     : "*",
                size         : 200 //  specify max file size in ko
            })
        },

        schema: function() {
            return _.extend(BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title : 'Default value',
                    editorClass : 'span10'
                },
                file: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                mimeType: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                size: {
                    type: 'Number',
                    title: "Maximum size",
                    editorClass : 'span10'
                }
            });
        },

        initialize: function() {
            BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);
            return xml +    "<file>"         + this.get('file')         + '</file>' +
                            "<defaultValue>" + this.get('defaultValue') + '</defaultValue>' +
                            "<mimeType>"     + this.get('mimeType')     + '</mimeType>' +
                            "<size>"         + this.get('size')         + '</size>';
        }
    }, {
        type   : "File",
        xmlTag : 'field_file',
        i18n   : 'file'
    });

    return FileField;

});