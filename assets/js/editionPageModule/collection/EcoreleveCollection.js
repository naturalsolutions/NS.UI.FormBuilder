/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    'backbone.radio',
    '../../Translater',
    '../editor/CheckboxEditor'
], function ($, Backbone, Fields, Radio, Translater) {

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