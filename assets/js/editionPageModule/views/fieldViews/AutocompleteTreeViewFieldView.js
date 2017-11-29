   define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'jquery-ui',
    'autocompTree'
], function($, _, Backbone, BaseView) {

    var AutocompleteTreeViewFieldView = BaseView.extend({
        initialize : function(options) {
            var opt = options;
            BaseView.prototype.initialize.apply(this, [opt]);
            this.mainChannel = Backbone.Radio.channel('global');

            this.mainChannel.on('nodeSelected' + this.model.get('id'), _.bind(function(data) {
                var key     = data.node.key,
                    treeID  = '#treeViewtree'+ this.model.get('id');

                this.model.set('defaultNode', data.node.key);
                this.model.set('fullpath', data.node.data.fullpath);

                $(treeID).autocompTree("getTree").activateKey(key);
            }, this));
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            this.$el.find('#tree' + this.model.get('id')).autocompTree({
                language    : { hasLanguage: true, lng : this.model.get('language') },
                wsUrl       : 'ressources/thesaurus',
                webservices : 'autocompleteTreeView.json',
                startId     : '0'
            });
        }
    });

	return AutocompleteTreeViewFieldView;

});
