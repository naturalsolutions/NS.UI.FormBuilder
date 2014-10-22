define([
    'jquery',
    'underscore',
    'backbone',
    'views/fieldViews/baseView',
    'text!../../../templates/fieldView/thesaurusFieldView.html',
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
            this.mainChannel = Backbone.Radio.channel('global');

            this.mainChannel.on('nodeSelected' + this.model.get('id'), function(data) {

                //  URL ? data.node.key
                $(this.el).find('#tree').fancytree('getTree').rootNode = data.node;
                $(this.el).find('#tree').fancytree('getTree').reload(data.node.children);
                //console.log ($(this.el).find('#tree').fancytree('getTree'))

            });
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);
            require(['jquery-ui', 'fancytree'], _.bind(function() {
                $.getJSON('ressources/thesaurus/thesaurus.json', _.bind(function(data) {

                    $(this.el).find('#tree').fancytree({
                        source: data['d'],
                        checkbox : false,
                        selectMode : 2
                    });

                }, this)).error(function(a,b , c) {
                    alert ("can't load ressources !");
                })

            }, this));
        }
    });

	return TreeViewFieldView;

});