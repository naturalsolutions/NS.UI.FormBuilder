define(['backbone', 'models/EnumerationField'], function(Backbone, EnumerationField) {

    var SelectField = EnumerationField.extend({

        defaults : function() {
            return EnumerationField.prototype.defaults();
        },

        schema : function() {
            return EnumerationField.prototype.schema();
        },

        getXML: function() {
            return EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize: function() {
            EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Select',
        xmlTag : 'field_list',
        i18n   : 'select'
    });

    return SelectField;

});