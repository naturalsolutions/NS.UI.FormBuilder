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
    'app-config',
    './EcollectionCollection',
    './EcoreleveCollection',
    './TrackCollection'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor, AppConfig,
             EcollectionCollection, EcoreleveCollection, TrackCollection) {

    var Extentions = {"track" : TrackCollection,
                        "ecoreleve" : EcoreleveCollection,
                        "ecollection" : EcollectionCollection};

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

    var CollectionExtention = {

        schemaExtention: {

        },

        propertiesDefaultValues : {

        },

        initializeExtention: function () {
            return(this.propertiesDefaultValues);
        },

        jsonExtention: function (originalForm) {
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(this.propertiesDefaultValues);
        },

        getModeExtention : function (currentContext) {
            var extentionMode = Extentions[AppConfig.appMode.currentmode.toLowerCase()];
            if (currentContext)
                extentionMode = Extentions[currentContext];
            if (!extentionMode)
                return this;
            return extentionMode;
        }
    };

    return CollectionExtention.getModeExtention();
});