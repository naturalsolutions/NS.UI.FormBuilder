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

    var PositionStatics = {

        staticInputs: {

        },

        compulsoryInputs: [

        ],

        getStaticInputs: function(form){
            return(PositionStatics.staticInputs);
        },

        getCompulsoryInputs: function(){
            return(PositionStatics.compulsoryInputs);
        },

        applyRules: function(form, json)
        {
            var toret = json;

            return toret;
        },

        initializeStatics: function () {
            return(true);
        }
    };

    return PositionStatics;
});