define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/radioFieldView.html',
    'text!editionPageModule/templates/fields/readonly/radioFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var RadioFieldView = BaseView.extend({

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

	return RadioFieldView;

});