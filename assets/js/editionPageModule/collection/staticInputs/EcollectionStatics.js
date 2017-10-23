/**
 * Created by David on 22/12/2015.
 */

define([], function () {
    var EcollectionStatics = {
        staticInputs: {},
        compulsoryInputs: [],

        getStaticInputs: function() {
            return EcollectionStatics.staticInputs;
        },

        getCompulsoryInputs: function() {
            return EcollectionStatics.compulsoryInputs;
        },

        applyRules: function(form, json) {
            return json;
        },

        initializeStatics: function() {
            return true;
        }
    };

    return EcollectionStatics;
});