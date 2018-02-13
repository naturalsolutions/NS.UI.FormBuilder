define([
    'jquery', 'lodash', 'backbone',
    'backbone-forms'
], function($, _, Backbone) {
    return Backbone.Form.editors.Select.extend({
        events: {
            'change': 'updateNameProperty'
        },

        updateNameProperty: function(e) {
            if (!_.has(this, "schema.relatedNameProperty")) {
                console.warn("missing 'relatedNameProperty' in ChildFormEditor schema");
                return;
            }

            if (this.model && _.has(e, "delegateTarget.selectedOptions[0]")) {
                this.model.set(
                    this.schema.relatedNameProperty,
                    e.delegateTarget.selectedOptions[0].label,
                    { trigger: false });
            }
        }
    });
});
