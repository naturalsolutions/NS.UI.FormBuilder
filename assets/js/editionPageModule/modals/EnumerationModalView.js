define([
    'lodash',
    'backbone',
    'text!editionPageModule/templates/modals/EnumerationModalView.html',
    'backgrid',
    'bootstrap',
    'i18n'
], function(_, Backbone, EnumerationModalViewTemplate, Backgrid) {

    return Backbone.View.extend({

        events : {
            'click #enumGrid tbody tr                           :last-child td:last-child' : 'trashClick',
            'click #enumGrid tbody input[type="checkbox"]'      : 'changeDefaultValue',
            'click #saveChange'                                 : 'saveChange',
            'click #addOption'                                  : 'addOption'
        },

        /**
         * That callback add a new element on the grid with default attribute
         * The user can edit model attributes on the grid
         */
        addOption : function() {
            this.grid.insertRow( this.columDefaults );
        },

        template : function() {
            return _.template(EnumerationModalViewTemplate);
        },

        initialize : function(options) {
            _.bindAll(this, 'render', 'close', 'saveChange');

            this.choices       = options.collection;
            this.columns       = options.columns;
            this.callback      = options.callback;
            this.columDefaults = options.columDefaults;
        },

        initGrid : function() {
            this.grid = new Backgrid.Grid({
                columns    : this.columns,
                collection : this.choices,
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

            $('#enum-grid').html(this.grid.render().el);
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });
            $(this.el).i18n();

            this.initGrid();

            return this;
        },

        /**
         * Set all input unchecked
         */
        clearRadio : function() {
            this.$el.find('#enumGrid tbody input').prop('checked', false);
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
        saveChange : function() {
            this.callback(this.collection);
        },


        close : function() {
            this.$el.modal('hide').removeData();
            this.$el.html('').remove();
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

    });

});
