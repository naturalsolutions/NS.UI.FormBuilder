define([
    './EcoreleveMandatory'
], function (EcoreleveMandatory) {

    /**
     * EmptyStatics is a dummy StaticInput object that does nothing.
     * If need static inputs for a specific context, add "context" key to
     * staticInputs object, and make it implement this skeleton
     */
    var EmptyMandatory = {
        getMandatoryInputs: function() {return  this.mandatoryInputsWithConf; },
        initializeMandatory: function() {return true;},
        mandatoryInputsWithConf: {
            inputsList: [],
            inputsConf : {},
            inputsDisabledFields : {}
        }
    };

    var MandatoryInputs = {
        "ecoreleve" : EcoreleveMandatory
    };

    var ContextMandatoryInputs = {
        getMandatoryMode : function (currentContext) {
            
            if (!currentContext) {
                console.warn("getMandatoryMode without context", window.context);
            }

            var mandatoryMode = MandatoryInputs[window.context];
            if (currentContext)
                mandatoryMode = MandatoryInputs[currentContext];
            if (!mandatoryMode)
                mandatoryMode = EmptyMandatory;
            return mandatoryMode;
        }
    };

    return ContextMandatoryInputs;
});