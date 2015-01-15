
define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/fileFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var FileFieldView = BaseView.extend({

        /**
         * Events of the view
         */
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="text"]'     : 'updateModel',
                'click input[type="submit"]'    : 'triggerFile',
                'click input[type="text"]'      : 'triggerFile',
                'change input[type="file"]'     : 'fileChange'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        triggerFile : function() {
            $(this.el).find('input[type="file"]').trigger('click');
        },

        render: function() {
            BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input[type="text"]').enableSelection();
        },

        /**
         * Set text input value vhen file input value changes
         *
         * @param {type} e jQuery event
         */
        fileChange: function(e) {
            $(this.el).find('input[type="text"]').val($(e.target).val().replace("C:\\fakepath\\", ""))
        },

        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    });

    return FileFieldView;

});