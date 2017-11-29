define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser',
], function($, _, Backbone, BaseView, sqliteParser) {

    var SelectFieldView = BaseView.extend({

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            if (this.model.get('defaultValue'))
            {
                var sqlParsed = false;

                try
                {
                    if (this.model.get('defaultValue').constructor != Array)
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
        }
    });

	return SelectFieldView;
});