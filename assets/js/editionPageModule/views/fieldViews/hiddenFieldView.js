define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/HiddenFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var HiddenFieldView = BaseView.extend({
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

    return HiddenFieldView;

});