/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    'backbone.radio',
    '../../Translater',
    'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, Radio, Translater, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);
    var translater = Translater.getTranslater();
    return {
        schemaExtention: {
            author : {
                type        : 'Hidden',
                title       : translater.getValueFromKey('form.author'),
                template    : fieldTemplate
            }
        },

        getExtractedDatas: function() {return {};},
        getSchemaExtention: function(){
            return this.schemaExtention;
        },
        initializeExtention: function () {return true;},
        jsonExtention: function (originalForm) {
            if (originalForm) {
                originalForm.author = window.user;
            }
            return {
                author : window.user
            };
        },
        updateAttributesExtention: function () {return true;}
    };
});