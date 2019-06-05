/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    '../../editor/CheckboxEditor',
    '../../editor/NumberEditor',
    '../../editor/ObjectPickerEditor',
    'text!../../templates/FieldTemplate.html',
    'app-config'
], function ($, Backbone, translater, CheckboxEditor, NumberEditor, ObjectPickerEditor, FieldTemplate,AppConfig) {

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
            // NO MORE NEED FOR NOW ===> iscollapsed ?
            // Thesaurus:{ 
            //     defaults: {
            //         iscollapsed : false
            //     },
            //     schema: {
            //         iscollapsed : {
            //             type        : CheckboxEditor,
            //             template    : fieldTemplate,
            //             fieldClass  : "checkBoxEditor",
            //             title       : translater.getValueFromKey('schema.iscollapsed')
            //         }
            //     }
            // },
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
            SubFormGrid: {
                defaults: {
                },
                schema: {      
                    name: {
                        type        : 'Select',
                        options     : function(apply) {
                            var toret = []
                            $.ajax({
                                url: AppConfig.config.options.URLOptions.allforms + '/' + context,
                                type: 'GET',
                                contentType: 'application/json',
                                crossDomain: true,
                                async: false,
                                success: function(data) {
                                    var datas = JSON.parse(data);
                                    toret =  datas.map(function(item){return item.name });
                                },
                                error: function(xhr) {
                                    alert("Error when fetch protocols list please refresh")
                                }

                            });
                            return apply(toret);                       
                        },
                        // template    : fieldTemplate,
                        // relatedNameProperty: "childFormName"
                    }
                }
            },
            ObjectPicker: {
                defaults: {
                },
                schema: {      
                    name: {
                        type        : ObjectPickerEditor,
                        options: [
                            {
                                val: 'FK_Individual',
                                label: 'FK_Individual',
                                wsUrl: 'autocomplete/Individual'
                            },
                            {
                                val: 'FK_MonitoredSite',
                                label: 'FK_MonitoredSite',
                                wsUrl: 'autocomplete/monitoredSites'
                            },
                            {
                                val: 'FK_Sensor',
                                label: 'FK_Sensor',
                                wsUrl: 'autocomplete/Sensor'
                            }

                        ],
                        template    : fieldTemplate
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