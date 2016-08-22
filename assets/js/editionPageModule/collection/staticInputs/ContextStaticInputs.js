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
    './EcollectionStatics'
], function ($, Backbone, Translater, AppConfig,
             TrackStatics, EcoreleveStatics, EcollectionStatics) {

    var staticInputs = {"track" : TrackStatics,
                        "ecoreleve" : EcoreleveStatics,
                        "ecollection" : EcollectionStatics};

    var translater = Translater.getTranslater();

    var ContextStaticInputs = {

        staticInputs: {

        },

        getStaticInputs: function(form){
            console.log("DEFAULT oooooooooooooOOOOOOOOOOOooooooooooooo");
            console.log(form);
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