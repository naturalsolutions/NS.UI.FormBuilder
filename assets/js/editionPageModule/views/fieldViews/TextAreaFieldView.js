define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/TextAreaFieldView.html',
    'text!editionPageModule/templates/fields/readonly/TextAreaFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var LongTextFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
            $(this.el).addClass('textArea');
        },

    });

	return LongTextFieldView;

});