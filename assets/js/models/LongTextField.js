define(['backbone', 'models/TextField'], function(Backbone, TextField) {

    var LongTextField = TextField.extend({

        initialize: function() {
            TextField.prototype.initialize.apply(this, arguments);
            this.set('multiline', true);
        },

        getXML: function() {
            return TextField.prototype.getXML.apply(this, arguments);
        }

    }, {
        type: 'LongText',
        xmlTag: 'field_text',
        i18n: 'long',
        schema: function() {
            return TextField.constructor.schema();
        }
    });

    return LongTextField;

});