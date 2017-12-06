define([
    'jquery', 'lodash', 'backbone',
    'text!./ChoicesEditor.html', 'text!./ChoiceRow.html',
    'backbone-forms'
], function($, _, Backbone, ChoicesTemplate, ChoiceRow) {
    return Backbone.Form.editors.Text.extend({
        events: {
            'change input': 'updateValue',
            'click .deleteOption': 'deleteOption',
            'click .addBtn': 'addOption'
        },

        // used if this.model.columnDefaults is not there
        defaultFallback: {
            isDefaultValue: false,
            fr: '',
            en: '',
            value: ''
        },

        initialize: function(options) {
            this.options = options;
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },

        reorderValues: function(updateElem) {
            _.each(this.value, _.bind(function(e, i) {
                if (updateElem) {
                    this.$el.find("tr[data-index='" + e.id + "']")
                        .attr("data-index", i);
                }
                e.id = i;
            }, this));
        },

        renderChoice: function(choice) {
            return _.template(ChoiceRow)(choice);
        },

        render: function() {
            this.reorderValues();
            this.$el = $(_.template(ChoicesTemplate)({
                id          : this.options.id,
                editorClass : this.options.schema.editorClass || '',
                fieldClass  : this.options.schema.fieldClass || 'form-group',
                iconClass   : this.options.iconClass || '',
                choices     : this.value,
                renderChoice: this.renderChoice,
                title       : this.schema.title == undefined ? this.  key : this.schema.title
            }));
            this.setElement(this.$el);
            return this;
        },

        updateValue: function(e) {
            var value = e.target.value;
            switch (e.target.type) {
                case "checkbox":
                    value = e.target.checked;
                    break;
            }

            var index = $(e.target).closest("tr.choice").data("index");
            var name = $(e.target).data("name");
            this.value[index][name] = value;
        },


        addOption: function() {
            var newChoice = this.options.model.columnDefaults;
            if (!newChoice) {
                newChoice = this.defaultFallback;
            }
            newChoice = _.clone(newChoice);
            newChoice.id = this.value.length;
            this.value.push(newChoice);
            this.$el.find("table").append(this.renderChoice(newChoice));
        },

        deleteOption: function(e) {
            var $row = $(e.target).closest("tr.choice");
            this.value.splice($row.data("index"), 1);
            this.reorderValues(true);
            $row.remove();
        },

        getValue: function() {
            return this.value;
        },

        setValue: function(value) {
            this.value = value;
        }
    });
});