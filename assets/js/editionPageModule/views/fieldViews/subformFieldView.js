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
        events: function () {
            return _.extend({}, BaseView.prototype.events, {
                'delete'         : 'deleteSubView',
                'isDroppedReturn': 'isDroppedReturn'
            });
        },

        initialize: function (options) {
            var opt = options;
            opt.template = viewTemplate;

            this._subView = []

            BaseView.prototype.initialize.apply(this, [opt]);

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
         * Event sned by formPanelView when a view is dropped in a subForm view
         *
         * @param viewToMove view to move from the form panel to the subForm view
         */
        viewDropped: function (viewToMove) {
            var viewToMoveDetech = $(viewToMove.el).detach();

            //  I don't why but the follow code don't work without a setTimeout
            //  I think the code is ran before the detach finish
            setTimeout(_.bind(function () {
                this.$el.find('.subformField fieldset').append(viewToMoveDetech);
                //  Add new view model
                this.model.addModel(viewToMove.model)
            }, this), 1);
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

        /**
         * Render subView
         */
        renderSubView: function () {
            _.each(this.model.get('fields'), _.bind(function (el, idx) {

                require(['editionPageModule/views/fieldViews/' + el.constructor.type + 'FieldView'], _.bind(function(fieldView) {

                    $(this.el + ' fieldset').append('<div class="row sortableRow marginTop0" id="subView' + el.cid + '"></div>');

                    var vue = new fieldView({
                        el         : '#subView' + el.cid,
                        model      : el
                    });
                    if (vue !== null) {
                        vue.render();
                    }

                    $(".actions").i18n();
                }, this));

            }, this))
        },

        /**
         * Remove the subView
         *
         * @param event jQuery event
         */
        deleteSubView: function (event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('subform', '');
            index = index.replace('dropField', '');

            this.model.removeModel(parseInt(index));

            $(event.target).replaceWith('');
        }

    });

    return SubformFieldView;

});