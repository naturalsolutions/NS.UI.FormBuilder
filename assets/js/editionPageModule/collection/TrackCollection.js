/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/fields',
    'backbone.radio',
    '../../Translater',
    '../editor/CheckboxEditor',
    'pillbox-editor',
    'app-config'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor) {

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var translater = Translater.getTranslater();

    var TrackExtention = {

        schemaExtention: {
            activite : {
                type        : "Select",
                title       : translater.getValueFromKey('form.activite'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [],
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            ordre : {
                type        : 'Number',
                title       : translater.getValueFromKey('form.ordre'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required'
                }]
            },
            typeIndividus : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.typeIndividus'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [],
                validators  : [{
                    type : 'required'
                }]
            },
            frequence : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.frequence'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [],
                validators  : [{
                    type : 'required'
                }]
            },
            groupe : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.groupe'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : []
            },
            color : {
                type        : "Text",
                title       : translater.getValueFromKey('form.color'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators  : [{
                    type : 'required',
                    message : translater.getValueFromKey('form.validation')
                }]
            },
            actif : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.actif.title'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [
                    {
                        label : translater.getValueFromKey('form.actif.actif'),
                        val : 1
                    },
                    {
                        label : translater.getValueFromKey('form.actif.pasactif'),
                        val : 2
                    }
                ],
                validators  : [{
                    type : 'required'
                }]
            },
            importapressortie : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.importapressortie.title'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [
                    {
                        label : translater.getValueFromKey('form.importapressortie.only'),
                        val : 1
                    },
                    {
                        label : translater.getValueFromKey('form.importapressortie.not'),
                        val : 2
                    }
                ],
                validators  : [{
                    type : 'required'
                }]
            }
        },

        propertiesDefaultValues : {
            activite : "",
            ordre : "",
            typeIndividus : "",
            frequence : "",
            groupe : "",
            color : "",
            actif : "",
            importapressortie : ""
        },

        initializeExtention: function (options) {
            var that = this;

            var dataToSent = {
                "Activite":"Activite",
                "Groupe":"Groupe",
                "TypeIndividus":"TypeIndividus",
                "Frequence":"Frequence"
            };

            var setSelectValues = function(datas)
            {
                if (datas)
                {
                    $.each(JSON.parse(datas), function(index, value)
                    {
                        var values = [];
                        for(var ind in value)
                            values.push(ind);

                        that.schemaExtention[index.substr(0,1).toLowerCase()+index.substr(1)].options = values.sort();
                    });
                }
            };

            this.getTrackDatas(options, dataToSent, setSelectValues);

            return(true);
        },

        jsonExtention: function (originalForm) {
            if (originalForm)
            {

            }
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(true);
        },

        getTrackDatas: function (options, datas, successCallback) {
            $.ajax({
                data: JSON.stringify({'datas' : datas}),
                type: 'POST',
                url: options.URLOptions.track + "/getData",
                contentType: 'application/json',
                crossDomain: true,
                async: false,
                success: _.bind(function (data) {
                    successCallback(data);
                    return(data);
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    console.log("error ! " + xhr);
                }, this)
            });
        }
    };

    return TrackExtention;
});