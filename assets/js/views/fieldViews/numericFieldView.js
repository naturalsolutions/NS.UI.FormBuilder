define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/numericFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var NumericFieldView = BaseView.extend({

        events: function() {
            return _.extend( {}, BaseView.prototype.events, {
                'change input[type="number"]' : 'valueChanged'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render: function() {
            BaseView.prototype.render.apply(this, arguments);
        },

        valueChanged : function(e) {
            this.model.set('defaultValue', $(e.target).val())
        }
    });

	return NumericFieldView;

});