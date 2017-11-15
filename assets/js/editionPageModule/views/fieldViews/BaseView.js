define([
    'jquery', 'lodash', 'text!../../templates/GridRow.html',
    'backbone', 'backbone.radio', 'tools', '../../../Translater', 'i18n'
], function($, _, DefaultTemplate, Backbone, Radio, tools, Translater) {

    var translater = Translater.getTranslater();

    var BaseView = Backbone.View.extend({
        events: {
            'click #trash'          : 'removeView',
            'click #duplicate'      : 'copyModel',
            'click .settings'       : 'editField',
            'click .languages'      : 'editField',
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
            if (this.validationErrors) {
                delete(this.validationErrors[field]);
                this.$el.find("[name='" + field + "']").removeClass("error");
                if (Object.keys(this.validationErrors).length === 0) {
                    this.validationErrors = null;
                    this.$el.removeClass("validationError");
                }
            }

            // tricks for you : update value without re-rendering
            // since our render is wonky and breaks dom and we don't like it
            this.model.set(field, value, { silent: true });
        },

        setValidationErrors: function(errors) {
            if (!errors) return;

            this.validationErrors = errors;
            this.$el.addClass("validationError");
            _.each(this.validationErrors, _.bind(function(err, name) {
                this.$el.find("[name='" + name + "']").addClass("error");
            }, this));
        },

        initialize: function(options) {
            // todo fix all other views instead of savagely overriding template like that
            this.template   = _.template(DefaultTemplate);
            _.bindAll(this, 'render', 'removeView', 'editField', 'copyModel', 'destroy_view');
            this.model.bind('change', this.render);

            this.model.bind('destroy', this.destroy_view);

            this.el   = options.el;
            this.$container = options.$container;
            this.model.view = this;
            this.static = this.model.get('compulsory');
            this.formChannel = Backbone.Radio.channel('form');
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

        removeView: function() {
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
                            function () {
                                self.formChannel.trigger('remove', self.model.get('id'));
                            });
                    }, 200);
                }
            );
        },

        render: function() {
            // todo stop breaking DOM with this $.replaceWith, itsux
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

        /**
         * Send an event on form channel when user wants to edit field properties
         */
        editField: function() {
            this.formChannel.trigger('editField', this.model.get('id'));
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
