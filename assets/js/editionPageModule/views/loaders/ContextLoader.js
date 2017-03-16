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
    './EcollectionLoader',
    './PositionLoader'
], function ($, Backbone, Fields, Radio, Translater, CheckboxEditor, PillboxEditor, AppConfig,
             TrackLoader, EcoreleveLoader, EcollectionLoader, PositionLoader) {

    var Loaders = {"track" : TrackLoader,
                        "ecoreleve" : EcoreleveLoader,
                        "ecollection" : EcollectionLoader,
                        "position" : PositionLoader};

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

            return(true);
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