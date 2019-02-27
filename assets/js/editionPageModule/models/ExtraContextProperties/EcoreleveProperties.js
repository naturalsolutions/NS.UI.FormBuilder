/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    '../../editor/CheckboxEditor',
    '../../editor/NumberEditor',
    'text!../../templates/FieldTemplate.html'
], function ($, Backbone, translater, CheckboxEditor, NumberEditor, FieldTemplate) {

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
                        type        : NumberEditor,
                        min: 0,
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
                    sqlQuery : 'null'
                },
                schema: {
                    defaultValue: {
                        type        : 'Text',
                        title       : translater.getValueFromKey('schema.default'),
                        template    : fieldTemplate
                    },
                    sqlQuery: {
                        // todo: isSQLPropertySetter? (Fields.js:63)
                        type        : 'TextArea',
                        template    : fieldTemplate,
                        // fieldClass  : "hidden",
                        title       : 'SQL Query',
                        validators: [{
                            type: 'regexp',
                            regexp: /\bselect\b[\s\S]*?\bfrom\b/im,
                            message: 'Must be formatted like : SELECT ... FROM'
                        }]
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