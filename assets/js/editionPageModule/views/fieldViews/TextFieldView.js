define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/TextFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var TextFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        /**
         * Render view
         */
        render : function() {
           BaseView.prototype.render.apply(this, arguments);
       },

       /**
        * Change model value when text input value changed
        *
        * @param {object} jQuery event
        */
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    });

    return TextFieldView;

});
