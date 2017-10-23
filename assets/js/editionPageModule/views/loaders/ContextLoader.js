/**
 * Created by David on 22/12/2015.
 */

define([
    './TrackLoader',
    './EcoreleveLoader',
    './EcollectionLoader',
    './PositionLoader'
], function (TrackLoader, EcoreleveLoader, EcollectionLoader, PositionLoader) {

    var Loaders = {
        "track" : TrackLoader,
        "ecoreleve" : EcoreleveLoader,
        "ecollection" : EcollectionLoader,
        "position" : PositionLoader
    };

    return {
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
});