define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/BooleanFieldView.html',
    'text!editionPageModule/templates/fields/readonly/BooleanFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var BooleanFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        updateSelected : function(e) {
            this.model.set('checked', $(e.target).is(':checked'))
        },
    });

    return BooleanFieldView;

});