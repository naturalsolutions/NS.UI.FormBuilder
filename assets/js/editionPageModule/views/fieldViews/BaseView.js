define([
    'jquery', 'lodash', 'text!../../templates/GridRow.html',
    'backbone', 'backbone.radio', 'tools', '../../../Translater', 'i18n'
], function($, _, DefaultTemplate, Backbone, Radio, tools, Translater) {

    var translater = Translater.getTranslater();

    /**
     *  Base view
     */
    var BaseView = Backbone.View.extend({
        events: {
            'click #trash'       : 'removeView',
            'click #duplicate'   : 'copyModel',
            'click #edit'        : 'editField',
            'focus input'        : 'updateSetting'
        },

        /**
         * Constructor
         */
        initialize: function(options) {
            // override template for now
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

        /**
         * Remove the view when the model is destroyed
         */
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

        /**
         * Send event for remove the view
         */
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
            this.$el = $(this.template(this.model.toJSON()));
            var $placeholder = $(this.$container).find(this.el);
            this.$el.attr("id", $placeholder.attr("id"));
            this.$el.i18n();
            if (this.static) {
                this.$el.find("input, select").attr("disabled", true);
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
            $(".actions").hide();

            //  The event is send to EditionPageController
            this.formChannel.trigger('editField', this.model.get('id'));
            this.$el.find('.element').addClass('selected');
        },

        /**
         * Re-enable actions when the edition is done or cancelled
         */
        enableActions : function() {
            // REMOVED FOR NOW this.$el.find('.actions').removeClass('locked');
            this.$el.find('.element').removeClass('selected');
        },

        /**
         * Change model order when view is sorted on form panel
         *
         * @param {interger} idx new order of the view
         */
        updateIndex: function(idx) {
            this.model.set('order', parseInt(idx) + 1);
            this.$el.data('order', parseInt(idx) + 1);
        }
    });

    return BaseView;

});
