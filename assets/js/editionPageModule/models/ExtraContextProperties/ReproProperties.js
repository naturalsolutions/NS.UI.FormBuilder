/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../editor/OnBlurEditor',
    'text!../../templates/FieldTemplate.html'
], function ($, Backbone, OnBlurEditor, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);

    return {
        extraProperties: {
            all:{
                schema: {
                    onBlur: {
                        type: OnBlurEditor,
                        title: "on Blur",
                        template: fieldTemplate
                    }
                }
            }
        },

        getExtraPropertiesDefaults: function(inputType, avoid){
            var toret = {};
            if (!avoid)
                toret = this.getExtraPropertiesDefaults("all", true);

            $.each(this.extraProperties, function(index, value){
                if (index == inputType)
                {
                    toret = _.extend(toret, value.defaults);
                    return toret;
                }
            });

            return toret;
        },

        getExtraPropertiesSchema: function(inputType, avoid){
            var toret = {};
            if (!avoid)
                toret = this.getExtraPropertiesSchema("all", true);

            $.each(this.extraProperties, function(index, value){
                if (index == inputType)
                {
                    toret = _.extend(toret, value.schema);
                    return toret;
                }
            });

            return toret;
        },

        getHideExceptionForProperty: function(input, property) {
            return this.exceptions.hide[input] && this.exceptions.hide[input][property];
        }
    };
});