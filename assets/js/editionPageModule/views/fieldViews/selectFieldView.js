define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/selectFieldView.html',
    'text!editionPageModule/templates/fields/readonly/selectFieldView.html',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser',
    'bootstrap-select'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, sqliteParser) {

    var SelectFieldView = BaseView.extend({

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('select').selectpicker();

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