define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/horizontallineFieldView.html',
    'text!editionPageModule/templates/fields/readonly/horizontallineFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var HorizontalLineFieldView = BaseView.extend({

        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
        }

    });

	return HorizontalLineFieldView;

});