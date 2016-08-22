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

    var EcoreleveStatics = {

        staticInputs: {

        },

        getStaticInputs: function(form){
            console.log("ECORELEVE oooooooooooooOOOOOOOOOOOooooooooooooo");
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
        }
    };

    return EcoreleveStatics;
});