define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/datefieldView.html',
    'text!editionPageModule/templates/fields/readonly/datefieldView.html',
    'editionPageModule/editor/DatePickerEditor'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, DatePickerEditor) {

    var DateFieldView = BaseView.extend({
        events: function() {
            return BaseView.prototype.events;
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

       render : function() {
           BaseView.prototype.render.apply(this, arguments);
       }
    });

    return DateFieldView;

});