define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/subformFieldView.html',
    'text!editionPageModule/templates/fields/readonly/subformFieldView.html',
    'backbone.radio',
    '../../models/fields'
], function ($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, Radio, Fields) {

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

        initialize: function (options, readonly) {
            if (this.model.get("legend") == Fields.SubformField.prototype.defaults.legend)
                this.model.set("legend", this.model.get('legend') + " " + this.model.get('id'));
            var opt = options;
            opt.template = viewTemplate;
            opt.next     = 'nextFieldSet'
            if (readonly)
                opt.template = viewTemplateRO;

            BaseView.prototype.initialize.apply(this, [opt]);

            this.model.off('change');
            this.model.bind('change:legend', this.changeLegend, this);
            this.model.on('fieldAdded', this.fieldAdded, this);

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
            //TODO HERE THERE IS SOMETHING TO CHANGE ABOUT VIEW BEING SCREWED UP
            if (viewToMoveModel.get('subFormParent') == this.model.get('id'))
                console.log("Error, you are trying to reset his parentform to the field '" + viewToMoveModel.attributes.labelFr + "' !");
            else {
                viewToMoveModel.set('subFormParent', this.model.get('id'));
                viewToMoveModel.set('isUnderFieldset', true);
                viewToMoveModel.attributes.linkedFieldset = this.model.get('legend') + " " + this.model.cid;

                this.model.addField(viewToMoveModel);

                this.addSubView(viewToMoveModel);
            }
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
                start: function(event, ui) {
                    ui.item.startPos = ui.item.index();
                },
                cancel: null,
                cursor: 'pointer',
                axis: 'y',
                items: ".sortableRow",
                hoverClass: 'hovered',
                activeClass: 'hovered',
                stop: _.bind(function (event, ui) {
                    var id = ui.item[0].id,
                        from = ui.item.startPos,
                        to = ui.item.index() - 1;
                    /*
                    // HTMLT
                    this._subView.splice(this._subView.indexOf(id), 1);
                    this._subView.splice(to, 0, id);
                    */

                    // MAJ Model BB
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
         * Call execute when a field is added into the subForm view
         * The subForm view create the view for the new added field
         *
         * @param element new added field
         */
        fieldAdded : function(element) {
            this.addSubView(element);

        },

        /**
         * Render subView
         */
        renderSubView: function () {
            _.each(this.model.get('fieldsObject'), _.bind(function(model, idx) {
                this.addSubView(model);
            }, this));
        },

        /**
         * Change fieldset label when legend model attribute changed
         */
        changeLegend : function() {
            this.$el.find('.legend').text(this.model.get('legend'));
            var that = this;
            $.each(this.model.get('fields'), function(){
                this.attributes.linkedFieldset = that.model.get('legend') + " " + that.model.cid;
            });
        }

    });

    return SubformFieldView;

});