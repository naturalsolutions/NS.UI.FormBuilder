
define(['jquery', 'underscore', 'backbone', 'backbone.radio', 'i18n'], function($, _, Backbone, Radio) {

    /**
     *  Base view
     */
    var BaseView = Backbone.View.extend({

        /**
         * Events for the intercepted by the view
         */
        events: {
            'click  .trash' : 'removeView',
            'click .copy'   : 'copyModel',
            'focus input'   : 'updateSetting',
            "isDropped"     : "isDropped"
        },

        /**
         * Constructor
         */
        initialize: function(options) {
            this.template   = _.template(options.template);
            _.bindAll(this, 'render', 'removeView');
            this.model.bind('change', this.render);

            this.model.bind('destroy', function() {
                alert("destroy")
            })

            this.el = options.el;
            this.initFormChannel();
        },

        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form')
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
         * Update view index, sortable callback
         *
         * @param {interger} idx new index of the view
         */
        updateIndex: function(idx) {
            this.model.id = parseInt(idx);
        },

        isDropped : function(event, data) {
            $('#' + data['id']).trigger('isDroppedReturn', [{
                subViewID : this.$el.attr('id'),
                subView : this
            }]);
        }
    });

    return BaseView;

});
