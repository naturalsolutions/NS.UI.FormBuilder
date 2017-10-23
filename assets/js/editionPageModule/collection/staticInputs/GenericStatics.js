/**
 * Created by David on 22/12/2015.
 */

define([], function () {
    var GenericStatics = {
        staticInputs: {},
        compulsoryInputs: [],

        getStaticInputs: function() {
            return GenericStatics.staticInputs;
        },

        getCompulsoryInputs: function() {
            return GenericStatics.compulsoryInputs;
        },

        applyRules: function(form, json) {
            return json;
        },

        initializeStatics: function () {
            return true;
        }
    };

    return GenericStatics;
});