define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/treeviewFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var TreeViewFieldView = BaseView.extend({
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            var src = this.model.get('node');
            require(['jqueryui', 'fancytree'], _.bind(function($) {
                $(this.el).find('#tree').fancytree({
                    source: src,
                    checkbox : true,
                    selectMode : 2
                });
            }, this));
        }
    });

	return TreeViewFieldView;

});