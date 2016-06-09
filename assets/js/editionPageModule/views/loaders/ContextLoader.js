/**
 * Created by David on 22/12/2015.
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
    './TrackLoader',
    './EcoreleveLoader',
    './EcollectionLoader'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor, AppConfig,
             TrackLoader, EcoreleveLoader, EcollectionLoader) {

    var Loaders = {"track" : TrackLoader,
                        "ecoreleve" : EcoreleveLoader,
                        "ecollection" : EcollectionLoader};

    var translater = Translater.getTranslater();

    var ContextLoader = {

        initializeLoader: function (form, URLoptions, withDataLoading) {
            this.form = form;
            this.options = URLoptions;
            this.currentloader = this.getModeLoader();

            if (withDataLoading)
                return(this.loadFormDatas());
            return(true);
        },

        loadFormDatas: function(){

            if (this.currentloader != this)
                return(this.currentloader.loadFormDatas());

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
                url         : this.options.unities,
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
                    console.log(xhr);
                }, this)
            });
        },

        getModeLoader : function (currentContext) {
            var loaderMode = Loaders[window.context];
            if (currentContext)
                loaderMode = Loaders[currentContext];
            if (!loaderMode)
                return this;
            loaderMode.initializeLoader(this.form, this.options);
            return loaderMode;
        }
    };

    return ContextLoader;
});