define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/BooleanFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var BooleanFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        updateSelected : function(e) {
            this.model.set('checked', $(e.target).is(':checked'))
        },
    });

    return BooleanFieldView;

});