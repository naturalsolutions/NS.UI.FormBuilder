/**
 * Created by David on 22/12/2015.
 */

define([
    './TrackStatics'
], function (TrackStatics) {

    /**
     * EmptyStatics is a dummy StaticInput object that does nothing.
     * If need static inputs for a specific context, add "context" key to
     * staticInputs object, and make it implement this skeleton
     */
    var EmptyStatics = {
        getStaticInputs: function() {return {};},
        getCompulsoryInputs: function() {return [];},
        applyRules: function(form, json) {return json;},
        initializeStatics: function() {return true;}
    };

    var staticInputs = {
        "track" : TrackStatics
    };

    var ContextStaticInputs = {
        getStaticMode : function (currentContext) {
            if (!currentContext) {
                console.warn("getStaticMode without context", window.context);
            }

            var staticMode = staticInputs[window.context];
            if (currentContext)
                staticMode = staticInputs[currentContext];
            if (!staticMode)
                staticMode = EmptyStatics;
            return staticMode;
        }
    };

    return ContextStaticInputs;
});