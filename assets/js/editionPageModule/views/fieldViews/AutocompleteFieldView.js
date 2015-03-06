define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/autocompleteView.html',
    'jquery-ui'
], function($, _, Backbone, BaseView, autocompleteTemplate) {

    var AutocompleteFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend(BaseView.prototype.events, {
                
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = autocompleteTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        /**
         * Render view
         */
        render : function() {
           BaseView.prototype.render.apply(this, arguments);

           $.getJSON(this.model.get('url'),_.bind(function(data) {
                
                $(this.el).find('.form-control').autocomplete({
                    minLength : 1,
                    scrollHeight: 220,

                    source: data.options
                });

            }, this));
           
       },

    });

    return AutocompleteFieldView;

});
