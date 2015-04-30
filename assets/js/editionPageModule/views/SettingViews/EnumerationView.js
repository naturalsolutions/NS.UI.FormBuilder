define([
    'jquery',
    'marionette',
    'text!../../templates/settingViews/EnumerationViewTemplate.html',
    'backgrid',
], function($, Marionette, EnumerationViewTemplate, Backgrid) {

    /**
     * This model represents a choice of a list
     * Each choice has an id, a french label, an english label and a real value
     */
    var Choice = Backbone.Model.extend({

        /**
         * Default value
         */
        defaults : {
            en             : 'french label',
            fr             : 'English label',
            value          : 'val',
            isDefaultValue : false
        },

        /*initialize : function(options) {
            this.set(options)
        },*/

        /**
         * Return a choice as a JSON object
         *
         * @returns {{id: *, en: *, fr: *, value: *}}
         */
        toJSON : function() {
            return {
                id             : this.get('id'),
                en             : this.get('en'),
                fr             : this.get('fr'),
                value          : this.get('value'),
                isDefaultValue : this.get('isDefaultValue')
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
        model: Choice,

        /**
         * Check in the collection if almost one member is a default value
         *
         * @returns {boolean} if one attribute has a default value
         */
        hasADefaultValue : function() {
            var modelWithDefaultValue = this.filter(function(model) {
                return model.get("isDefaultValue");
            });

            return modelWithDefaultValue.length > 0;
        }
    });

    /**
     * EnumerationView
     */
    var EnumarationView = Backbone.Marionette.ItemView.extend({

        events : {
            "click #addChoice"                                  : 'addOption',
            'click #enumGrid tbody tr:last-child td:last-child' : 'trashClick',
            'click #enumGrid tbody input[type="checkbox"]'      : 'changeDefaultValue'
        },

        /**
         * Use custom template
         */
        template : function() {
            return _.template(EnumerationViewTemplate)();
        },

        /**
         * Initialize
         *
         * @param options options object
         */
        initialize : function(options) {
            this.model   = options.model;
            this.choices = new Choices(this.model.get('choices'));

            _.bindAll(this, 'template', 'addOption', 'trashClick', 'changeDefaultValue');
        },

        /**
         * Render callback
         */
        onRender : function() {
            this.initGrid();
        },

        changeDefaultValue : function(e) {
            var index           = $(e.target).parents('tr').index(),
                isChecked       = $(e.target).is(':checked'),
                collectionItem  = this.choices.at(index);

            if(this.model.get('multiple')) {

                //  We can have multiple default values
                var lastValues = this.model.get('defaultValue');

                if (isChecked) {
                    lastValues.push(collectionItem.get('id'));
                } else {
                    lastValues.splice(lastValues.indexOf(collectionItem.get('id')), 1);
                }

                this.model.set('defaultValue', lastValues);

            }   else {

                this.clearRadio();
                $(e.target).prop('checked', isChecked);

                //  If we can have only one default value we have one item array or empty
                this.model.set('defaultValue', isChecked ? [collectionItem.get('id')] : []);
            }
        },

        /**
         * Set all input unchecked
         */
        clearRadio : function() {
            this.$el.find('#enumGrid tbody input').prop('checked', false);
        },

        /**
         * Initialize backgrid and display grid
         */
        initGrid : function() {
            this.grid = new Backgrid.Grid({
                columns    : this.model.columns,
                collection : this.choices
            });

            this.$el.find('#enumGrid').html(this.grid.render().el);
        },

        /**
         * That callback add a new element on the grid with default attribute
         * The user can edit model attributes on the grid
         */
        addOption : function() {
            this.grid.insertRow( this.model.columDefaults );
        },

        /**
         * When user clicks on the trash icon we remove corresponding model from the collection
         *
         * @param e jquery Click event
         */
        trashClick : function(e) {
            //  The index of the tr corresponds to the model to remove id
            var modelToRemoveID = $(e.target).parents('tr').index(),
                modelToRemove   = this.choices.at(modelToRemoveID);

            //  We remove the element from the collection
            //  The gri is automatically updated
            this.choices.remove(modelToRemove);
        },

        /**
         * Return values if there is almost one default value
         *
         * @returns {*} List of values or undefined
         */
        commitValues : function() {
            this.model.set('choices', this.choices.toJSON());
        }

    });

    return EnumarationView;
});