define([
    'jquery', 'lodash', 'backbone', 'tools',
    'text!./LanguagesEditor.html',
    'backbone-forms'
], function($, _, Backbone, tools, AppearanceTemplate) {
    return Backbone.Form.editors.Base.extend({
        initialize: function(options) {
            this.options = options;
            if (options.form && options.form.model) {
                this.data = options.form.model.get("translations");
            } else {
                this.data = options.form.data["translations"];
            }

            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
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

                this.$el.append(form.$el);
            }, this));

            // add click handlers on language buttons to display form
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
