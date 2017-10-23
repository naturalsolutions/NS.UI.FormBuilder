/**
 * Created by David on 22/12/2015.
 */

define([], function () {
    var EcoreleveStatics = {
        staticInputs: {},
        compulsoryInputs: [],

        getStaticInputs: function() {
            return EcoreleveStatics.staticInputs;
        },

        getCompulsoryInputs: function() {
            return EcoreleveStatics.compulsoryInputs;
        },

        applyRules: function(form, json) {
            return json;
        },

        initializeStatics: function () {
            return true;
        }
    };

    return EcoreleveStatics;
});