define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/HiddenFieldView.html',
    'text!editionPageModule/templates/fields/readonly/HiddenFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var HiddenFieldView = BaseView.extend({
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);
        }
    });

    return HiddenFieldView;

});