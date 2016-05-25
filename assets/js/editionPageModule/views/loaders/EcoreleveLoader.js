/**
* @fileOverview collection.js
*
* Describe form model for the application
* Inherited from Backbone collection
*
* @author          MICELI Antoine (miceli.antoine@gmail.com)
* @version         1.0
*/

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
    var EcorelevetLoader = {

        initializeLoader: function (form, URLoptions) {
            this.form = form;
            this.options = URLoptions;

            return(true);
        },

        loadFormDatas: function(){
            if (this.form.fields.unity)
            {
                this.loadUnities();
            }
            return(true);
        },

        loadUnities: function(){
            $.ajax({
                data        : JSON.stringify({}),
                type        : 'GET',
                url         : this.options.unities + "/" + window.context,
                contentType : 'application/json',
                crossDomain : true,
                success: _.bind(function(data) {
                    var unityoptions = [];
                    $.each(data.unities, function(index, value){
                        if (value.name && value.name.length > 0)
                            unityoptions.push(value.name);
                    });
                    this.form.fields.unity.editor.setOptions(unityoptions);
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    console.log("error ajax load unities :");
                    console.log(xhr);
                }, this)
            });
        },

        getThisLoader : function(){
            return (this);
        }
    };

    return EcorelevetLoader.getThisLoader();
});
