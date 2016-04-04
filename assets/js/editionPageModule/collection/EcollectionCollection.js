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

    var EcollectionExtention = {

        schemaExtention: {

        },

        propertiesDefaultValues : {

        },

        getExtractedDatas: function(){
            return({});
        },

        getSchemaExtention: function(options){
            return({});
        },

        initializeExtention: function () {
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
        }
    };

    return EcollectionExtention;
});