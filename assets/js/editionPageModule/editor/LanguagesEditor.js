define([
    'jquery', 'lodash', 'backbone', 'tools',
    'text!./LanguagesEditor.html',
    'backbone-forms'
], function($, _, Backbone, tools, AppearanceTemplate) {
    return Backbone.Form.editors.Base.extend({
        initialize: function(options) {
            // this option saves the day, it disallows parent form to break
            // our subforms validations. :+1:
            this.hasNestedForm = true;

            Backbone.Form.editors.Base.prototype.initialize.call(this, options);

            this.options = options;
            if (options.form && options.form.model) {
                this.data = options.form.model.get("translations");
            } else {
                this.data = options.form.data["translations"];
            }

            _.each(this.schema.languages, _.bind(function(options, lang) {
                // init empty lang dictionaries
                if (!this.data[lang])
                    this.data[lang] = {
                        Language: lang
                    };
            }, this));
            this.forms = {};
        },

        getValue: function() {
            return this.data;
        },

        validate: function() {
            Backbone.Form.editors.Base.prototype.validate.call(this);
            var errors = false;
            _.each(this.forms, _.bind(function(form, lang) {
                if (form.validate()) {
                    errors = true;
                    form.$actionner.addClass("error");
                } else {
                    form.$actionner.removeClass("error");
                }
            }, this));

            return errors? {type: "subform", message: null}: null;
        },

        render: function() {
            Backbone.Form.editors.Base.prototype.render.call(this);

            this.$el = $(_.template(AppearanceTemplate)({
                id: this.options.id,
                languages: this.schema.languages
            }));

            // generate one subform per language
            _.each(this.schema.languages, _.bind(function(options, lang) {
                // clone schema, we're gonna update it
                var schema = _.cloneDeep(this.schema.schema);

                // append extra validators for each target
                for(var i in options.extraValidators) {
                    var validator = options.extraValidators[i];
                    for(var j in validator.targets) {
                        var target = validator.targets[j];
                        if (!schema[target]) continue;

                        // init empty validators
                        if (!schema[target].validators)
                            schema[target].validators = [];

                        // push at beginning of array
                        schema[target].validators.unshift(validator);
                    }
                }

                var form = new Backbone.Form({
                    schema: schema,
                    data: this.data[lang]
                }).render();
                form.$el.attr("data-lang", lang);
                tools.appendRequired(form.$el, schema);
                this.forms[lang] = form;
                this.$el.append(form.$el);

                // <td> button for lang
                form.$actionner = this.$el.find("td.lang[data-lang='" + lang + "']");
                // remove error class from actionner if no more error in form
                form.$el.find("input, select, textarea").on("change", _.bind(function(e) {
                    $(e.delegateTarget).removeClass("error");
                    if (this.$el.find(".error").length === 1) {
                        this.$actionner.removeClass("error");
                    }
                }, form));
            }, this));

            // add click handlers on language buttons to switch form display
            this.$el.find("td.lang").on("click", _.bind(function(e) {
                var $target = $(e.delegateTarget);
                if ($target.hasClass("active")) {
                    return;
                }

                var lang = $target.attr("data-lang");

                // hide previously active
                this.$el.find("form.active").removeClass("active");
                this.$el.find("td.lang.active").removeClass("active");

                // display new active
                this.$el.find("form[data-lang='" + lang + "']").addClass("active");
                $target.addClass("active");
            }, this));

            // display first elem
            this.$el.find("td.lang").first().trigger("click");

            this.$el.i18n();
            this.setElement(this.$el);
            return this;
        }
    });
});
