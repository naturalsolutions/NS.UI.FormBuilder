/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    '../../editor/CheckboxEditor'
], function ($, Backbone, Translater, CheckboxEditor) {

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
            },
            Thesaurus:{
                defaults: {
                    iscollapsed : false
                },
                schema: {
                    iscollapsed : {
                        type        : CheckboxEditor,
                        fieldClass  : "checkBoxEditor",
                        title       : translater.getValueFromKey('schema.iscollapsed')
                    }
                }
            },
            Select:{
                defaults: {
                    defaultValue : "",
                    isDefaultSQL : false
                },
                schema: {
                    defaultValue: {
                        type        : 'Text',
                        title       : translater.getValueFromKey('schema.default'),
                        editorClass : 'form-control',
                        template    : fieldTemplate,
                        editorAttrs : {
                            placeholder : translater.getValueFromKey('placeholder.valueSQL')
                        }
                    },
                    isDefaultSQL: {
                        type        : CheckboxEditor,
                        fieldClass  : "hidden",
                        title       : "isSQL"
                    }
                }
            },
            all:{
                defaults: {
                    linkedFieldIdentifyingColumn: ""
                },
                schema: {
                    linkedFieldIdentifyingColumn: {
                        type        : 'Text',
                        editorClass : 'form-control',
                        fieldClass  : "hidden",
                        template    : fieldTemplate,
                        title       : translater.getValueFromKey('schema.linkedFieldIdentifyingColumn')
                    }
                }
            }
        },

        exceptions: {
            hide: {}
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
        },

        initializeStatics: function () {
            return true;
        }
    };
});