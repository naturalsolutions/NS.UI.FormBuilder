define([
    'jquery',
    'marionette',
    'text!../../templates/settingViews/EnumerationViewTemplate.html',
    '../../modals/EnumerationModalView',
    'bootstrap'
], function($, Marionette, EnumerationViewTemplate, EnumerationModalView) {

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
            "click #addChoice": 'displayModalWithGrid'
        },

        /**
         * Use custom template
         */
        template : function() {
            var colmuns = _.map(this.model.columns, function(column) {
                return column.name;
            });
            colmuns.pop();

            return _.template(EnumerationViewTemplate)({
                collection : this.choices.toJSON(),
                columns : colmuns
            });
        },

        /**
         * Initialize
         *
         * @param options options object
         */
        initialize : function(options) {
            this.model   = options.model;
            this.choices = new Choices(this.model.get('choices'));

            _.bindAll(this, 'template', 'displayModalWithGrid');
        },

        /**
         * That callback add a new element on the grid with default attribute
         * The user can edit model attributes on the grid
         */
        displayModalWithGrid : function() {
            $('body').append('<div class="modal fade" id="grid-modal"></div>');

            this.enumerationModalView = new EnumerationModalView({
                el            : '#grid-modal',
                callback      : _.bind(this.commitValues, this),
                collection    : this.choices,
                columns       : this.model.columns,
                columDefaults : this.model.columDefaults
            }).render();
        },

        /**
         * Return values if there is almost one default value
         *
         * @returns {*} List of values or undefined
         */
        commitValues : function() {
            this.model.set('choices', this.choices.toJSON());
            this.enumerationModalView.close();
            $('.modal-backdrop').remove();
            this.render();
        }

    });

    return EnumarationView;
});