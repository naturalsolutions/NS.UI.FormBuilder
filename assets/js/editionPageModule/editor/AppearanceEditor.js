define([
    'jquery', 'lodash', 'backbone',
    'text!./AppearanceEditor.html',
    'backbone-forms'
], function($, _, Backbone, AppearanceTemplate) {
    return Backbone.Form.editors.Text.extend({
        initialize: function(options) {
            this.options = options;
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(AppearanceTemplate)({
                id: this.options.id,
                model: this.model
            }));
            this.$el.i18n();
            this.setElement(this.$el);
            return this;
        }
    });
});
