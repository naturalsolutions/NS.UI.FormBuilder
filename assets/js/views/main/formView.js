define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/main/formView.html',
    'i18n',
    'jqueryui',
    'nanoscroller',
    'bootstrap'
], function($, _, Backbone, formViewTemplate) {

    var FormView = Backbone.View.extend({

        events: {
            'change #protocolName' : 'changeFormName'
        },

        initialize: function() {
            this.template = _.template(formViewTemplate);
            _.bindAll(this, 'render',
                            'addElement',
                            'changeFormName',
                            'importXML',
                            'updateView',
                            'getModel',
                            'getXML',
                            "getSubView"
                    );
            this.collection.bind('newElement', this.addElement);
            this._view = [];
        },


        getSubView : function(subViewID) {
            return this._view[subViewID];
        },

        displayNotification : function(type, title, msg) {
            require(['NS.UI.Notification'], function() {
                new NS.UI.Notification({
                    type    : type,
                    title   : title,
                    message : msg
                });
            });
        },

        updateView : function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).find('#protocolName').val(this.collection.name);
        },

        addElement: function(newModel) {

            var viewClassName = newModel.constructor.type + "FieldView";

            require(['views/fieldViews/' + viewClassName], _.bind(function(fieldView) {

                //  View file successfully loaded
                var id = "dropField" + this.collection.length;

                $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');

                var vue = new fieldView({
                    el      : '#' + id,
                    model   : newModel,
                    collection : this.collection
               });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                }

                $(".actions").i18n();

            }, this), function(err) {
                new NS.UI.Notification({
                    type    : 'error',
                    title   : 'An error occured :',
                    message : "Can't create view for this field"
                });
            });
        },

        render: function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            var _vues = this._view;
            $(".drop").sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".dropField",
                handle      : '.fa-arrows',
                hoverClass : 'hovered',
                containement: '.dropArea',
                stop: function(event, ui) {
                    for (var v in _vues) {
                        _vues[v].updateIndex($('#' + v).index());
                    }
                }
            });
            return this;
        },

        getModel : function() {
            return this.collection.length;
        },

        changeFormName: function() {
            this.collection.name = $('#protocolName').val();
        },

        getXML : function() {
            return this.collection.getXML();
        },

        getJSON : function() {
            return this.collection.getJSON();
        },

        importXML: function(XMLImport) {
            this.collection.updateWithXML(XMLImport);
        },

        importJSON : function(JSONImport)  {
            this.collection.updateWithJSON(JSONImport);
        }
    });

return FormView;

});