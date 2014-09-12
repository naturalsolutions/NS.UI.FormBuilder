define(['backbone', 'models/TextField'], function(Backbone, TextField) {

    var DateField = TextField.extend({

        defaults: function() {
            return _.extend(TextField.prototype.defaults(), {
                format: "dd/mm/yyyy"
            });
        },

        initialize: function() {
            TextField.prototype.initialize.apply(this, arguments);
        },
        getXML: function() {
            return TextField.prototype.getXML.apply(this, arguments) + '<format>' + this.get("format") + '</format>';
        }
    }, {
        type: "Date",
        xmlTag: 'field_date',
        i18n: 'date',
        schema: function() {
            return _.extend(TextField.constructor.schema(), {
                format: {
                    type: "string"
                }
            })
        }
    });

    return DateField;

});