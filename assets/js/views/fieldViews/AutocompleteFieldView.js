define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/autocompleteView.html'
], function($, _, Backbone, BaseView, autocompleteTemplate) {

    var AutocompleteFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = autocompleteTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
            this.autocompleteURL = options.autocompleteURL;
        },

        /**
         * Render view
         */
        render : function() {
           BaseView.prototype.render.apply(this, arguments);

           $('#autocompleteExample').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(this.autocompleteURL + 'example.json', {query : query}, function(data) {
                        return process(data.options);
                    });
                }, this),
                updater : _.bind(function(item) {
                    this.model.set('defaultValue', item);
                }, this)
            });
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

    return AutocompleteFieldView;

});