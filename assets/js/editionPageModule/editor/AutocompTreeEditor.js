define([
    'jquery', 'lodash', 'backbone', 'tools',
    'text!./AutocompTreeEditor.html',
    'backbone-forms',
    'fancytree'
], function($, _, Backbone, tools, AutocompTreeTemplate) {
    return Backbone.Form.editors.Text.extend({
        initialize: function(options) {
            this.options = options;
            this.model = this.options.model;
            this.view = this.model.view;
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },

        initTree: function(url) {
            this.treeSource = tools.getTree(url);
            if (this.treeSource.error) {
                this.$tree.html("Error fetching provided url: " + this.treeSource.error.status + " (" + this.treeSource.error.statusText + ")")
                return;
            }
            if (!this.treeSource.data) {
                return;
            }

            var data = this.treeSource.data.children;
            if (!data) {
                data = this.treeSource.data.d;
            }
            if (!data) {
                console.error("AutocompTreeEditor: unexpected tree data", this.treeSource.data);
                return;
            }

            this.$tree.empty().removeClass("loading").fancytree({
                source: data,
                activate: _.bind(function(event, data){
                    var value = data.node.key;
                    this.view.setValue(this.options.key, value);
                    this.$el.find(".value").val(value);

                    var path = data.node.data.fullpath;
                    this.view.setValue(this.options.schema.options.path, path);
                    this.$el.find(".path").val(path).attr("title", path);
                }, this)
            });

            var activeNode = this.model.get(this.options.key);
            if (activeNode) {
                activeNode = this.$tree.fancytree("getTree").getNodeByKey(activeNode);
                activeNode.setActive(true, {
                    noEvents: true
                });
                setTimeout(_.bind(function() {
                    this.$tree.slimScroll({
                        scrollTo: activeNode.li.offsetTop - 50
                    });
                }, this), 100);
            }

            this.$tree.slimScroll({
                height: "150px",
                railVisible: true,
                alwaysVisible: true
            });
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(AutocompTreeTemplate)({
                id: this.options.id,
                model: this.model,
                value: this.value,
                path: this.model.get(this.options.schema.options.path)
            }));
            this.$el.i18n();
            this.setElement(this.$el);
            this.$tree = this.$el.find(".tree");

            // get url by key, or from schema
            var url = this.options.model[this.options.key];
            if (!url) url = this.options.schema.defaultUrl;
            if (!url) {
                console.error("AutocompTreeEditor: couldn't find suitable fetch url");
                return this;
            }

            // start autocomp fun
            // todo autocompletion ;=
            this.initTree(url);

            return this;
        }
    });
});
