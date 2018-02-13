define([
    'jquery', 'lodash', 'backbone',
    'text!./NumberEditor.html',
    'backbone-forms'
], function($, _, Backbone, NumberTemplate) {
    return Backbone.Form.editors.Number.extend({
        template: NumberTemplate,
        initialize: function(options) {
            this.options = options;
            Backbone.Form.editors.Number.prototype.initialize.call(this, options);
        },

        render: function() {
            this.$el = $(_.template(NumberTemplate)({
                id          : this.options.id,
                name        : this.options.key,
                min         : this.options.schema.min || null,
                max         : this.options.schema.max || null,
                editorClass : this.options.schema.editorClass || '',
                value       : this.value,
            }));
            this.setElement(this.$el);
            return this;
        }

        // render: function() {
        //     this.value = (typeof this.value == 'boolean') ? this.value : false;
        //     this.$el = $(_.template(CheckboxTemplate)({
        //         id          : this.options.id,
        //         name        : this.options.key,
        //         editorClass : this.options.schema.editorClass || '',
        //         fieldClass  : this.options.schema.fieldClass || 'form-group',
        //         iconClass   : this.options.iconClass || '',
        //         value       : this.value,
        //         title       : this.schema.title == undefined ? this.key : this.schema.title
        //     }));
        //
        //     // subscribe handlers from schema on input change
        //     if (this.options.schema.handlers) {
        //         var handlers = this.options.schema.handlers;
        //         for (var i in handlers) {
        //             this.$el.find("input").on("change", _.bind(function(e) {
        //                 handlers[i](e.target.checked);
        //             }, this));
        //         }
        //     }
        //     this.setElement(this.$el);
        //     return this;
        // },
        //
        // getValue: function() {
        //     return this.$el.find('input').is(':checked');
        // },
        //
        // setValue: function(value) {
        //     this.$el.find('input').prop('checked', value);
        // }
    });
});