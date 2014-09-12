define(['backbone', 'models/TextField'], function(Backbone, TextField) {

    var LongTextField = TextField.extend({

        defaults : function() {
            return _.extend(TextField.prototype.defaults(), {
                multiline : true
            });
        },

        schema: function() {
            return _.extend(TextField.prototype.schema(), {
                multiline : {
                    type : 'Checkbox',
                    editorClass : 'span10'
                }
            });
        },

        initialize: function() {
            TextField.prototype.initialize.apply(this, arguments);
            this.set('multiline', true);
        },

        getXML: function() {
            return TextField.prototype.getXML.apply(this, arguments);
        }

    }, {
        type   : 'LongText',
        xmlTag : 'field_text',
        i18n   : 'long'
    });

    return LongTextField;

});