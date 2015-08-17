define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/patternFieldView.html',
    'text!editionPageModule/templates/fields/readonlyp/atternFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var PatternFieldView = BaseView.extend({

        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render: function() {
            BaseView.prototype.render.apply(this, arguments);
        },

        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    });

	return PatternFieldView;

});