define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView'
], function($, _, Backbone, BaseView) {
    return BaseView.extend({
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