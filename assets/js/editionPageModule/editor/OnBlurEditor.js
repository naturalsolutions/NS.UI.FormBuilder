define([
  "jquery",
  "lodash",
  "backbone",
  "text!./OnBlurEditor.html",
  "../../onblur-page",
  "backbone-forms"
], function ($, _, Backbone, OnBlurEditorTemplate, onBlurPage) {
  return Backbone.Form.editors.Base.extend({
    template: OnBlurEditorTemplate,
    initialize: function (options) {
      this.options = options;
      Backbone.Form.editors.Base.prototype.initialize.call(this, options);
    },

    render: function () {
      this.$el = $(_.template(OnBlurEditorTemplate)({
        id: this.options.id,
        name: this.options.key,
        editorClass: this.options.schema.editorClass || "",
        value: this.value
      }));
      this.setElement(this.$el);
      return this;
    },

    events: {
      "click .js-btn-onblur": "onBlur"
    },

    onBlur: function () {
      var self = this;
      console.log("this.value: ", this.value);
      var el = document.createElement("div");
      el.className = "onblur-editor onblur-editor-modal";
      document.getElementsByTagName("body")[0].append(el);
      var vm = onBlurPage.init(el);
      vm.$on("complete", function (value) {
        console.log("tu as choisi: " + value);
        self.value = value;
        self.setValue(value, true);
        vm.$el.remove();
        vm.$destroy();
      });
    },

    getValue: function () {
      console.log("getValue", this.value);
      return this.value;
    },

    setValue: function (value) {
      console.log("setValue", value);
      this.value = value;
      this.$el.find("input").val(value);
      if (this.model && this.model.view && this.model.view.setValue) {
        console.log('la')
        this.model.view.setValue(this.options.key, value);
      } else if (this.model) {
        console.log('ici')
        this.model.set(this.options.key, value, {trigger: true});
      }
    }
  });
});