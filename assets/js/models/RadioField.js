define(['backbone', 'models/EnumerationField'], function(Backbone, EnumerationField) {

    var RadioField = EnumerationField.extend({
        defaults : function() {
            return EnumerationField.prototype.defaults;
        },

        schema : function() {
            return EnumerationField.constructor.schema;
        },

        getXML: function() {
            return EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize: function() {
            EnumerationField.prototype.initialize.apply(this, arguments);
            this.set('multiple', false);
            this.set('expanded', true);
        }
    }, {
        type   : 'Radio',
        xmlTag : 'field_list',
        i18n   : 'radio'
    });

    return RadioField;

});