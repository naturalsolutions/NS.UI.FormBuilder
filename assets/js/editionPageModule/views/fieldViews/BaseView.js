define([
    'jquery', 'lodash', 'text!../../templates/GridRow.html',
    'backbone', 'backbone.radio', 'tools', '../../../Translater',
    '../loaders/ContextLoader', 'i18n'
], function($, _, DefaultTemplate, Backbone, Radio, tools, Translater, ContextLoader) {

    var translater = Translater.getTranslater();

    var BaseView = Backbone.View.extend({
        events: {
            'click #trash'          : 'removeView',
            'click #duplicate'      : 'copyModel',
            'click .settings'       : 'editSettings',
            'click .languages'      : 'editLanguages',
            'change input'          : 'inputChanged',
            'change select'         : 'selectChanged',
            'focus input, select'   : 'focusField',
        },

        focusField: function() {
            this.formChannel.trigger("setSelected", this.model);
        },

        selectChanged: function(e) {
            this.setValue(e.target.name, e.target.selectedOptions[0].value);
        },

        inputChanged: function(e) {
            var value;
            switch(e.target.type.toLowerCase()) {
                case "checkbox":
                    value = e.target.checked;
                    break;
                default:
                    value = e.target.value;
                    break;
            }
            this.setValue(e.target.name, value);
        },

        setValue: function(field, value) {
            // remove validation error for modified field
            if (this.validationErrors && this.validationErrors[field]) {
                var err = this.validationErrors[field];
                var $erronousField = err.$target.find("[name='" + field + "']");
                $erronousField.removeClass("error");
                this.setErrorMessage($erronousField, null);
                if (err.$target.find(".error").length === 0) {
                    this.$el.find(this.actionners[err.actionner]).removeClass("error");
                }
                delete(this.validationErrors[field]);
                if (Object.keys(this.validationErrors).length === 0) {
                    this.validationErrors = null;
                    this.$el.removeClass("validationError");
                }
            }

            // tricks for you : update value without re-rendering
            // since our render is wonky and breaks dom and we don't like it
            this.model.set(field, value, { silent: true });
        },

        setErrorMessage: function($el, message) {
            if (!message)
                message = ""; // force empty message

            var $helpBlock = $el.parent().find(".help-block[data-error]");
            if ($helpBlock.length > 0) {
                $helpBlock.html(message);
            } else {
                // no .help-block, add error info on element's title attribute
                $el.attr("title", message);
            }
        },

        setValidationErrors: function(errors) {
            if (!errors) return;

            this.validationErrors = {};
            this.$el.addClass("validationError");

            // loop over errors found in model
            _.each(errors, _.bind(function(err, name) {
                // find for which of our this.$elements the error targets
                _.each(this.$elements, _.bind(function($viewEl, viewKey) {
                    var $erronousInput = $viewEl.find("[name='" + name + "']");
                    if ($erronousInput.length > 0) {
                        // display error on parent element's button and $erronousInput
                        this.$el.find(this.actionners[viewKey]).addClass("error");
                        $erronousInput.addClass("error");

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

        initialize: function(options) {
            // todo fix all other views instead of savagely overriding template like that
            this.template   = _.template(DefaultTemplate);
            _.bindAll(this, 'render', 'removeView', 'editLanguages', 'editSettings', 'copyModel', 'destroy_view');
            this.model.bind('change', this.render);

            this.model.bind('destroy', this.destroy_view);

            this.el   = options.el;
            this.$container = options.$container;
            this.context = options.context;
            this.options = options;
            this.model.view = this;
            this.static = this.model.get('compulsory');
            this.formChannel = Backbone.Radio.channel('form');

            // BaseView is splitted into several subviews
            // We'll keep track of them in this object for displaying validation errors
            this.$elements = {};
            this.actionners = {};

            // pre-generate subforms only if field is new and not static
            // this allows for validation errors to be properly displayed on new elements.
            // If element is not new, extra forms will be generated on-demand (no risk
            // of validation error if values are not modified on existing input properties)
            if (this.model.get("new") && !this.static) {
                this.initExtraForm();
                this.initLanguageForm();
            }
        },

        destroy_view: function() {
            this.$el.slideUp(_.bind(function() {
                // TODO undelegate ?
                this.undelegateEvents();

                this.$el.removeData().unbind();
                this.model.unbind();
                this.remove();
                Backbone.View.prototype.remove.call(this);
            }, this))
        },

        removeView: function(confirmCallback) {
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

            var customSwalRemoval = function(){
                $(".sweet-overlay").remove();
                $(".sweet-alert").remove();
            };
            var extraSwalOpts = {
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : translater.getValueFromKey('modal.clear.yes'),
                cancelButtonText   : translater.getValueFromKey('modal.clear.no')
            };

            tools.swal("warning",
                "modal.clear.title",
                "modal.clear.textinput",
                extraSwalOpts,
                customSwalRemoval,
                function() {
                    setTimeout(function () {
                        tools.swal("warning",
                            "modal.clear.title2",
                            translater.getValueFromKey('modal.clear.textinput2') + getLoadedFieldWeight(),
                            $.extend(extraSwalOpts, {html: true}),
                            null,
                            confirmCallback);
                    }, 200);
                }
            );
        },

        render: function() {
            // todo stop breaking DOM with this $.replaceWith, it (really) sux
            this.$el = $(this.template(this.model.toJSON()));
            var $placeholder = $(this.$container).find(this.el);
            this.$el.attr("id", $placeholder.attr("id"));
            this.$el.addClass($placeholder.attr("class"));
            this.$el.i18n();
            if (this.static) {
                this.$el.find("input, select").attr("disabled", true);
            }
            var linkedField = this.model.get('linkedField');
            if (linkedField) {
                this.$el.find('.linkedField option').each(function() {
                    if (this.value === linkedField) {
                        $(this).attr("selected", true);
                    } else {
                        $(this).attr("selected", false);
                    }
                });
            }
            $placeholder.replaceWith(this.$el);
            this.$elements.main = this.$el;
            this.actionners.main = "";

            // $el was replaced, we need to rebind the view's events
            this.delegateEvents();
            return this.$el;
        },

        /**
         * Send event to the collection for duplicate this model
         */
        copyModel : function() {
            this.formChannel.trigger('copyModel', this.model.get('id'));
        },

        editLanguages: function() {
            if (!this.languageForm) {
                this.languageForm = this.initLanguageForm();
            }
            this.formChannel.trigger('editField',
                this.model, "editGrid.manageLanguages", this.languageForm);

            // redelegate events for this form, dom was fucked by editionPage
            this.delegateFormEvents(this.languageForm);
        },

        editSettings: function() {
            if (!this.extraForm) {
                this.extraForm = this.initExtraForm();
            }
            this.formChannel.trigger('editField',
                this.model, "editGrid.manageSettings", this.extraForm);

            // redelegate events for this form, dom was fucked by editionPage
            this.delegateFormEvents(this.extraForm);
        },

        initExtraForm: function() {
            this.extraForm = this.initForm("extra", this.model.extraSchema(), ".settings");
            return this.extraForm;
        },

        initLanguageForm: function() {
            this.languageForm = this.initForm("language", this.model.languagesSchema(), ".languages");
            return this.languageForm;
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
            this.model.set('order', parseInt(idx) + 1, { silent: true });
            this.$el.data('order', parseInt(idx) + 1);
        }
    });

    return BaseView;

});
