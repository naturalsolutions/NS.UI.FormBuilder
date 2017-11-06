define(['jquery', 'lodash', 'backbone', 'backbone-forms'], function($, _, Backbone) {
    return Backbone.Form.editors.Base.extend({
        tagName: 'input',

        initialize: function(options) {
            this.options = options;

            this.options.schema = this.options.schema === undefined ? _.pick(options, 'editorClass', 'fieldClass', 'iconClass', 'title') : this.options.schema;

            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
            this.template = this.constructor.template;
        },

        render: function() {
            //  Set default value and verifying type
            this.value = (typeof this.value == 'boolean') ? this.value : false;
            this.setElement(
                this.template({
                    id          : this.options.id,
                    editorClass : this.options.schema.editorClass || '',
                    fieldClass  : this.options.schema.fieldClass || 'form-group',
                    iconClass   : this.options.iconClass || '',
                    value       : this.value,
                    title       : this.schema.title == undefined ? this.key : this.schema.title
                })
            );
            return this;
        },

        getValue: function() {
            return this.$el.find('input').is(':checked');
        },

        setValue: function(value) {
            this.$el.find('input').prop('checked', value);
        }

    }, {
        template: _.template(
            '<div class="checkboxField col-md-6">' +
                '<input type="checkbox" id="<%= id %>" name="<%= id %>" class="<%= editorClass %>" <% if(value){%>checked<%}%> />' +
                '<label for="<%= id %>" class="<%= iconClass %>">' +
                    '&nbsp;<%= title %></label>' +
            '</div>')
    });
});