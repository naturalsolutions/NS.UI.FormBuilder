   define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
       'text!editionPageModule/templates/fields/AutocompleteTreeViewFieldView.html',
       'text!editionPageModule/templates/fields/readonly/AutocompleteTreeViewFieldView.html',
    'backbone.radio'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, Radio) {

    var AutocompleteTreeViewFieldView = BaseView.extend({
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
            this.mainChannel = Backbone.Radio.channel('global');

            this.mainChannel.on('nodeSelected' + this.model.get('id'), _.bind(function(data) {
                var key     = data.node.key,
                    treeID  = '#treeViewtree'+ this.model.get('id');

                $(treeID).fancytree("getTree").activateKey(key);
            }, this));
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            require(['jquery-ui', 'autocompleteTreeView'], _.bind(function() {
                this.$el.find('#tree' + this.model.get('id')).autocompTree({
                    language    : { hasLanguage: true, lng : this.model.get('language') },
                    wsUrl       : 'ressources/thesaurus',
                    webservices : 'autocompleteTreeView.json',
                    startId     : '85263'
	            });
            }, this));
        }
    });

	return AutocompleteTreeViewFieldView;

});
