define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/subformFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var SubformFieldView = BaseView.extend({

        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'delete'        : 'deleteSubView'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
            this._subView = [];
            _.bindAll(this, 'deleteSubView', 'renderSubView', 'addSubView', 'render');
        },

        addSubView : function(subViewID, subView, model) {
            this._subView[ _.size(this._subView)] = subViewID;
            this.model.addModel(model, subViewID);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);

            $('.subformField').droppable({
                accept      : '.dropField',
                hoverClass  : 'hovered',
                activeClass : 'hovered',

                drop : _.bind(function(event, ui) {

                    require(['app/formbuilder'], _.bind(function(formbuilderInstance) {
                        var subViewID   = $(ui['draggable']).prop('id'),
                            subView     = formbuilderInstance.mainView.getSubView( subViewID );

                        this.addSubView(subViewID, subView, subView.model)

                        $(this.el + ' fieldset').append('<div class="row-fluid sortableRow"></div>');
                        subView.$el.switchClass('span12', 'span10 offset1',0);
                        subView.$el.switchClass('dropField', 'subElement',0);

                        subView.$el.remove();
                        setTimeout( _.bind(function() {
                            $(this.el + ' fieldset .row-fluid:last').append(subView.$el );
                            subView.render();
                        }, this), 0)

                    }, this));

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
            require(['app/formbuilder'], _.bind(function(formbuilderInstance) {

                _.each(this._subView, _.bind(function(el, idx) {
                    if (el!= undefined && idx != undefined) {
                        this.$el.find('fieldset').append(
                            '<div class="row-fluid subElement ' + (idx == 0 ? 'noMarginTop' : '' )+ '" id="' + el + '"></div>'
                        )
                        $(this.el + ' fieldset .row-fluid:last').append(formbuilderInstance.mainView.getSubView( el ).$el );
                        formbuilderInstance.mainView.getSubView( el ).render();
                    }
                }, this));

            }, this));
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