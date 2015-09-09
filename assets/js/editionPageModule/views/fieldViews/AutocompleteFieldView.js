define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/autocompleteView.html',
    'text!editionPageModule/templates/fields/readonly/autocompleteView.html',
    'jquery-ui'
], function($, _, Backbone, BaseView, autocompleteTemplate, autocompleteTemplateRO) {

    var AutocompleteFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend(BaseView.prototype.events, {
                
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = autocompleteTemplate;
            if (readonly)
                opt.template = autocompleteTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        /**
         * Render view
         */
        render : function() {
           BaseView.prototype.render.apply(this, arguments);

           $.getJSON(this.model.get('url'),_.bind(function(data) {
                
                $(this.el).find('.form-control').autocomplete({
                    minLength : this.model.get('triggerlength'),
                    scrollHeight: 220,
                    source: data.options
                });
            }, this));
           
       },

    });

    return AutocompleteFieldView;

});
