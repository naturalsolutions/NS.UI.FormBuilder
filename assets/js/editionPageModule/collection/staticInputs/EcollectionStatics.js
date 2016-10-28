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

    var EcollectionStatics = {

        staticInputs: {

        },

        getStaticInputs: function(form){
            return({

            });
        },

        applyRules: function(form, json)
        {
            var toret = json;

            return toret;
        },

        initializeStatics: function(){
            return(true);
        }
    };

    return EcollectionStatics;
});