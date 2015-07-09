define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/thesaurusFieldView.html',
    'backbone.radio'
], function($, _, Backbone, BaseView, viewTemplate, Radio) {

    var TreeViewFieldView = BaseView.extend({

        events: function() {
            return _.extend({}, BaseView.prototype.events, {
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);

            this.initGlobalChannel();
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');

            this.globalChannel.on('nodeSelected' + this.model.get('id'), this.updateTreeView, this);
        },

        updateTreeView : function(data) {
            if (data['node']['children'] !== null) {
                $('#thesaurus' + this.model.get('id')).fancytree('getTree').reload({
                    children : data['node']['children']
                });
            } else {
                var arr = [];
                arr[0] = data.node;
                this.$el.first('.thesaurusField').fancytree('getTree').reload(arr);
            }
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            require(['jquery-ui', 'fancytree'], _.bind(function() {
                $.getJSON(this.model.get('webServiceURL'), _.bind(function(data) {

                    $('#thesaurus' + this.model.get('id')).fancytree({
                        source: data['d'],
                        checkbox : false,
                        selectMode : 2,
                        activeNode : 85265
                    });

                }, this)).error(function(a,b , c) {
                    alert ("can't load ressources !");
                });

            }, this));
        }
    });

	return TreeViewFieldView;

});