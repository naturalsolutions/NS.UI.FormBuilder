/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    '../../Translater',
    '../editor/NumberEditor',
    'text!../templates/FieldTemplate.html'
], function ($, translater, NumberEditor, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);

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
                type        : NumberEditor,
                title       : translater.getValueFromKey('form.importance'),
                template    : fieldTemplate,
                min: 0,
                max: 5,
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

        getExtractedDatas: function(){
            return({
                "Activite":"TProtocole:Activite",
                "Groupe":"TProtocole:Groupe",
                "TypeIndividus":"TProtocole:TypeIndividus",
                "Frequence":"TProtocole:Frequence"
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
            if (!this.extensionData) {
                $.ajax({
                    data: JSON.stringify({'datas' : this.getExtractedDatas()}),
                    type: 'POST',
                    url: options.URLOptions.track + "/getData",
                    contentType: 'application/json',
                    crossDomain: true,
                    async: true,
                    success: _.bind(function (data) {
                        this.extensionData = this.setSelectValues(data, this.schemaExtention);
                        if (this.callback) {
                            this.callback(this.extensionData);
                        }
                        this.callback = null;
                    }, this),
                    error: _.bind(function (xhr) {
                        console.log("error ! " + xhr);
                    }, this)
                });
            }

            return this.extensionData;
        },

        withCallback: function(callback) {
            // we have data available, just apply the callback
            if (this.extensionData) {
                callback(this.extensionData);
            } else {
                // no data available yet, save for a brighter day
                this.callback = callback;
            }
        }
    };
});