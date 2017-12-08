define([
    'jquery',
    'lodash',
    'backbone',
    'tools',
    'editionPageModule/views/fieldViews/BaseView'
], function($, _, Backbone, tools, BaseView) {
    return BaseView.extend({
        events: _.extend(BaseView.prototype.events, {
            "change input[name='webServiceURL']": "urlChanged"
        }),

        urlChanged: function(e) {
            // preload new(?) url
            tools.loadTree(e.target.value);

            // tell user to reload form
            tools.swal("info", "editGrid.urlChanged", "editGrid.urlChangedMessage");
        },

        initialize : function(options) {
            // set aside url for autocompTree fields by key, will be used by editor
            var wsURL;
            if (options.model) {
                wsURL = options.model.get("webServiceURL");
            }
            if (wsURL) {
                options.model.defaultNode = wsURL;
            }

            BaseView.prototype.initialize.apply(this, [options]);
        }
    });
});
