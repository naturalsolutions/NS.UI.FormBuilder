/**
 * Created by David on 22/12/2015.
 */

define([
    './TrackStatics',
    './EcoreleveStatics',
    './EcollectionStatics',
    './PositionStatics'
], function (TrackStatics, EcoreleveStatics, EcollectionStatics, PositionStatics) {

    var staticInputs = {
        "track" : TrackStatics,
        "ecoreleve" : EcoreleveStatics,
        "ecollection" : EcollectionStatics,
        "postiion" : PositionStatics
    };

    var ContextStaticInputs = {
        staticInputs: {},
        compulsoryInputs: [],

        getStaticInputs: function(){
            return {};
        },

        getCompulsoryInputs: function() {
            return {};
        },

        applyRules: function(form, json) {
            return json;
        },

        initializeStatics: function () {
            return true;
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