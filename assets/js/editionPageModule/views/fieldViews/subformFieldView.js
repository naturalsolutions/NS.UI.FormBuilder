define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/subformFieldView.html',
    'backbone.radio'
], function ($, _, Backbone, BaseView, viewTemplate, Radio) {

    var SubformFieldView = BaseView.extend({

        /**
         * View events
         *
         * @returns {object} view events
         */
        events: {
            //  Duplicate BaseView events
            'click #sub-trash'       : 'removeView',
            'click #sub-duplicate'   : 'copyModel',
            'click #sub-edit'        : 'editModel'
        },

        removeView : function() {
            BaseView.prototype.removeView.apply(this);
        },

        copyModel : function() {
            BaseView.prototype.copyModel.apply(this);
        },

        editModel : function() {
            BaseView.prototype.editModel.apply(this);
        },

        initialize: function (options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);

            this.model.off('change');

            this.model.bind('change:legend', this.changeLegend, this);

            _.bindAll(this, 'renderSubView', 'render');

            this.initCollectionViewAndChannel();
        },

        /**
         * Initialize collectionView channel, the collectionView channel is a private channel between the formView and the subForm views
         * It is used when view are added or removed from a subForm view
         */
        initCollectionViewAndChannel: function () {

            //  This channel is used between the form view and all subForm view
            //  The goal is to pass information when a view is dragged and dropped inside or outside of a subForm view
            this.collectionChannel = Backbone.Radio.channel('collectionView');

            //  Event like viewDropped:1
            //  Event send from formView when a view is dropped on the subForm view
            this.collectionChannel.on('viewDropped:' + this.model.get('id'), this.viewDropped, this);
        },

        /**
         * Event send by formPanelView when a view is dropped in a subForm view
         *
         * @param viewToMove view to move from the form panel to the subForm view
         */
        viewDropped: function (viewToMoveModel) {
            viewToMoveModel.set('subFormParent', this.model.get('id'));
            this.addSubView(viewToMoveModel);
        },

        render: function () {
            BaseView.prototype.render.apply(this, arguments);

            this.$el.find('.subformField').droppable({
                accept: '.dropField',
                hoverClass: 'hovered',
                activeClass: 'hovered',

                drop: _.bind(function (event, ui) {
                    //  When a view is dropped inside a subform
                    //  we send an event to the formView
                    this.collectionChannel.trigger('viewDrop', {
                        id: this.model.get('id'),
                        viewDroppedId: $(ui['draggable']).prop('id')
                    });
                }, this)
            });

            $(this.el).find('fieldset').sortable({
                cancel: null,
                cursor: 'pointer',
                axis: 'y',
                items: ".sortableRow",
                hoverClass: 'hovered',
                activeClass: 'hovered',
                stop: _.bind(function (event, ui) {
                    var id = $(ui.item).find('.subElement').prop('id'),
                        from = this._subView.indexOf(id),
                        to = $(ui.item).index() - 1;

                    this._subView.splice(this._subView.indexOf(id), 1);
                    this._subView.splice(to, 0, id);
                    this.model.updateModel(id, from, to);
                }, this)
            });

            this.renderSubView();
            return this;
        },

        addSubView : function(model) {
            require(['editionPageModule/views/fieldViews/' + model.constructor.type + 'FieldView'], _.bind(function(fieldView) {

                this.$el.find('fieldset').append('<div class="row sortableRow marginTop0" id="subView' + model.cid + '"></div>');

                var vue = new fieldView({
                    el         : '#subView' + model.cid,
                    model      : model
                });
                if (vue !== null) {
                    vue.render();
                }

                $(".actions").i18n();
            }, this));
        },

        /**
         * Render subView
         */
        renderSubView: function () {
            _.each(this.model.collection.models, _.bind(function(model, idx) {

                if (_.contains(this.model.get('fields'), model.get('name') )) {
                    this.addSubView(model)
                }

            }, this));
        },

        /**
         * Change fieldset label when legend model attribute changed
         */
        changeLegend : function() {
            this.$el.find('.legend').text(this.model.get('legend'))
        }

    });

    return SubformFieldView;

});