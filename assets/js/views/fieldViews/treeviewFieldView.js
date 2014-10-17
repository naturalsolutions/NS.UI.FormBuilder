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
            require(['jquery-ui', 'fancytree'], _.bind(function() {
                $(this.el).find('#tree').fancytree({
                    source: [
                        {title: "Node 1", key: "1"},
                        {title: "Folder 2", key: "2", folder: true, children: [
                            {title: "Node 2.1", key: "3"},
                            {title: "Node 2.2", key: "4"}
                        ]}
                    ],
                    checkbox : true,
                    selectMode : 2
                });
            }, this));
        }
    });

	return TreeViewFieldView;

});