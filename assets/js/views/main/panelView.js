define(
    [
        'jquery',
        'underscore',
        'backbone',
        'text!../../../../../templates/main/panel.html',
        'text!models/register.json',
        'i18n',
        'jqueryui',
        'nanoscroller',
        'NS.UI.Notification'
    ],
    function($, _, Backbone, panelViewTemplate, registeredField) {

        var PanelView = Backbone.View.extend({

            events: {
                'click .fields': 'appendToDrop'
            },

            initialize: function(collection) {
                this.template   = _.template(panelViewTemplate);
                this._collection = collection;

                this.list = [], register = $.parseJSON(registeredField)['registeredField'];

                for (var el in register) {
                    this.list[ register[el] ] = {
                        i18n : register[el].replace('Field', '').toLowerCase()
                    }
                }

                _.bindAll(this, 'appendToDrop');
            },

            appendToDrop : function(e) {
                var elementClassName = $(e.target).data("type");

                //elementClassName
                require(['models/' + elementClassName], _.bind(function(fieldModel) {

                    this.collection.addElement(elementClassName);

                }, this)/*, /*function(err) {
                    console.log(err)
                    new NS.UI.Notification({
                        type    : 'error',
                        title   : 'An error occured :',
                        message : "Can't create field object"
                    });

                }*/);
            },

            render: function() {
                var renderedContent = this.template({ list : this.list});
                $(this.el).html(renderedContent);
                $(this.el).nanoScroller();
                $('.fields').disableSelection();
                return this;
            }

        });

        return PanelView;

});