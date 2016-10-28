/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    'app-config'
], function ($, Backbone, Translater, AppConfig) {

    var translater = Translater.getTranslater();

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var TrackProperties = {

        extraProperties: {

        },

        getExtraPropertiesDefaults: function(inputType){

            return({

            });
        },

        getExtraPropertiesSchema: function(inputType){

            return({

            });
        },

        initializeStatics: function () {
            return(true);
        }
    };

    return TrackProperties;
});