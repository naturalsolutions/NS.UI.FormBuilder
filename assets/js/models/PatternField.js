define(['backbone', 'models/TextField'], function(Backbone, TextField) {

    var PatternField = TextField.extend({
        defaults: function() {
            return _.extend(TextField.prototype.defaults, {
                pattern: ""
            })
        },

        schema: function() {
            return _.extend(TextField.constructor.schema, {
                pattern: {
                    type: 'Text'
                }
            });
        },

        initialize: function() {
            TextField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            return TextField.prototype.getXML.apply(this, arguments) + "<pattern>" + this.get('pattern') + '</pattern>';
        }

    }, {
        type   : "Pattern",
        xmlTag : 'field_pattern',
        i18n   : 'mask'
    });

    return PatternField;

});