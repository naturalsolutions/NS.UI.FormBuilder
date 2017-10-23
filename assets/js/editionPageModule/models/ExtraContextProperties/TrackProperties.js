/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater'
], function ($, Backbone, Translater) {

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

    return {

        extraProperties: {
            all:{
                defaults: {
                    trackType: ""
                },
                schema: {
                    trackType: {
                        type        : 'Select',
                        editorClass : 'form-control',
                        template    : fieldTemplate,
                        title       : translater.getValueFromKey('schema.trackType'),
                        options     : [],
                        after       : "name"
                    }
                }
            }
        },

        exceptions: {
            hide: {
                AutocompleteField : {
                    triggerlength : true
                }
            }
        },

        getExtraPropertiesDefaults: function(inputType, avoid) {
            var toret = {};
            if (!avoid)
                toret = this.getExtraPropertiesDefaults("all", true);

            $.each(this.extraProperties, function(index, value) {
                if (index == inputType) {
                    toret = _.extend(toret, value.defaults);
                    return(toret);
                }
            });

            return(toret);
        },

        getExtraPropertiesSchema: function(inputType, avoid) {
            var toret = {};
            if (!avoid)
                toret = this.getExtraPropertiesSchema("all", true);

            $.each(this.extraProperties, function(index, value) {
                if (index == inputType) {
                    toret = _.extend(toret, value.schema);
                    return(toret);
                }
            });

            return(toret);
        },

        getHideExceptionForProperty: function(input, property) {
            return(this.exceptions.hide[input] && this.exceptions.hide[input][property]);
        },

        initializeStatics: function () {
            return(true);
        }
    };
});