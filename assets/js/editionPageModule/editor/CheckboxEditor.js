define([
    'jquery', 'lodash', 'backbone',
    'text!./CheckboxEditor.html',
    'backbone-forms'
], function($, _, Backbone, CheckboxTemplate) {
    return Backbone.Form.editors.Base.extend({
        initialize: function(options) {
            this.options = options;
            this.options.schema = this.options.schema === undefined ? _.pick(options, 'editorClass', 'fieldClass', 'iconClass', 'title') : this.options.schema;
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
        },

        render: function() {
            this.value = (typeof this.value == 'boolean') ? this.value : false;
            this.$el = $(_.template(CheckboxTemplate)({
                id          : this.options.id,
                editorClass : this.options.schema.editorClass || '',
                fieldClass  : this.options.schema.fieldClass || 'form-group',
                iconClass   : this.options.iconClass || '',
                value       : this.value,
                title       : this.schema.title == undefined ? this.key : this.schema.title
            }));

            // subscribe handlers from schema on input change
            if (this.options.schema.handlers) {
                var handlers = this.options.schema.handlers;
                for (var i in handlers) {
                    this.$el.find("input").on("change", _.bind(function(e) {
                        handlers[i](e.target.checked);
                    }, this));
                }
            }
            this.setElement(this.$el);
            return this;
        },

        getValue: function() {
            return this.$el.find('input').is(':checked');
        },

        setValue: function(value) {
            this.$el.find('input').prop('checked', value);
        }
    });
});