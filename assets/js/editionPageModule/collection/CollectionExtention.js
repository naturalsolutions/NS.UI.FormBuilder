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
    './EcoreleveCollection',
    './TrackCollection',
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, AppConfig,
             EcoreleveCollection, TrackCollection) {

    /**
     * EmptyStatics is a dummy CollectionExtension object that does nothing.
     * If need extension for a specific context, add "context" key to
     * Extentions object, and make it implement this skeleton
     */
    var EmptyExtension = {
        schemaExtention: function() {return {};},
        propertiesDefaultValues: function() {return {};},
        getSchemaExtention: function() {return {};},
        initializeExtention: function() {return {};},
        jsonExtention: function() {return {};}
    };

    var collectionExtensions = {
        "track" : TrackCollection,
        "ecoreleve" : EcoreleveCollection
    };

    return {
        started: false,
        schemaExtention: {},
        propertiesDefaultValues : {},
        parameters: {},

        initAllExtensions: function(options) {
            if (this.started) {
                return;
            }

            this.started = true;
            for (var i in collectionExtensions) {
                var ext = collectionExtensions[i];
                ext.initializeExtention(options);
            }
        },

        getModeExtention : function (currentContext, callback) {
            var extentionMode = collectionExtensions[window.context];
            if (currentContext)
                extentionMode = collectionExtensions[currentContext];
            if (!extentionMode)
                return EmptyExtension;

            if (callback && extentionMode.withCallback) {
                extentionMode.withCallback(callback);
            }
            return extentionMode;
        }
    };
});