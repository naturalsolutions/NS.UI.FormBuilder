define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../../templates/fieldView/HiddenFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var HiddenFieldView = BaseView.extend({
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options) {
            options.template = viewTemplate;
            BaseView.prototype.initialize.apply(this, options);
        }
    });

    return HiddenFieldView;

});