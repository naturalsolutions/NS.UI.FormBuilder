/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    'app-config',
    './TrackProperties',
    './EcoreleveProperties',
    './EcollectionProperties'
], function ($, Backbone, Translater, AppConfig,
             TrackProperties, EcoreleveProperties, EcollectionProperties) {

    var contextExtraProperties = {"track" : TrackProperties,
                            "ecoreleve" : EcoreleveProperties,
                            "ecollection" : EcollectionProperties};

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

    var ExtraProperties = {

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
        },

        getPropertiesContext : function (currentContext) {
            var propertiesContext = contextExtraProperties[window.context];
            if (currentContext)
                propertiesContext = contextExtraProperties[currentContext];
            if (!propertiesContext)
                return this;
            return propertiesContext;
        }
    };

    return ExtraProperties.getPropertiesContext();
});