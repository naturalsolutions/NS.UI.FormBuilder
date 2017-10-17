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
    './TrackCollection',
    './PositionCollection'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor, AppConfig,
             EcollectionCollection, EcoreleveCollection, TrackCollection, PositionCollection) {

    var Extentions = {"track" : TrackCollection,
                        "ecoreleve" : EcoreleveCollection,
                        "ecollection" : EcollectionCollection,
                        "position" : PositionCollection};

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
        started: false,

        schemaExtention: {

        },

        propertiesDefaultValues : {

        },

        rulesList : function() {
            return({});
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

        initAllExtensions: function(options) {
            if (this.started) {
                return;
            }

            this.started = true;
            for (var i in Extentions) {
                var ext = Extentions[i];
                ext.initializeExtention(options);
            }
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

        setRulesExtention: function(){

        },

        getModeExtention : function (currentContext) {
            var extentionMode = Extentions[window.context];
            if (currentContext)
                extentionMode = Extentions[currentContext];
            if (!extentionMode)
                return this;
            return extentionMode;
        }
    };

    return CollectionExtention.getModeExtention();
});