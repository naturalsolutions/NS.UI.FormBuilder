define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser'
], function($, _, Backbone, BaseView, sqliteParser) {

    var BaseViewExtended = BaseView.extend({

        /**
         * Get BaseView events
         */
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options) {
            BaseView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Render view
         */
        render : function() {
            BaseView.prototype.render.apply(this, arguments);

            var sqlParsed = false;

            try
            {
                sqlParsed = sqliteParser(this.model.get('defaultValue'));
            }
            catch (err)
            {
                console.log(err);
            }

            if (sqlParsed)
            {
                this.model.set('isDefaultSQL', true);
            }
            else
            {
                this.model.set('isDefaultSQL', false);
            }
        }

    });

    return BaseViewExtended;

});
