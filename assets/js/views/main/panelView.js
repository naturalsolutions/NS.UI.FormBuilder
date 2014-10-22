define(
    [
        'jquery',
        'underscore',
        'backbone',
        'text!../../../templates/main/panel.html',
        'models/fields',
        'jquery-ui',
        'nanoscroller',
        'NS.UI.Notification'
    ],
    function($, _, Backbone, panelViewTemplate, Fields) {

        var PanelView = Backbone.View.extend({

            events: {
                'click .fields': 'appendToDrop'
            },

            initialize: function(collection) {
                this.template   = _.template(panelViewTemplate);
                this._collection = collection;

                this.list = [], models = _.keys(Fields);
                models.shift()

                for (var el in models) {
                    if (Fields[models[el]].type !== undefined) {
                        this.list[ models[el] ] = {
                            i18n : models[el].replace('Field', '').toLowerCase()
                        }
                    }
                }

                _.bindAll(this, 'appendToDrop');
            },

            appendToDrop : function(e) {
                var elementClassName = $(e.target).data("type");

                if (Fields[elementClassName] !== undefined) {
                    this.collection.addElement(elementClassName);
                } else {
                    console.log(err)
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