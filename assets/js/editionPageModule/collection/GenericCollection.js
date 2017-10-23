/**
 * Created by David on 22/12/2015.
 */

define([], function () {
    return {
        schemaExtention: {},
        propertiesDefaultValues : {},

        rulesList : function() {
            return({});
        },

        getExtractedDatas: function(){
            return({});
        },

        getSchemaExtention: function(){
            return({});
        },

        initializeExtention: function () {
            return(true);
        },

        jsonExtention: function () {
            return(this.propertiesDefaultValues);
        },

        updateAttributesExtention: function () {
            return(true);
        }
    };
});