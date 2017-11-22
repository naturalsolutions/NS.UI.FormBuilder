/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    'backbone.radio',
    '../../Translater',
    '../editor/CheckboxEditor',
    'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, Radio, Translater, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);

    var translater = Translater.getTranslater();

    var EcoreleveExtention = {
        schemaExtention: {
            author : {
                type        : 'Hidden',
                title       : translater.getValueFromKey('form.author'),
                template    : fieldTemplate
            }
        },

        propertiesDefaultValues : {
            author : window.user
        },

        rulesList : function() {
            return({});
        },

        getExtractedDatas: function(){
            return({});
        },

        getSchemaExtention: function(options){
            return this.schemaExtention;
        },

        initializeExtention: function () {
            return(true);
        },

        jsonExtention: function (originalForm) {
            if (originalForm)
            {
                originalForm.author = window.user;
            }
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(true);
        }
    };

    return EcoreleveExtention;
});