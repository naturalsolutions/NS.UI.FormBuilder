define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/SubFormGridFieldView.html',
    'text!editionPageModule/templates/fields/readonly/SubFormGridFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var SubFormGridFieldView = BaseView.extend({

        events: function() {
            return _.extend( {}, BaseView.prototype.events, {

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

    });

	return SubFormGridFieldView;

});