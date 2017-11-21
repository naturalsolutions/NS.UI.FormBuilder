define([
    'jquery', 'lodash', 'backbone',
    'tools', 'text!./EditModeEditor.html',
    'backbone-forms'
], function($, _, Backbone, tools, EditModeTemplate) {
    return Backbone.Form.editors.Number.extend({
        events: {
            'change input': 'updateValue'
        },

        initialize: function(options) {
            this.options = options;
            Backbone.Form.editors.Number.prototype.initialize.call(this, options);
        },

        render: function() {
            Backbone.Form.editors.Number.prototype.render.call(this);
            this.dictValues = tools.binWeight.toDict(this.value);
            this.$el = $(_.template(EditModeTemplate)({
                id: this.options.id,
                values: this.dictValues,
                items: tools.binWeight.items
            }));
            this.$el.i18n();
            this.setElement(this.$el);
            return this;
        },

        updateValue: function(e) {
            this.dictValues[$(e.target).data("bit")] = e.target.checked;
            this.$el.find("label[for='" + e.target.id + "']").toggleClass("checked");
            this.setValue(tools.binWeight.toValue(this.dictValues));
        },

        getValue: function() {
            return this.value;
        },

        setValue: function(value) {
            this.value = value;
            this.model.set(this.options.key, value, {silent: true});
        }

    });
});
