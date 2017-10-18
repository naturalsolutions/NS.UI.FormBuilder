define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/numericRangeFieldView.html',
    'text!editionPageModule/templates/fields/readonly/numericRangeFieldView.html',
    "jquery-simple-slider"
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var NumericFieldView = BaseView.extend({

        events: function() {
            return _.extend( {}, BaseView.prototype.events, {
                'change input[type="number"]' : 'valueChanged'
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

            this.$el.find('input[type="range"]').simpleSlider({
                range : [this.model.get('minValue'), this.model.get('maxValue')],
                step : this.model.get('precision')
            });

            this.$el.find('input[type="range"]').bind('slider:changed', _.bind(function(event, data) {
                this.$el.find('.displayValue').text(data.value)
            }, this));
        },

        valueChanged : function(e) {
            this.model.set('defaultValue', $(e.target).val())
        }
    });

	return NumericFieldView;

});