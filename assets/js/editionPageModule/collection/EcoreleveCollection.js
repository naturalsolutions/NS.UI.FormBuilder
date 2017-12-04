/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    'backbone.radio',
    '../../Translater',
    'auth',
    'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, Radio, Translater, auth, FieldTemplate) {

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
                originalForm.author = auth.username;
            }
            return {
                author : auth.username
            };
        },
        updateAttributesExtention: function () {return true;}
    };
});