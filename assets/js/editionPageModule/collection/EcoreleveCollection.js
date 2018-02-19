/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    '../editor/CheckboxEditor',
    'backbone.radio',
    '../../Translater',
    'auth',
    'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, CheckboxEditor, Radio, translater, auth, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);
    return {
        schemaExtention: {
            author : {
                type        : 'Hidden',
                title       : translater.getValueFromKey('form.author'),
                template    : fieldTemplate
            },
            isgrid : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "checkBoxEditor form-group",
                title       : translater.getValueFromKey('form.isgrid')
            },
            ishiddenprotocol : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "checkBoxEditor form-group",
                title       : translater.getValueFromKey('form.ishiddenprotocol')
            },
        },

        getExtractedDatas: function() {return {};},
        getSchemaExtention: function(){
            return this.schemaExtention;
        },
        initializeExtention: function () {return true;},

        jsonExtention: function (originalForm) {
            if (originalForm) {
                originalForm.author = auth.username;
            }
            return {
                author : auth.username,
                isgrid : "",
                ishiddenprotocol: "",
                hideprotocolname: "",
                defaultforfieldactivity: ""
            };
        },
        updateAttributesExtention: function () {return true;}
    };
});