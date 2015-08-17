define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/selectFieldView.html',
    'text!editionPageModule/templates/fields/readonly/selectFieldView.html',
    'bootstrap-select'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

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
        }
    });

	return SelectFieldView;

});