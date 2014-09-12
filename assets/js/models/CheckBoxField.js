define(['backbone', 'models/EnumerationField'], function(Backbone, EnumerationField) {

    var CheckBoxField = EnumerationField.extend({

        getXML: function() {
            return models.EnumerationField.prototype.getXML.apply(this, arguments);
        },

        initialize: function() {
            EnumerationField.prototype.initialize.apply(this, arguments);

            this.set('multiple', true);
            this.set('expanded', true);
        }

    }, {
        type: 'CheckBox',
        xmlTag: 'field_list',
        i18n: 'checkbox',
        schema: function() {
            return EnumerationField.constructor.schema();
        }
    });

    return CheckBoxField;

});
