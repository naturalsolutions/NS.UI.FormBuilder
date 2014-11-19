define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/main/formView.html',
    'autocompleteTreeView',
    'i18n',
    'jquery-ui',
    'perfect-scrollbar',
    'bootstrap'
], function($, _, Backbone, formViewTemplate, autocompTree) {

    var FormView = Backbone.View.extend({

        events: {
            'change #protocolName' : 'changeFormName'
        },

        initialize: function() {
            this.template = _.template(formViewTemplate);
            _.bindAll(this, 'render',
                            'addElement',
                            'changeFormName',
                            'updateView',
                            'getModel',
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

        addElement: function (newModel) {

            var viewClassName = newModel.constructor.type + "FieldView";

            if (newModel.constructor.type === "Numeric") {
                newModel.on('change:decimal', function(e) {
                    e.baseSchema['precision']['fieldClass'] = e.get('decimal') ? "advanced" : "";
                })
            }

            require(['views/fieldViews/' + viewClassName], _.bind(function(fieldView) {

                //  View file successfully loaded
                var id = "dropField" + newModel['id'];

                $('.drop').append('<div class="dropField " id="' + id  + '" ></div>');

                var vue = new fieldView({
                    el      : '#' + id,
                    model   : newModel,
                    collection : this.collection
               });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;

                    $("#scrollSection").scrollTop($("#scrollSection").height());
                    $("#scrollSection").perfectScrollbar('update');
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

            $("#scrollSection").perfectScrollbar({
                suppressScrollX : true
            });
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

        getJSON : function() {
            return this.collection.getJSON();
        },

        importJSON : function(JSONImport)  {
            this.collection.updateWithJSON(JSONImport);
        }
    });

return FormView;

});