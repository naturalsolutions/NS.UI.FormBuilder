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
    '../../editor/ChildFormEditor',
    '../../editor/CustomTextEditor',
    'text!../../templates/FieldTemplate.html',
    'app-config'
], function ($, Backbone, translater, CheckboxEditor, NumberEditor, ObjectPickerEditor, ChildFormEditor,CustomTextEditor, FieldTemplate,AppConfig) {

    var fieldTemplate = _.template(FieldTemplate);

    return {
        extraProperties: {

            AutocompleteField: {
                schema:{
                    name: {
                        type : CustomTextEditor
                    }
                }
            },
            CheckBox:{
                defaults: {
                    defaultValue: ""
                },
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
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
                    name: {
                        type        : ChildFormEditor,// 'Select',
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
                                    for( var i = 0 ; i < datas.length ; i ++) {
                                        toret[i] = {
                                            id : datas[i].id,
                                            val: datas[i].name,
                                            label: datas[i].name
                                        }
                                    }
                                },
                                error: function(xhr) {
                                    alert("Error when fetch protocols list please refresh")
                                }

                            });
                            return apply(toret);
                        },
                    },
                childForm : { //we need the property but no render
                    type: 'Hidden',
                },
                childFormName : { //we need the property but no render
                    type: 'Hidden'
                },
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
            Date: {
                schema: {
                    name: {
                        type : CustomTextEditor
                    }
                }
            },
            Decimal: {
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
                    minValue: {
                        type: 'Text',
                        template: fieldTemplate,
                        title: translater.getValueFromKey('schema.min'),
                        validators: [function checkValue(value, formValues) {
                            if (value != "") {
                                if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur saisie est d'un format incorrect"
                                    }
                                }
                                value = parseFloat(value);
        
                                if (value.toString().substr(0, 1) != '#' && formValues['maxValue'] != "" && value > formValues['maxValue']) {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur maximale est inférieure à la valeur minimale"
                                    }
                                }
                            }
                        }]
                    },
                    maxValue: {
                        type: 'Text',
                        template: fieldTemplate,
                        title: translater.getValueFromKey('schema.max'),
                        validators: [function checkValue(value, formValues) {
                            if (value != "") {
                                if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur saisie est d'un format incorrect"
                                    }
                                }
                                value = parseFloat(value);
        
                                if (value.toString().substr(0, 1) != '#' && formValues['minValue'] != "" && value < formValues['minValue']) {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur maximale est inférieure à la valeur minimale"
                                    }
                                }
                            }
                        }]
                    }
                }
            },

            Number: {
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
                    minValue: {
                        type: 'Text',
                        template: fieldTemplate,
                        title: translater.getValueFromKey('schema.min'),
                        validators: [function checkValue(value, formValues) {
                            if (value != "") {
                                if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur saisie est d'un format incorrect"
                                    }
                                }
                                value = parseFloat(value);
        
                                if (value.toString().substr(0, 1) != '#' && formValues['maxValue'] != "" && value > formValues['maxValue']) {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur maximale est inférieure à la valeur minimale"
                                    }
                                }
                            }
                        }]
                    },
                    maxValue: {
                        type: 'Text',
                        template: fieldTemplate,
                        title: translater.getValueFromKey('schema.max'),
                        validators: [function checkValue(value, formValues) {
                            if (value != "") {
                                if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur saisie est d'un format incorrect"
                                    }
                                }
                                value = parseFloat(value);
        
                                if (value.toString().substr(0, 1) != '#' && formValues['minValue'] != "" && value < formValues['minValue']) {
                                    return {
                                        type: 'Invalid number',
                                        message: "La valeur maximale est inférieure à la valeur minimale"
                                    }
                                }
                            }
                        }]
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
            Select:{
                defaults: {
                    defaultValue : "",
                    sqlQuery : 'null'
                },
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
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
                        type        : ChildFormEditor,// 'Select',
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
                                    for( var i = 0 ; i < datas.length ; i ++) {
                                        toret[i] = {
                                            id : datas[i].id,
                                            val: datas[i].name,
                                            label: datas[i].name
                                        }
                                    }
                                },
                                error: function(xhr) {
                                    alert("Error when fetch protocols list please refresh")
                                }

                            });
                            return apply(toret);                       
                        },
                    },
                childForm : { //we need the property but no render
                    type: 'Hidden',
                },
                childFormName : { //we need the property but no render
                    type: 'Hidden'
                }
            }
            },
            // NO MORE NEED FOR NOW ===> iscollapsed ?
            Text: {
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
                    defaultValue: {
                        type        : 'Text',
                        title       : '',
                        template    : fieldTemplate
                    }
                }
            },
            TextArea: {
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
                    defaultValue: {
                        type        : 'Text',
                        title       : '',
                        template    : fieldTemplate
                    }
                }
            },
            Thesaurus:{
                schema: {
                    name: {
                        type : CustomTextEditor
                    },
                    defaultPath: {
                        type: 'Text',
                        template: fieldTemplate
                    },
                    webServiceURL : {
                        type : 'Hidden'
                    }
                }
            },
            all:{
                defaults: {
                    linkedFieldIdentifyingColumn: "",
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