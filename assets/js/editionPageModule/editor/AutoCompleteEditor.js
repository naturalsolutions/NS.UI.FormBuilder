define([
    'jquery', 'lodash', 'backbone',
    'text!./AutocompleteEditor.html',
    'backbone-forms'
], function($, _, Backbone, AutocompleteTemplate) {
    return Backbone.Form.editors.Text.extend({
        events: {
            'change input': 'updateValue'
        },

        initialize: function(options) {
            this.options = options;
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },

        getValue: function() {
            console.log("getValue ACE");
            return this.$el.find("input").val();
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(AutocompleteTemplate)({
                id: this.options.id,
                model: this.model,
                value: this.value
            })); 

            var that = this;
            this.$el.find("input").autocomplete({
              minLength: 1,
              source : function(request, response){
                var rx = new RegExp("^" + request.term, "i");
                response($.grep(that.options.model.parameters,function(val){return rx.test(val);}));
              }
            });

            this.$el.i18n();
            this.setElement(this.$el);

            if (this.value)
                this.$el.find('input').val(this.value);

            return this;
        },

        updateValue: function(e) {
            this.setValue(this.$el.find('input').val());
        },

        getValue: function() {
            return this.value;
        },

        setValue: function(value) {
            this.value = value;
            this.model.view.setValue(this.options.key, value, undefined, true);
            this.model.set(this.options.key, value, {trigger: true});
        }
    });
});