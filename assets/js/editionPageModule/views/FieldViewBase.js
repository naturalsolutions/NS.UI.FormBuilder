define([
    'jquery', 'lodash', 'text!../templates/GridRow.html',
    'backbone', 'backbone.radio', 'tools', '../../Translater',
    './loaders/ContextLoader', 'i18n'
], function($, _, DefaultTemplate, Backbone, Radio, tools, translater, ContextLoader) {

    return Backbone.View.extend({
        events: {
            'click #trash'          : 'removeView',
            'click .settings'       : 'editSettings',
            'click .languages'      : 'editLanguages',
            'change input'          : 'inputChanged',
            'change select'         : 'selectChanged',
            'focus input, select'   : 'focusField',
        },

        template: _.template(DefaultTemplate),

        focusField: function() {
            this.formChannel.trigger("setSelected", this.model);
        },

        selectChanged: function(e) {
            this.setValue(e.target.name, e.target.selectedOptions[0].value);
        },

        inputChanged: function(e) {
            if (!e.target.name) return;

            var field = $(e.target).data("field");
            var value;
            var error;

            if (field) {
                value = field.editor.getValue();
                error = field.editor.$el.find(".error").length > 0;
                field = field.key;
            } else {
                field = e.target.name;
                switch(e.target.type.toLowerCase()) {
                    case "checkbox":
                        value = e.target.checked;
                        break;
                    default:
                        value = e.target.value;
                        break;
                }
            }

            this.setValue(field, value, error);
        },

        setValue: function(field, value, forcedError) {
            this.options.collection.pendingChanges = true;

            // remove validation error for modified field
            if (this.validationErrors && this.validationErrors[field] && !forcedError) {
                var err = this.validationErrors[field];
                this.clearValidationError(err, field);
            }

            // tricks for you : update value without re-rendering
            // since our render is wonky and breaks dom and we don't like it
            this.model.set(field, value, { silent: true });
        },

        setErrorMessage: function($el, message) {
            // does $el have its own editor? validate it if so
            if ($el.data("editor")) {
                $el.data("editor").validate();
                return;
            }

            if (!message)
                message = ""; // force empty message

            var $helpBlock = $el.closest(".formField").find(".error-block");
            if ($helpBlock.length > 0) {
                $helpBlock.html(message);
            } else {
                // no .help-block, add error info on element's title attribute
                $el.attr("title", message);
            }
        },

        clearValidationError: function(err, name) {
            var $erronousField = err.$target.find("[name='" + name + "']");
            if ($erronousField.length === 0) {
                // try finding field instead
                $erronousField = err.$target.find(".field-" + name);
            }
            $erronousField.removeClass("error");
            $erronousField.closest(".error").removeClass("error");
            this.setErrorMessage($erronousField, null);
            if (err.$target.find(".error").length === 0) {
                this.$el.find(this.actionners[err.actionner]).removeClass("error");
            }
            delete(this.validationErrors[name]);
            if (Object.keys(this.validationErrors).length === 0) {
                this.validationErrors = null;
                this.$el.removeClass("validationError");
            }
        },

        clearAllErrors: function() {
            _.each(this.validationErrors, _.bind(function(err, name) {
                this.clearValidationError(err, name);
            }, this));
        },

        setValidationErrors: function(errors) {
            if (!errors || Object.keys(errors).length === 0)
                return;

            this.validationErrors = {};
            this.$el.addClass("validationError");

            // loop over errors found in model
            _.each(errors, _.bind(function(err, name) {
                // find for which of our this.$elements the error targets
                _.each(this.$elements, _.bind(function($viewEl, viewKey) {
                    var $erronousInput;
                    var skipFieldError = false;
                    if (err.type === "subform") {
                        // special case for subform error
                        $erronousInput = $viewEl.find(err.el);
                        skipFieldError = true;
                    } else {
                        $erronousInput = $viewEl.find("[name='" + name + "']");
                    }

                    if ($erronousInput.length > 0) {
                        // display error on parent element's button and $erronousInput
                        this.$el.find(this.actionners[viewKey]).addClass("error");
                        $erronousInput.addClass("error");

                        if (!skipFieldError)
                            $erronousInput.closest(".formField").addClass("error");

                        // set error message
                        this.setErrorMessage($erronousInput, err.message);

                        // keep track of which parent element contain this error
                        err.$target = $viewEl;
                        err.actionner = viewKey;

                        // save error
                        this.validationErrors[name] = err;
                    }
                }, this));
            }, this));
        },

        validate: function() {
            var err1, err2, err3;
            if (this.mainForm) {
                err1 = this.mainForm.validate();
            }
            if (this.extraForm) {
                err2 = this.extraForm.validate();
            }
            if (this.languageForm) {
                err3 = this.languageForm.validate();
            }

            var errors = Object.assign({}, err1, err2, err3);
            return Object.keys(errors).length > 0 ? errors: null;
        },

        initialize: function(options) {
            _.bindAll(this, 'render', 'removeView', 'editLanguages', 'editSettings', 'destroy_view');
            this.model.bind('change', this.render);

            this.model.bind('destroy', this.destroy_view);

            this.el   = options.el;
            this.$container = options.$container;
            this.context = options.context;
            this.columns = options.columns;
            this.schema = this.model.mainSchema(this.columns);
            this.options = options;
            this.model.view = this;
            this.static = this.model.get('compulsory');
            this.formChannel = Backbone.Radio.channel('form');
            this.validationErrors = null;

            // BaseView is splitted into several subviews
            // We'll keep track of them in this object for displaying validation errors
            this.$elements = {};
            this.actionners = {};

            // pre-generate subforms if field is not static
            if (!this.static) {
                this.editSettings(true);
                this.editLanguages(true);
            }
        },

        destroy_view: function() {
            this.model.unbind();
            this.remove();
        },

        removeView: function(confirmCallback) {
            // todo: not here at all
            var self = this;

            var loadedFieldWeight;

            var getLoadedFieldWeight = function () {
                var toret = "";

                if (self.collection.context == "track")
                {
                    if (loadedFieldWeight)
                        return (toret + loadedFieldWeight);
                    toret += "<br/><span id='contentDeleteField'><br /><img id='fieldDatasImg' src='assets/images/loader.gif' /></span>";
                }

                return (toret);
            };

            if (self.collection.context == "track")
            {
                $.ajax({
                    data: {},
                    type: 'GET',
                    url: self.collection.options.URLOptions.trackInputWeight + "WFBID/" + self.model.id,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: _.bind(function (data) {
                        data = JSON.parse(data);
                        loadedFieldWeight = "<br /><br />Liste des saisies pour le champ a supprimer :<br/>";
                        $.each(data.InputWeight, function (index, value) {
                            loadedFieldWeight += "<span>" + index + " : " + value + " saisies</span><br/>";
                        });
                        if ($("#fieldDatasImg").length > 0) {
                            $("#contentDeleteField").empty();
                            $("#contentDeleteField").append(loadedFieldWeight);
                        }
                    }, this),
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                    }, this)
                });
            }

            var extraSwalOpts = {
                buttons: {
                    cancel: translater.getValueFromKey('modal.clear.no'),
                    confirm: {
                        text: translater.getValueFromKey('modal.clear.yes'),
                        value: true,
                        className: "danger"
                    }
                }
            };

            tools.swal("warning",
                "modal.clear.title",
                "modal.clear.textinput",
                extraSwalOpts,
                null,
                function() {
                    setTimeout(function () {
                        tools.swal("warning",
                            "modal.clear.title2",
                            translater.getValueFromKey('modal.clear.textinput2'),
                            extraSwalOpts,
                            null,
                            confirmCallback);
                    }, 200);
                }
            );
        },

        render: function() {
            // first generate a template with provided columns
            var formTemplate = this.template({
                schema: this.schema,
                columns: this.columns,
                model: this.model
            });
            // feed this template to BackboneForm
            this.mainForm = new Backbone.Form({
                model: this.model,
                schema: this.schema,
                template: _.template(formTemplate)
            }).render();

            // do the voodoo for replacing element with currently rendered element
            // todo stop breaking DOM with this $.replaceWith, it (really) sux
            this.$el = $(this.mainForm.$el);
            var $placeholder = $(this.$container).find(this.el);
            this.$el.attr("id", $placeholder.attr("id"));
            this.$el.addClass($placeholder.attr("class"));
            this.$el.i18n();
            if (this.static) {
                this.$el.find("input, select").attr("disabled", true);
            }
            $placeholder.replaceWith(this.$el);
            this.$elements.main = this.$el;
            this.actionners.main = "";

            // $el was replaced, we need to rebind the view's events
            this.delegateEvents();
            return this.$el;
        },

        editLanguages: function(initOnly) {
            this.languageForm = this.initForm("language", this.model.languagesSchema(), ".languages");
            if (initOnly === true) return;

            this.setValidationErrors(this.validationErrors);
            this.formChannel.trigger('editField',
                this.model, "editGrid.manageLanguages", this.languageForm);
        },

        editSettings: function(initOnly) {
            this.extraForm = this.initForm("extra", this.model.extraSchema(this.columns), ".settings");
            if (initOnly === true) return;

            this.setValidationErrors(this.validationErrors);
            this.formChannel.trigger('editField',
                this.model, "editGrid.manageSettings", this.extraForm);
        },

        initForm: function(name, schema, actionner) {
            var form = this.makeForm(schema);
            this.actionners[name] = actionner;
            this.$elements[name] = form.$el;
            form.context = this.context;
            ContextLoader.loadFormData(this.context, form, this.options.urlOptions);
            return form;
        },

        makeForm: function(schema) {
            var form = new Backbone.Form({
                model: this.model,
                schema: schema
            });
            form.render();
            tools.appendRequired(form.$el, schema);
            form.$el.i18n();
            // listen to this.events from created backbone form
            this.delegateFormEvents(form);
            return form;
        },

        /**
         * delegateFormEvents applies events from this to provided form,
         * allowing this to catch events observed in form. The code is taken from
         * backbone's delegateEvents
         */
        delegateFormEvents: function(form) {
            if (!form) return;

            var splitter = /^(\S+)\s*(.*)$/;
            form.undelegateEvents();

            var events = this.events;
            if (typeof events === "function") {
                events = events();
            }
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method)) method = this[method];
                if (!method) continue;
                var match = key.match(splitter);
                form.delegate(match[1], match[2], _.bind(method, this));
            }
            return this;
        },

        /**
         * Change model order when view is sorted on form panel
         *
         * @param {interger} idx new order of the view
         */
        updateIndex: function(idx) {
            var order = parseInt(idx);
            this.options.collection.pendingChanges = true;
            this.model.set('order', order, { silent: true });
            this.$el.data('order', order);
            this.$el.attr('data-order', order);
        }
    });
});
