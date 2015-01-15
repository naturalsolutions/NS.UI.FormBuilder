define(['marionette'], function(Marionette) {

    var HomePageRouter = Backbone.Marionette.AppRouter.extend({

        appRoutes: {
            "": "homeAction"
        }

    });

    return HomePageRouter;

});
