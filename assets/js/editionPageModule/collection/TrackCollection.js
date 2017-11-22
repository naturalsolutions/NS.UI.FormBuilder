/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    '../../Translater',
    'text!../templates/FieldTemplate.html'
], function ($, Translater, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);

    var translater = Translater.getTranslater();

    return {
        extensionData: null,
        schemaExtention: {
            activite : {
                type        : "Select",
                title       : translater.getValueFromKey('form.activite'),
                template    : fieldTemplate,
                searchable  : true,
                options : [],
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            importance : {
                type        : 'Number',
                title       : translater.getValueFromKey('form.importance'),
                template    : fieldTemplate,
                validators  : [{
                    type : 'required'
                },
                    function test(value) {
                        if (value < 0 || value > 5) {
                            return {
                                type: 'Invalid value',
                                message: translater.getValueFromKey('schema.errorbetween0and5')
                            };
                        }
                    }
                ]
            },
            typeIndividus : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.typeIndividus'),
                template    : fieldTemplate,
                searchable  : true,
                options : [],
                validators  : [{
                    type : 'required'
                }]
            },
            frequence : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.frequence'),
                template    : fieldTemplate,
                options : [],
                validators  : [{
                    type : 'required'
                }]
            },
            groupe : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.groupe'),
                template    : fieldTemplate,
                searchable  : true,
                options : [],
                validators  : [{
                    type : 'required'
                }]
            },
            actif : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.actif.title'),
                fieldClass  : "hidden",
                template    : fieldTemplate,
                options : [
                    {
                        label : translater.getValueFromKey('form.actif.actif'),
                        val : 1
                    },
                    {
                        label : translater.getValueFromKey('form.actif.pasactif'),
                        val : 0
                    }
                ]
            },
            importapressortie : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.importapressortie.title'),
                template    : fieldTemplate,
                options : [
                    {
                        label : translater.getValueFromKey('form.importapressortie.only'),
                        val : 1
                    },
                    {
                        label : translater.getValueFromKey('form.importapressortie.not'),
                        val : 0
                    }
                ],
                validators  : [{
                    type : 'required'
                }]
            }
        },

        propertiesDefaultValues : {
            activite : "",
            importance : "",
            typeIndividus : "",
            frequence : "",
            groupe : "",
            actif : "",
            importapressortie : ""
        },

        rulesList : function() {
            return({});
        },

        getExtractedDatas: function(){
            return({
                "Activite":"Activite",
                "Groupe":"Groupe",
                "TypeIndividus":"TypeIndividus",
                "Frequence":"Frequence"
            });
        },

        getSchemaExtention: function(options){
            if (this.extensionData) {
                return this.extensionData;
            }
            if (options) {
                this.getTrackDatas(options);
            }
            return this.schemaExtention;
        },

        initializeExtention: function (options) {
            this.getTrackDatas(options);
        },

        jsonExtention: function () {
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(true);
        },

        setSelectValues: function(datas, schema)
        {
            var getJSONForSelectOptions = function(valuesArray)
            {
                $.each(valuesArray, function(index, value){
                    valuesArray[index] = {label: value, val: value};
                });
                return(valuesArray);
            };

            if (datas)
            {
                $.each(JSON.parse(datas), function(index, value)
                {
                    var values = [];
                    for(var ind in value)
                        values.push(ind);

                    schema[index.substr(0,1).toLowerCase()+index.substr(1)].options = getJSONForSelectOptions(values.sort());
                });
            }

            return (schema);
        },

        getTrackDatas: function (options) {
            var that = this;
            if (!this.extensionData) {
                $.ajax({
                    data: JSON.stringify({'datas' : that.getExtractedDatas()}),
                    type: 'POST',
                    url: options.URLOptions.track + "/getData",
                    contentType: 'application/json',
                    crossDomain: true,
                    async: true,
                    success: _.bind(function (data) {
                        that.extensionData = that.setSelectValues(data, that.schemaExtention);
                    }, this),
                    error: _.bind(function (xhr) {
                        console.log("error ! " + xhr);
                    }, this)
                });
            }

            return this.extensionData;
        }
    };
});