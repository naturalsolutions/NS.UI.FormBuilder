/**
 * Created by David on 22/12/2015.
 */

define([
    './TrackLoader',
    './EcoreleveLoader',
    './EcollectionLoader',
    './PositionEventsLoader',
    './PositionTypesLoader',
    'auth'
], function (TrackLoader, EcoreleveLoader, EcollectionLoader, PositionEventsLoader, PositionTypesLoader, auth) {

    var Loaders = {
        "track" : TrackLoader,
        "ecoreleve" : EcoreleveLoader,
        "ecollection" : EcollectionLoader,
        "positionevents" : PositionEventsLoader,
        "positiontypes" : PositionTypesLoader
    };

    return {
        loadFormData: function(context, form, URLoptions) {
            var ctxLoader = Loaders[context];
            if (!ctxLoader) return;

            ctxLoader.loadFormData(form, URLoptions, auth.userlanguage);
        }
    };
});