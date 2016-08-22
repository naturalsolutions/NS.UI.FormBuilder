/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    'app-config'
], function ($, Backbone, Translater, AppConfig) {

    var translater = Translater.getTranslater();

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var EcoreleveProperties = {

        extraProperties: {
            ChildForm:{
                defaults: {
                    minimumAppearance : 0
                },
                schema: {
                    minimumAppearance : {
                        type        : 'Number',
                        editorClass : 'form-control',
                        template    : fieldTemplate,
                        title       : translater.getValueFromKey('schema.minAppearance'),
                        validators : [function checkValue(value, formValues) {
                            if (value < 0) {
                                return {
                                    type : 'Invalid number',
                                    message : translater.getValueFromKey('schema.minValueError') || "La valeur ne peut pas être inférieure à 0"
                                }
                            }
                        }],
                        editorAttrs : {
                            placeholder : translater.getValueFromKey('placeholder.num.minAppearance')
                        }
                    }
                }
            }
        },

        getExtraPropertiesDefaults: function(inputType){
            var toret = {};

            $.each(this.extraProperties, function(index, value){
                if (index == inputType)
                {
                    toret = value.defaults;
                    return(toret);
                }
            });

            return(toret);
        },

        getExtraPropertiesSchema: function(inputType){
            var toret = {};

            $.each(this.extraProperties, function(index, value){
                if (index == inputType)
                {
                    toret = value.schema;
                    return(toret);
                }
            });

            return(toret);
        },

        initializeStatics: function () {
            return(true);
        }
    };

    return EcoreleveProperties;
});