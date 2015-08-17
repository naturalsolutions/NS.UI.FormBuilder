define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/checkboxFieldView.html',
    'text!editionPageModule/templates/fields/readonly/checkboxFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var CheckBoxFieldView = BaseView.extend({
        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

    return CheckBoxFieldView;

});