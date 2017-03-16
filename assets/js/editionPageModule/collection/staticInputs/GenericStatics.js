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

    var GenericStatics = {

        staticInputs: {

        },

        compulsoryInputs: [

        ],

        getStaticInputs: function(form){
            return(GenericStatics.staticInputs);
        },

        getCompulsoryInputs: function(){
            return(GenericStatics.compulsoryInputs);
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

    return GenericStatics;
});