define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/selectFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var SelectFieldView = BaseView.extend({
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'change select'        : 'updateSelected'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).find(':selected').data('idx'), true);
        }
    });

	return SelectFieldView;

});