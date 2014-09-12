define(['backbone', 'models/EnumerationField'], function(Backbone, EnumerationField) {

    var CheckBoxField = EnumerationField.extend({

        defaults : function() {
            return EnumerationField.prototype.defaults();
        },

        schema: function() {
            return EnumerationField.prototype.schema();
        },

        getXML: function() {
            return models.EnumerationField.prototype.getXML.apply(this, arguments);
        },

        initialize: function() {
            EnumerationField.prototype.initialize.apply(this, arguments);

            this.set('multiple', true);
            this.set('expanded', true);
        }

    }, {
        type   : 'CheckBox',
        xmlTag : 'field_list',
        i18n   : 'checkbox'
    });

    return CheckBoxField;

});