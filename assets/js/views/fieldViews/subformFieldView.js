define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/subformFieldView.html',
    'backbone.radio'
], function($, _, Backbone, BaseView, viewTemplate, Radio) {

    var SubformFieldView = BaseView.extend({

        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'delete'          : 'deleteSubView',
                'isDroppedReturn' : 'isDroppedReturn'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
            this._subView = [];

            this.collectionRef = options.collection;

            _.bindAll(this, 'deleteSubView', 'renderSubView', 'addSubView', 'render');

            this.collectionChannel = Backbone.Radio.channel('collection');

            //  Now we need to create a view for each view field
            //  And add this view to the subformfield view

            this.collectionChannel.on('subViewCreated/' + this.model.get('id'), _.bind(function(subView) {
                this._subView.push(subView)
            }, this));
        },

        addSubView : function(subViewID, subView, model) {
            this._subView[ _.size(this._subView)] = subViewID;
            this.model.addModel(model, subViewID);
        },

        isDroppedReturn : function(event, data) {
            var subViewID = data['subViewID'], subView = data['subView'];

            this.addSubView(subViewID, subView, subView.model)

            $(this.el + ' fieldset').append('<div class="row sortableRow"></div>');
            //subView.$el.switchClass('col-md-12', 'col-md-10 col-md-offset-1',0);
            subView.$el.switchClass('dropField', 'subElement',0);

            subView.$el.remove();
            setTimeout( _.bind(function() {
                $(this.el + ' fieldset .sortableRow').append(subView.$el );
                subView.render();
            }, this), 0)
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);

            $('.subformField').droppable({
                accept      : '.dropField',
                hoverClass  : 'hovered',
                activeClass : 'hovered',

                drop : _.bind(function(event, ui) {
                    //  Send and event to the dropped view
                    //  The dropped view return its backbone view
                    $(ui['draggable']).trigger("isDropped", [{
                        id : this.$el.attr('id')
                    }]);
                }, this)
            });

            $(this.el).find('fieldset').sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".sortableRow",
                hoverClass : 'hovered',
                activeClass : 'hovered',
                stop: _.bind(function(event, ui) {
                    var id      = $(ui.item).find('.subElement').prop('id'),
                        from    = this._subView.indexOf(id),
                        to      = $(ui.item).index() - 1;

                    this._subView.splice(this._subView.indexOf(id), 1);
                    this._subView.splice(to, 0, id);
                    this.model.updateModel(id, from, to);
                }, this)
            });

            this.renderSubView();
            return this;
        },

        renderSubView : function() {
            _.each(this.model.get('fields'), _.bind(function(el, idx) {

                //  Create a html element for the sub view
                $(this.el + ' fieldset').append('<div class="row-fluid sortableRow" id="subView' + this._subView.length + '"></div>');

                //  Create a view for each field
                this.collectionChannel.trigger('addSubView', {
                    field : el,
                    viewEl : '#subView' + this._subView.length,
                    id : this.model.get('id')
                });

            }, this))
        },

        deleteSubView : function(event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('subform', '');
            this.model.removeModel( index );
            $(event.target).replaceWith('')
        }

    });

	return SubformFieldView;

});