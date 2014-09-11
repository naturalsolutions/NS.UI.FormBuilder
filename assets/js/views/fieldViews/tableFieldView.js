define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/tableFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var TableFieldView = BaseView.extend({

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
            _.bindAll(this, 'deleteSubView', 'renderSubView', 'render', 'addSubView');
        },

        addSubView : function(subViewID, subView, model) {
            this._subView[ _.size(this._subView)] = subViewID;
            this.model.addModel(model, subViewID);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            $('.tableField').droppable({
                accept : '.dropField',
                drop : _.bind(function(event, ui) {

                    // Check if the tableView is not empty
                    if ($(this.el).find('.empty').length > 0) {

                        require(['app/formbuilder'], _.bind(function(formbuilderInstance) {

                            var subViewID   = $(ui['draggable']).prop('id'),
                                subView     = formbuilderInstance.mainView.getSubView( subViewID ),
                                size        = 4 - $(this.el).find('.empty').length;

                            this.addSubView(subViewID, subView, subView.model)

                            $(this.el + ' #tableView' + size).switchClass('empty', 'used', 0)
                            $(this.el + ' #tableView' + size).find('i').remove();

                            subView.$el.remove();
                            setTimeout( _.bind(function() {
                                subView.$el.removeClass('dropField')
                                $(this.el + ' #tableView' + size).append(subView.$el );
                                subView.render();
                            }, this), 0)

                        }, this));

                    } else {
                        $(".dropArea").animate({ scrollTop: 0 }, "medium");
                        new NS.UI.Notification({
                            type    : 'warning',
                            title   : 'Limit :',
                            message : "You table field is full"
                        });
                    }

                }, this)
            });
            this.renderSubView();
            return this;
        },

        renderSubView : function() {
            require(['app/formbuilder'], _.bind(function(formbuilderInstance) {

                _.each(this._subView, _.bind(function(el, idx) {
                    if (el!= undefined && idx != undefined) {
                        this.$el.find('#tableView' + idx).append( formbuilderInstance.mainView.getSubView( el ).$el )
                        this.$el.find('#tableView' + idx).switchClass('empty', "used", 0);
                        formbuilderInstance.mainView.getSubView( el ).render();
                    }
                }, this));

            }, this));
        },

        deleteSubView : function(event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('tableView', '');
            this.model.removeModel( index );
            $(event.target).replaceWith(
                '<div class="span6 empty" id="' + $(event.target).prop('id') + '"><i class="fa fa-plus-square-o "> Drop field here</i></div>'
            )
        }

    });

	return TableFieldView;

});