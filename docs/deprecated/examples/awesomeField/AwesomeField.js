/**
 * This file show an example for new field type
 * If you want to add this field on the application, you have to put this content on the models/Fields.js file
 */

models.AwesomeField = models.BaseField.extend({

    defaults : function() {
        return _.extend( {}, models.BaseField.prototype.defaults, {
            maxSize : 42
        });
    },

    schema: function() {
        return _.extend( {}, models.BaseField.prototype.schema, {
            maxSize: {
                type        : 'Number',
                title       : 'Max character size',
                editorClass : 'form-control',
                template    : fieldTemplate
            }
        })
    },

    initialize: function(options) {
        models.BaseField.prototype.initialize.apply(this, arguments);
    }
}, {

    type   : "Awesome",
    section : 'standard',
    i18n   : 'awesome'
});