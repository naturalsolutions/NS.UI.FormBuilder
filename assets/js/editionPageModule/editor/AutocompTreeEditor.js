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

            // detach tree when view closes, this allows to keep
            // fancytree up in the air for later re-appending
            this.view.off("close").on("close", _.bind(function() {
                if (this.$tree)
                    this.$tree.detach();
            }, this));

            // init some last things on fancytree when element gets inserted
            this.view.off("open").on("open", _.bind(this.treeInserted, this));

            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },

        // treeInserted is a callback for when tree is actually inserted in
        // DOM, operations made here are either no-op if tree is not in DOM,
        // or dysfunctionnal like the collapse tree feature.
        treeInserted: function(form) {
            if (!this.treeSource.fancytree) {
                // no tree, nothing to do
                return;
            }

            // ensure the opened form element actually contains an AutocompTreeEditor
            if (form.$el.find(".autocompTreeEditor").length == 0) {
                return;
            }

            this.$tree.slimScroll({
                height: "150px",
                railVisible: true,
                alwaysVisible: true
            });

            var activeNode = this.model.get(this.options.key);
            if (activeNode) {
                // restore active node
                activeNode = this.$tree.fancytree("getTree").getNodeByKey(activeNode);
                activeNode.setActive(true, {
                    noEvents: true
                });
                this.$tree.slimScroll({
                    scrollTo: activeNode.li.offsetTop - 50
                });
            } else {
                // collapse tree & unselect active node
                var previousActiveNode = this.$tree.fancytree("getActiveNode");
                while (previousActiveNode) {
                    previousActiveNode.setActive(false/*, {noEvents: true}*/);
                    previousActiveNode.setExpanded(false);
                    previousActiveNode = previousActiveNode.parent;
                }
            }
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

            if (!this.treeSource.fancytree) {
                var data = this.treeSource.data.children;
                if (!data) {
                    data = this.treeSource.data.d;
                }
                if (!data) {
                    console.error("AutocompTreeEditor: unexpected tree data", this.treeSource.data);
                    return;
                }

                this.$tree.empty().removeClass("loading");

                // cache fancytree from tools.getTree for later use
                this.treeSource.fancytree = $("<div>").fancytree({
                    source: data
                });
            }

            this.$tree.empty().removeClass("loading").append(
                this.treeSource.fancytree);
            this.$tree = this.treeSource.fancytree;

            // replace fancytreeactivate event with current
            this.$tree.off("fancytreeactivate").on("fancytreeactivate",
                _.bind(function(event, data){
                    this.value = data.node.key;
                    this.view.setValue(this.options.key, this.value);
                    this.$el.find(".value").val(this.value);

                    var path = data.node.data.fullpath;
                    this.view.setValue(this.options.schema.options.path, path);
                    this.$el.find(".path").val(path).attr("title", path);
                }, this)
            );
        },

        getValue: function() {
            return this.value;
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(AutocompTreeTemplate)({
                id: this.options.id,
                model: this.model,
                value: this.value,
                path: this.model.get(this.options.schema.options.path),
                key: this.key
            }));
            this.$el.i18n();
            this.setElement(this.$el);
            this.$tree = this.$el.find(".tree");

            // get url by key, it was put there by ThesaurusFieldView todo: NotLikeThis
            var url = this.options.model[this.options.key];
            if (!url) url = this.options.schema.defaultUrl;
            if (!url) {
                console.error("AutocompTreeEditor: couldn't find suitable fetch url");
                return this;
            }

            // init tree
            this.initTree(url);

            return this;
        }
    });
});
