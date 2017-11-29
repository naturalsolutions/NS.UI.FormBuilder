define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'jquery-ui',
    'autocompTree'
], function($, _, Backbone, BaseView) {

    var TreeViewFieldView = BaseView.extend({
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