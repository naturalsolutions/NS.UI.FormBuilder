
define(['jquery', 'underscore', 'backbone', 'backbone.radio', 'i18n'], function($, _, Backbone, Radio) {

    /**
     *  Base view
     */
    var BaseView = Backbone.View.extend({

        /**
         * Events for the intercepted by the view
         */
        events: {
            'click #trash'       : 'removeView',
            'click #duplicate'   : 'copyModel',
            'click #edit'        : 'editModel',
            'focus input'        : 'updateSetting',
            "isDropped"          : "isDropped"
        },

        /**
         * Constructor
         */
        initialize: function(options) {
            this.template   = _.template(options.template);
            _.bindAll(this, 'render', 'removeView', 'editModel', 'copyModel');
            this.model.bind('change', this.render);

            this.el = options.el;
            this.initFormChannel();
            this.initMainChannel();
        },

        /**
         * Initialize backbone radio form channel and listen events
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form')

            //  Disable actions
            //  Send by FormPanelView when user want to edit a field
            //  The goal is to hide action button like edit, duplicate and remove when the user is in edition mode
            this.formChannel.on('editForm', this.disableActions, this);
        },

        /**
         * Initialize edition channel, it's the global channel for edition section
         */
        initMainChannel : function() {
            //  The edition channel is the main channel ONLY in the editionPageModule
            this.mainChannel = Backbone.Radio.channel('edition');

            //  Re-enable action when field edition is done
            this.mainChannel.on('formCancel', this.enableActions, this);
            this.mainChannel.on('formCommit', this.enableActions, this);
            this.mainChannel.on('editionDone', this.enableActions, this);
        },

        /**
         * Remove view
         */
        removeView: function() {
            $(this.el).trigger('delete');
            $(this.el).remove();
            this.remove();
            this.formChannel.trigger('remove', this.model.get('id'))

            //  Prevent second trigger, i don't why i've this bug
            return false;
        },

        /**
         * Render view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).disableSelection();

            $(this.el).i18n();

            return this;
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
        editModel : function() {
            this.disableActions();
            this.formChannel.trigger('editModel', this.model.get('id'));
        },

        /**
         * Re-enable actions when the edition is done or cancelled
         */
        enableActions : function() {
            this.$el.find('.actions').removeClass('locked');
        },

        /**
         * Disable action when edition panel is displayed (form or field)
         */
        disableActions : function() {
            this.$el.find('.actions').addClass('locked');
        },

        /**
         * Change model order when view is sorted on form panel
         *
         * @param {interger} idx new order of the view
         */
        updateIndex: function(idx) {
            this.model.set('order', parseInt(idx) + 1);
            this.$el.data('order', parseInt(idx) + 1);
        },

        /**
         * Callback run when the wiew is dropped
         *
         * @param event jQuery event
         * @param data data passed
         */
        isDropped : function(event, data) {
            $('#' + data['id']).trigger('isDroppedReturn', [{
                subViewID : this.$el.attr('id'),
                subView : this
            }]);
        }
    });

    return BaseView;

});
