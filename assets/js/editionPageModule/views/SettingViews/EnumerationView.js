define([
    'jquery',
    'marionette',
    'text!../../templates/settingViews/EnumerationViewTemplate.html',
    'backgrid'
], function ($, Marionette, EnumerationViewTemplate, Backgrid) {

    /**
     * This model represents a choice of a list
     * Each choice has an id, a french label, an english label and a real value
     */
    var Choice = Backbone.Model.extend({

        /**
         * Default value
         */
        defaults: {

            isDefaultValue: false,
            fr: 'French label',
            en: 'English label',
            value: 'val'
        },

        /**
         * Return a choice as a JSON object
         *
         * @returns {{id: *, en: *, fr: *, value: *}}
         */
        toJSON: function () {
            return {
                id: this.get('id'),
                isDefaultValue: this.get('isDefaultValue'),
                fr: this.get('fr'),
                en: this.get('en'),
                value: this.get('value')
            }
        }
    });


    /**
     * Simple to collection for backgrid that stocks all choices of a list
     */
    var Choices = Backbone.Collection.extend({
        /**
         * Model of the collection
         */
        model: Choice
    });

    /**
     * EnumerationView
     */
    var EnumarationView = Backbone.Marionette.ItemView.extend({

        events: {
            "click #addChoice": 'addOption'
        },

        /**
         * Use custom template
         */
        template: function () {
            return _.template(EnumerationViewTemplate)();
        },

        /**
         * Initialize
         *
         * @param options options object
         */
        initialize: function (options) {
            this.model = options.model;

            this.choices = new Choices(this.model.get('choices'));

            _.bindAll(this, 'template', 'addOption', 'trashClick');
        },

        /**
         * Render callback
         */
        onRender: function () {
            this.initGrid();
        },

        /**
         * Initialize backgrid and display grid
         */
        initGrid: function () {
            this.grid = new Backgrid.Grid({
                columns: this.model.columns,
                collection: this.choices,
                events : {
                    click : function(data){
                        var defaultval = $(data.target).find("input").val();
                        if (defaultval == "My first Option" || defaultval == "Mon option" ||
                            defaultval == "English value" || defaultval == "French label" ||
                            defaultval == "1" || defaultval == "Value")
                        {
                            $(data.target).find("input").val("");
                        }
                    }
                }
            });

            this.$el.find('#enumGrid').html(this.grid.render().el);
        },

        /**
         * That callback add a new element on the grid with default attribute
         * The user can edit model attributes on the grid
         */
        addOption: function () {
            this.grid.insertRow(this.model.columDefaults);

            var lastTd = this.$el.find('#enumGrid tbody tr:last-child td:last-child');
            lastTd.html('<span class="reneco trash"></span>');

            lastTd.bind('click', this.trashClick);
        },

        /**
         * When user clicks on the trash icon we remove corresponding model from the collection
         *
         * @param e jquery Click event
         */
        trashClick: function (e) {
            //  The index of the tr corresponds to the model to remove id
            var modelToRemoveID = $(e.target).parents('tr').index(),
                modelToRemove = this.choices.at(modelToRemoveID);

            //  We remove the element from the collection
            //  The gri is automatically updated
            this.choices.remove(modelToRemove);
        },

        /**
         * Return values if there is almost one default value
         *
         * @returns {*} List of values or undefined
         */
        commitValues: function () {
            this.model.set('choices', this.choices.toJSON());
        }

    });

    return EnumarationView;

});