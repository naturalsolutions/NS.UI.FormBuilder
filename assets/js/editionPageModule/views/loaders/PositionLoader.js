
define([
    'jquery',
    'backbone',
    '../../models/fields',
    'backbone.radio',
    '../../../Translater',
    '../../editor/CheckboxEditor',
    'pillbox-editor',
    'app-config',
    './ContextLoader'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor, AppConfig, ContextLoader) {

    var translater = Translater.getTranslater();
    var loader = ContextLoader;

    /**
     * Implement form object as a fields collection
     */
    var PositionLoader = {

        initializeLoader: function (form, URLoptions) {
            this.form = form;
            this.options = URLoptions;

            return(true);
        },

        loadFormDatas: function(){
            return(true);
        },

        getThisLoader : function(){
            return (this);
        }
    };

    return PositionLoader.getThisLoader();
});
