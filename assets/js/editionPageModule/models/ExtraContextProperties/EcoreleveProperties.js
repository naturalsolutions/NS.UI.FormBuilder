/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    '../../editor/CheckboxEditor',
    'text!../../templates/FieldTemplate.html'
], function ($, Backbone, translater, CheckboxEditor, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);

    return {
        extraProperties: {
            CheckBox:{
                defaults: {
                    defaultValue: ""
                },
                schema: {
                    defaultValue : {
                        type        : 'Text',
                        title       : translater.getValueFromKey('schema.default'),
                        editorClass : 'form-control',
                        template    : fieldTemplate,
                        editorAttrs : {

                        }
                    }
                }
            },
            ChildForm:{
                defaults: {
                    minimumAppearance : 0
                },
                schema: {
                    minimumAppearance : {
                        type        : 'Number',
                        template    : fieldTemplate,
                        title       : translater.getValueFromKey('schema.minAppearance'),
                        validators : [function checkValue(value, formValues) {
                            if (value < 0) {
                                return {
                                    type : 'Invalid number',
                                    message : translater.getValueFromKey('schema.minValueError') || "La valeur ne peut pas être inférieure à 0"
                                }
                            }
                        }]
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
                        template    : fieldTemplate,
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
                        template    : fieldTemplate
                    },
                    isDefaultSQL: {
                        // todo: isSQLPropertySetter? (Fields.js:63)
                        type        : CheckboxEditor,
                        template    : fieldTemplate,
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
        }
    };
});