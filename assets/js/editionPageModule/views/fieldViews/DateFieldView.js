define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/datefieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var DateFieldView = BaseView.extend({
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

       render : function() {
           BaseView.prototype.render.apply(this, arguments);
       }
    });

    return DateFieldView;

});