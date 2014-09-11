define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/numericFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var NumericFieldView = BaseView.extend({

        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render: function() {
            BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input').spinner({
                step: this.model.step,
                min: this.model.minValue
            }).parent('span').addClass('span10');
        }
    });

	return NumericFieldView;

});