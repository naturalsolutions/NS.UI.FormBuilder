define([
    'jquery', 'lodash', 'backbone',
    'text!./AutocompleteEditor.html',
    'backbone-forms'
], function($, _, Backbone, AutocompleteTemplate) {
    return Backbone.Form.editors.Text.extend({
        initialize: function(options) {
            console.log("**********", options);
            this.options = options;
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
            this.acsource = (options.source?options.source:[]);
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(AutocompleteTemplate)({
                id: this.options.id,
                model: this.model
            }));

            var that = this;
            this.$el.find("input").autocomplete({
              minLength: 1,
              source : function(request, response){
                var rx = new RegExp("^" + request.term, "i");
                response($.grep(that.acsource ,function(val){return rx.test(val);}));
              }
            });

            this.$el.i18n();
            this.setElement(this.$el);

            return this;
        }
    });
});
