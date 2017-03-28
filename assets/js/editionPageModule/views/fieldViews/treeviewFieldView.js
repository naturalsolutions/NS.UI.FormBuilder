define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/treeviewFieldView.html',
    'text!editionPageModule/templates/fields/readonly/treeviewFieldView.html',
    'jquery-ui',
    'fancytree'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var TreeViewFieldView = BaseView.extend({
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            $('#treeview' + this.model.get('id')).autocompTree({
                source: [
                    {title: "Node 1", key: "1"},
                    {title: "Folder 2", key: "2", folder: true, children: [
                        {title: "Node 2.1", key: "3"},
                        {title: "Node 2.2" + this.model.get('defaultNode'), key: "4"}
                    ]}
                ],
                selectMode : 1,
                defaultkey : "" + this.model.get('defaultNode')
            });
        }
    });

	return TreeViewFieldView;

});