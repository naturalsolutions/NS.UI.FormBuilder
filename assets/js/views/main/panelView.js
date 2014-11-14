define(
    [
        'jquery',
        'underscore',
        'backbone',
        'text!../../../templates/main/panel.html',
        'models/fields',
        'jquery-ui',
        'perfect-scrollbar',
        'NS.UI.Notification'
    ],
    function($, _, Backbone, panelViewTemplate, Fields) {

        var PanelView = Backbone.View.extend({

            events: {
                'click .col-md-5': 'appendToDrop'
            },

            initialize: function(collection) {
                this.template   = _.template(panelViewTemplate);
                this._collection = collection;

                var section = { standard : {}, other : {} };

                for (var i in Fields) {
                    if (Fields[i].type !== undefined) {
                        if (Fields[i].section === undefined) {
                            section['other'][i] = {
                                i18n : i.replace('Field', '').toLowerCase()
                            }
                        } else {
                            if (section[Fields[i].section] === undefined) {
                                //  create new section
                                section[ Fields[i].section ] = {};
                            }
                            section[ Fields[i].section ][i] = {
                                i18n : i.replace('Field', '').toLowerCase()
                            }
                        }
                    }
                }

                this.section = section;

                _.bindAll(this, 'appendToDrop');
            },

            appendToDrop : function(e) {
                var elementClassName = $(e.target).data("type");

                if (Fields[elementClassName] !== undefined) {
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
                var renderedContent = this.template({
                    list : this.list,
                    section : this.section
                });
                $(this.el).html(renderedContent);
                $('.scroll').perfectScrollbar();
                $('.fields').disableSelection();
                this.$el.find('#accordion').accordion();
                return this;
            }

        });

        return PanelView;

});