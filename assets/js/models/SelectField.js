define(['backbone', 'models/EnumerationField'], function(Backbone, EnumerationField) {

    var SelectField = EnumerationField.extend({
        getXML: function() {
            return EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize: function() {
            EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'Select',
        xmlTag: 'field_list',
        i18n: 'select',
        schema : function() {
            return EnumerationField.schema();
        }
    });

    return SelectField;

});