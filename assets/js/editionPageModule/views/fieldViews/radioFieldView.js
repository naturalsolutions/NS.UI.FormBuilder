define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/radioFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var RadioFieldView = BaseView.extend({

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

	return RadioFieldView;

});