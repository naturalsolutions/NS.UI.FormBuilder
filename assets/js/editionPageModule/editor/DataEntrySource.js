define([
    'jquery', 'lodash', 'backbone',
    'tools', 'text!./DataEntrySource.html',
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
            this.dictValues = tools.binWeightSource.toDictSource(this.value);
            this.$el = $(_.template(EditModeTemplate)({
                id: this.options.id,
                values: this.dictValues,
                items: tools.binWeightSource.items
            }));
            this.$el.i18n();
            this.setElement(this.$el);
            return this;
        },

        updateValue: function(e) {
            this.dictValues[$(e.target).data("bit")] = e.target.checked;
            this.$el.find("label[for='" + e.target.id + "']").toggleClass("checked");
            this.setValue(tools.binWeightSource.toValueSource(this.dictValues), true);
        },

        getValue: function() {
            return this.value;
        },

        setValue: function(value, triggerChange) {
            this.value = value;
            if (triggerChange) {
                if (this.model && this.model.view && this.model.view.setValue) {
                    this.model.view.setValue(this.options.key, value);
                } else if (triggerChange && this.model) {
                    this.model.set(this.options.key, value, {trigger: true});
                }
            }
        }
    });
});
