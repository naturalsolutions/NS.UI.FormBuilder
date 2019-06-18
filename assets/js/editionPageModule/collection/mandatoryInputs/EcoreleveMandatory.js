/*
mandatoryInputsWithConf is an object 
{
    "inputsList" : [], //list of mandatory input for a context
    "inputsConf" : {}, //inputsConf[ inputsMandatory[i] ] to have acces to the input configuration
    "inputsDisableFields" : {} // inputsDisabledFields [ inputMandatory[i] ]  to have acces to the disabled field for one input
}
*/


define(['jquery'], function ($) {
    var EcoreleveMandatory = {

        mandatoryInputsWithConf: {
            inputsList: [
                "Comments"
            ],
            inputsConf : {
                "Comments": {
                    "id": 1,
                    "translations" : {
                        "fr" : {
                            "Help": "",
                            "Language" : "fr",
                            "Name" : "Commentaires" 
                        },
                        "en" : {
                            "Help": "",
                            "Language" : "en",
                            "Name" : "Comments" 
                        }
                    },
                    "name": "Comments",
                    "type": "TextArea"
                }
            },
            inputsDisabledFields : {
                "Comments" :[
                    "name"
                ]
            }
        },

        getMandatoryInputs: function() {
            return EcoreleveMandatory.mandatoryInputsWithConf;
        },

        initializeMandatory: function () {
            return true;
        }
    };

    return EcoreleveMandatory;
});