define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/radioFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var RadioFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'click input[type="radio"]'        : 'updateSetting'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

	return RadioFieldView;

});