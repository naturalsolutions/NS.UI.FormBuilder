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
    'app-config',
    './EcollectionCollection',
    './EcoreleveCollection',
    './TrackCollection',
    './PositionCollection'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, AppConfig,
             EcollectionCollection, EcoreleveCollection, TrackCollection, PositionCollection) {

    var Extentions = {
        "track" : TrackCollection,
        "ecoreleve" : EcoreleveCollection,
        "ecollection" : EcollectionCollection,
        "position" : PositionCollection
    };

    var CollectionExtention = {
        started: false,

        schemaExtention: {},

        propertiesDefaultValues : {},

        rulesList : function() {
            return({});
        },

        getExtractedDatas: function(){
            return({});
        },

        getSchemaExtention: function(){
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

        jsonExtention: function () {
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(true);
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