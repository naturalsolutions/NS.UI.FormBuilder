define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/datefieldView.html',
    'editionPageModule/editor/DatePickerEditor'
], function($, _, Backbone, BaseView, viewTemplate, DatePickerEditor) {

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

           var editor = new DatePickerEditor({
               format : 'DD/MM/YYYY',
               iconClass : 'fa fa-calendar',
               fieldClass: 'datepicker-editor'
           }).render();

           this.$el.find('.col11centered').html(editor.el)
       }
    });

    return DateFieldView;

});