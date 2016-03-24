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
                type        : "Text",
                title       : translater.getValueFromKey('form.activite'),
                editorClass : 'form-control',
                template    : fieldTemplate,
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
                options : ["Adult (All)", "Adult (Female)", "Adult (Male)", "Adulte (Tous)",
                    "Nouvel Adulte", "Nouvel Oeuf", "Oeuf"],
                validators  : [{
                    type : 'required'
                }]
            },
            frequence : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.frequence'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : ["Multiple", "Unique", "Unique per day"],
                validators  : [{
                    type : 'required'
                }]
            },
            groupe : {
                type        : 'Select',
                title       : translater.getValueFromKey('form.groupe'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : ["", "gr_A Relacher Vivant", "gr_Adulte Tous", "gr_Adulte Vivant",
                    "gr_Individus Femelle vivant", "gr_Individus Male vivant", "gr_Individus Mort",
                    "gr_Oeuf Tous", "gr_Oeuf Vivant"]
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

        initializeExtention: function () {
            return(this.propertiesDefaultValues);
        },

        jsonExtention: function (originalForm) {
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(this.propertiesDefaultValues);
        }
    };

    return TrackExtention;
});