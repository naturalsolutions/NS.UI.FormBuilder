define(['jquery', 'lodash', 'backbone', 'backbone-forms', 'eonasdan-bootstrap-datetimepicker'], function($, _, Backbone, Form) {

    var DatePickerEditor = Backbone.Form.editors.Base.extend({
        tagName: 'input',

        events: {
            'click button' : 'displayPicker',
        },

        initialize: function(options) {
            this.options = options;

            this.options.schema = this.options.schema === undefined ? _.pick(options, 'editorClass', 'fieldClass', 'iconClass', 'format') : this.options.schema;

            _.bindAll(this, 'displayPicker');
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
            this.template = this.constructor.template;
        },

        displayPicker : function(e) {
            this.$el.find('input').datetimepicker({
                format : this.options.format || 'MM/DD/YYYY'
            });
            this.$el.find('input').focus();
        },

        render: function() {
            this.setElement(
                this.template({
                    id          : this.options.id,
                    editorClass : this.options.schema.editorClass || '',
                    fieldClass  : this.options.schema.fieldClass || '',
                    format      : this.options.schema.format,
                    iconClass   : this.options.iconClass || 'fa fa-calendar'
                })
            );
            return this;
        },

        getValue: function() {
            return this.$el.find('input').val()
        },

        setValue: function(value) {
            this.$el.find('input').val(value);
        }

    }, {
        template: _.template(
            '<div class="<%= fieldClass %>">' +
            '<input type="text" data-initialize="datepicker" id="<%= id %>" name="<%= id %>" class="<%= editorClass %>" />' +
            '<button type="button" class="<%= iconClass %>"></button>' +
            '</div>'
        )
    });

    return DatePickerEditor;
});