define([
    'jquery', 'marionette', 'text!../templates/LeftPanelView.html', 'i18n', 'jquery-ui'
], function($, Marionette, LeftPanelViewTemplate) {

    /**
     * Left panel view in the homepage layout, contains form to filter grid on the center view
     */
    var LeftPanelView = Backbone.Marionette.ItemView.extend({

        /**
         * Left panel view template
         */
        template : LeftPanelViewTemplate,

        /**
         * Event catch by the view
         */
        events : {
            'click #find' : 'runSearch',    //  when user submit form
            'click #clearForm' : 'clearForm',
            'keyup .form input' : 'removeEmptyClass'
        },

        /**
         * View constructor, init grid channel
         */
        initialize : function(options) {
            this.initGridChannel();
            this.URLOptions = options.URLOptions;
        },

        /**
         * Init grid channel
         * grid channel allows to communicate ONLY in the homepage layout
         */
        initGridChannel : function() {
            this.gridChannel = Backbone.Radio.channel('grid');
        },

        /**
         * #find click callback, send form values to the center view to update grid
         *
         * @param {[Object]} evt jQuery event
         */
        runSearch : function(evt) {
            var values = {};
            $.each(this.$el.find('form').serializeArray(), function(i, field) {
                if (field.value !== "") {
                    values[field.name] = field.value;
                }
            });

            if (!$.isEmptyObject(values)) {
                this.gridChannel.trigger('search', values);
            } else {
                this.$el.find('form').addClass('empty')
            }
        },

        removeEmptyClass : function() {
            this.$el.find('form').removeClass('empty')
        },

        /**
         * View rendering callbak
         */
        onRender : function(options) {
            this.$el.i18n(); // run i18nnext translation in the view context
            this.enableAutocomplete();
        },

        /**
         * Enable autocomplete with jquery ui on search form field
         */
        enableAutocomplete : function() {

            //  Enable autocomplete for form name search
            $.getJSON(this.URLOptions.formAutocomplete, _.bind(function(data) {
                this.$el.find('#name').autocomplete({
                    source : data.options
                })
            }, this));

            $.getJSON(this.URLOptions.keywordAutocomplete, _.bind(function(data) {
                this.$el.find('#keywords').autocomplete({
                    source : data.options
                })
            }, this));

            $.getJSON(this.URLOptions.usersAutocomplete, _.bind(function(data) {
                this.$el.find('#user').autocomplete({
                    source : data.options
                })
            }, this));
        },

        /**
         * Reset search form values
         * @param evt jquery Event
         */
        clearForm : function(evt) {
            this.$el.find('form').trigger("reset");
            this.gridChannel.trigger('resetCollection');
        }

    });

    return LeftPanelView;

});
