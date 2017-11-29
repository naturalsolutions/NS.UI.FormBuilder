define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser' /* <-- TODO */
], function($, _, Backbone, BaseView, sqliteParser) {

    var TextFieldView = BaseView.extend({
        initialize : function(options, readonly) {
            BaseView.prototype.initialize.apply(this, [options, readonly]);
            this.model.on('change:defaultValue', _.bind(this.updateIsDefaultSql, this));
        },

        updateIsDefaultSql: function(model, val) {
            if (!val) {
                model.set('isDefaultSQL', false);
                return;
            }

            var parsed = false;
            try {
                sqliteParser(val);
                parsed = true;
            } catch (err) {
                // todo really log an error ? we're not sure user wants to SQL
                //      and if he does, maybe he wants a swal alert
                console.warn("sql error for field '" + model.get('name') + "'", err);
            }
            this.model.set('isDefaultSQL', parsed);
        }
    });

    return TextFieldView;
});
