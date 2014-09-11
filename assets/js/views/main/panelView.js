define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/model',
        'text!../../../../../templates/main/panel.html',
        'i18n',
        'jqueryui',
        'nanoscroller',
        'NS.UI.Notification'
    ],
    function($, _, Backbone, model, panelViewTemplate) {

        var PanelView = Backbone.View.extend({

            events: {
                'click .fields': 'appendToDrop'
            },

            initialize: function(collection) {
                this.template   = _.template(panelViewTemplate);
                this._collection = collection;

                this.list = [];
                _.each(model, _.bind(function(el, idx) {
                    if (el.type != undefined) {
                        this.list[idx] = {
                            i18n : el.i18n
                        }
                    }
                }, this));

                _.bindAll(this, 'appendToDrop');
            },

            appendToDrop : function(e) {
                var elementClassName = $(e.target).data("type");

                if (model[elementClassName] !== undefined) {
                    this.collection.addElement(elementClassName);
                } else {
                    new NS.UI.Notification({
                        type    : 'error',
                        title   : 'An error occured :',
                        message : "Can't create field object"
                    });
                }

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