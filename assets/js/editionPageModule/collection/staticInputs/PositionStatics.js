/**
 * Created by David on 22/12/2015.
 */

define([], function () {
    var PositionStatics = {
        staticInputs: {},
        compulsoryInputs: [],

        getStaticInputs: function() {
            return PositionStatics.staticInputs;
        },

        getCompulsoryInputs: function() {
            return PositionStatics.compulsoryInputs;
        },

        applyRules: function(form, json) {
            return json;
        },

        initializeStatics: function () {
            return true;
        }
    };

    return PositionStatics;
});