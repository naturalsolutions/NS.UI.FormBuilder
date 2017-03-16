/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../../../Translater',
    'app-config',
    './TrackStatics',
    './EcoreleveStatics',
    './EcollectionStatics',
    './PositionStatics'
], function ($, Backbone, Translater, AppConfig,
             TrackStatics, EcoreleveStatics, EcollectionStatics, PositionStatics) {

    var staticInputs = {"track" : TrackStatics,
                        "ecoreleve" : EcoreleveStatics,
                        "ecollection" : EcollectionStatics,
                        "postiion" : PositionStatics};

    var translater = Translater.getTranslater();

    var ContextStaticInputs = {

        staticInputs: {

        },

        compulsoryInputs: [

        ],

        getStaticInputs: function(form){
            return({
            });
        },

        getCompulsoryInputs: function(){
            return({
            });
        },

        applyRules: function(form, json)
        {
            var toret = json;

            return toret;
        },

        initializeStatics: function () {
            return(true);
        },

        getStaticMode : function (currentContext) {
            var staticMode = staticInputs[window.context];
            if (currentContext)
                staticMode = staticInputs[currentContext];
            if (!staticMode)
                return this;
            return staticMode;
        }
    };

    return ContextStaticInputs.getStaticMode();
});