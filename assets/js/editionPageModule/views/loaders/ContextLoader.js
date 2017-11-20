/**
 * Created by David on 22/12/2015.
 */

define([
    './TrackLoader',
    './EcoreleveLoader',
    './EcollectionLoader',
    './PositionLoader',
    'auth'
], function (TrackLoader, EcoreleveLoader, EcollectionLoader, PositionLoader, auth) {

    var Loaders = {
        "track" : TrackLoader,
        "ecoreleve" : EcoreleveLoader,
        "ecollection" : EcollectionLoader,
        "position" : PositionLoader
    };

    return {
        loadFormData: function(context, form, URLoptions) {
            var ctxLoader = Loaders[context];
            if (!ctxLoader) return;

            ctxLoader.loadFormData(form, URLoptions, auth.userlanguage);
        }
    };
});