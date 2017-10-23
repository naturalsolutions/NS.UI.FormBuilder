define([
    'jquery', 'marionette', '../../editionPageModule/collection/CollectionExtention',
    'text!../templates/LeftPanelView.html', 'i18n', 'jquery-ui', "eonasdan-bootstrap-datetimepicker"
], function($, Marionette, CollectionExtention, LeftPanelViewTemplate) {

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
            'click #searchBtn' : 'runSearch',
            'click .search-box .close' : 'clearForm',
            'keypress form input' : 'keypress'
        },

        /**
         * View constructor, init grid channel
         */
        initialize : function(options, readonly) {
            this.gridChannel = Backbone.Radio.channel('grid');
            this.gridChannel.on('contextChanged', this.setCustomSearchInputs, this);
            this.gridChannel.on('refresh', this.runSearch, this);
            this.URLOptions = options.URLOptions;
        },

        /**
         * keypress listener, triggers a new search if enter is pressed
         * @param e keypress event
         */
        keypress: function(e) {
            if (e.keyCode === 13) {
                this.runSearch();
            }
        },

        /**
         * #find click callback, send form values to the center view to update grid
         */
        runSearch : function() {
            var values = {};
            $.each(this.$el.find('form').serializeArray(), function(i, field) {
                if (field.value !== "") {
                    values[field.name] = field.value;
                }
            });

            if (!$.isEmptyObject(values)) {
                this.gridChannel.trigger('search', values);
            } else {
                this.gridChannel.trigger('resetCollection');
            }
        },

        /**
         * addCustomSearchInput inserts a custom search input in search section.
         * @param type - select / number / string
         * @param id - html id
         * @param title - label of input
         * @param options - for select input, list of options {0: {val, label},...}
         */
        addCustomSearchInput: function(type, id, title, options) {
            var $label = $("<label>");
            var $input;
            type = type.toLowerCase();

            switch (type) {
                case 'select':
                    $input = $("<select>");
                    // insert empty option
                    $input.append($("<option>"));
                    for (var i in options) {
                        var $opt = $("<option>");
                        var option = options[i];
                        $opt.attr("value", option.val).text(option.label);
                        $input.append($opt);
                    }
                    break;
                default:
                    $input = $("input");
                    $input.attr("type", type);
            }

            $input.addClass("form-control").attr("name", id);
            $label.attr("for", id).text(title);
            var $div = $("<div>");
            $div.addClass("form-group").addClass(id + "-group").addClass("custom");
            $div.append($label);
            $div.append($input);

            $(".search .customFilters").append($div);
        },

        /**
         * setSchemaExtension goes through provided schemaExtension and adds custom search
         * inputs for items that have "searchable" set to true.
         * @param schemaExtension
         */
        setCustomSearchInputs: function(context) {
            // clear custom filters
            var $form = $(".search form");
            $form.find(".customFilters").html('');

            if (!context) {
                return;
            }
            var ext = CollectionExtention.getModeExtention(context);
            if (!(ext && ext.extensionData)) {
                return;
            }
            var data = ext.extensionData;
            for (var i in data) {
                var ext = data[i];
                if (!ext["searchable"]) {
                    continue;
                }
                this.addCustomSearchInput(ext.type.toLowerCase(), i, ext.title, ext.options);
            }
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
            // todo auto-complete should take into consideration current context, which is not the case and is misleading
            // ideally it would use data already available in grid, instead of querying the back-end.
            // keywords auto-completion also needs proper implementation (right now it points to a static json) -
            // same idea it can use data available from unfiltered query.

            // disabled for now
            return;

            $.getJSON(this.URLOptions.formAutocomplete, _.bind(function(data) {
                this.$el.find('#search').autocomplete({
                    minLength: 2,
                    source : data.options,
                    appendTo : '#leftPanel form #name-group',
                    open : _.bind(function(event, ui) {
                        var inputWidth = this.$el.find('#name-group input').css('width');
                        $('.form-group ul, .form-group li').css('width', inputWidth);
                    }, this)
                });
            }, this));

            $.getJSON(this.URLOptions.keywordAutocomplete, _.bind(function(data) {
                this.$el.find('#keywords').autocomplete({
                    minLength: 2,
                    source : data.options,
                    appendTo : '#leftPanel form #keywords-group',
                    open : _.bind(function(event, ui) {
                        var inputWidth = this.$el.find('#name-group input').css('width');
                        $('.form-group ul, .form-group li').css('width', inputWidth);
                    }, this)
                });
            }, this));

            if (AppConfig.displayUserFilter) {
                $.getJSON(this.URLOptions.usersAutocomplete, _.bind(function(data) {
                    this.$el.find('#user').autocomplete({
                        minLength: 2,
                        source : data.options,
                        appendTo : '#leftPanel form #user-group',
                        open : _.bind(function(event, ui) {
                            var inputWidth = this.$el.find('#name-group input').css('width');
                            $('.form-group ul, .form-group li').css('width', inputWidth);
                        }, this)
                    });
                }, this));
            }
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
