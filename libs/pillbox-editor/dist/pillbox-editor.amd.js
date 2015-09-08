define(['jquery', 'underscore', 'backbone', 'pillbox', 'backbone-forms'], function($, _, Backbone, pillbox) {

    var PillboxEditor = Backbone.Form.editors.Base.extend({

        tagName: 'input',

        /**
         * Initialize
         *
         * @param options editor options
         */
        initialize: function(options) {
            _.bindAll(this, 'setValue')
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
            this.template = this.constructor.template;

            this.AutocompleteURL    = options.schema.AutocompleteURL;
            this.AutocompleteValues = options.schema.AutocompleteValues;
            this.closeClass         = options.schema.closeClass || '';
            this.help               = options.schema.help || 'add item';
            this._values            = options.schema.value || [];
            this.key                = options.key;

            this.pillbox = null;
        },

        /**
         * Create pillbow editor
         *
         * @returns {PillboxEditor} return editor
         */
        render: function() {
            var $el = this.template(this);
            this.setElement($el);

            //
            //  There are two ways to use autocomplete
            //  You can pass an array with all values or an URL
            //  If both options are given, by default we use the raw values array
            //


            if (this.AutocompleteValues != undefined && this.AutocompleteValues.length > 0) {

                this.pillbox = this.$el.find('input[type="text"]').pillbox({
                    data : this.AutocompleteValues,
                    values : this._values
                });

            } else if (this.AutocompleteURL != undefined) {

                $.getJSON(this.AutocompleteURL, _.bind(function(data) {
                    this.pillbox = this.$el.find('input[type="text"]').pillbox({
                        data : data,
                        values : this._values
                    });
                }, this));

            } else {
                this.pillbox = this.$el.find('input[type="text"]').pillbox({
                    values : this._values
                });
            }

            return this;
        },

        /**
         * Return editor value
         *
         * @returns {Array} value
         */
        getValue: function() {
            return this.pillbox[0].getValues();

        },

        /**
         * Set editor value
         *
         * @param value new editor value
         */
        setValue: function(value) {
            this.pillbox[0].setValues(value);
        }

    }, {
        template: _.template(
            '<div class="pillbox" id="pillbox">\
                <input type="text" placeholder="<%= help %>">\
            </div>'
        )
    });

    return PillboxEditor;
});