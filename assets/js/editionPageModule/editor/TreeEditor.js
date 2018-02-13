define([
    'jquery', 'lodash', 'backbone', 'tools',
    '../../Translater',
    'text!./TreeEditor.html',
    'backbone-forms',
    'fancytree'
], function($, _, Backbone, tools, translater, TreeEditor) {
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

        events: {
            "keypress input.value": "valueKeyPressed",
            "change input.value": "valueChanged"
        },

        // treeInserted is a callback for when tree is actually inserted in
        // DOM, operations made here are either no-op if tree is not in DOM,
        // or dysfunctionnal like the collapse tree feature.
        treeInserted: function(form) {
            if (!this.treeSource.fancytree) {
                // no tree, nothing to do
                return;
            }

            // ensure the opened form element actually contains an TreeEditor
            if (form.$el.find(".treeEditor").length == 0) {
                return;
            }

            // enable value input only after we have a tree to work with
            this.$el.find("input.value").attr("disabled", null);

            this.$tree.slimScroll({
                height: "150px",
                railVisible: true,
                alwaysVisible: true
            });

            var nodeId = this.model.get(this.options.key);
            if (nodeId) {
                // restore active node
                var activeNode = this.getNodeByKey(nodeId);
                if (!activeNode) {
                    console.warn("did not find node by id, something might be wrong, node id: ", nodeId);
                    return;
                }

                this.setActiveNode(activeNode);
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
                this.$tree.html(
                    "Error fetching provided url: " + this.treeSource.error.status + " (" + this.treeSource.error.statusText + ")<br>" +
                    "Please reload the page");
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
                    console.error("treeEditor: unexpected tree data", this.treeSource.data);
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

            // init acceptedValues for model
            var activeNode = this.model.get(this.options.key);
            if (activeNode) {
                activeNode = this.$tree.fancytree("getTree").getNodeByKey(activeNode);
                this.setAcceptedValues(activeNode);
            }

            // replace fancytreeactivate event with current
            this.$tree.off("fancytreeactivate").on("fancytreeactivate",
                _.bind(function(event, data){
                    this.setActiveNode(data.node);
                }, this)
            );
        },

        getNodeByKey: function(id) {
            if (!this.$tree) {
                return null;
            }
            return this.$tree.fancytree("getTree").getNodeByKey(id);
        },

        setActiveNode: function(node) {
            this.value = node.key;
            this.view.setValue(this.options.key, this.value);
            this.$el.find(".value").val(this.value);

            var path = node.data.fullpath;
            this.view.setValue(this.options.schema.options.path, path);
            this.$el.find(".path").val(path).attr("title", path);

            node.setActive(true, {
                noEvents: true
            });
            this.$tree.slimScroll({
                scrollTo: node.li.offsetTop - 50
            });

            // update acceptedValues
            this.setAcceptedValues(node);
        },

        // setAcceptedValues visits current activeNode and children and updates model.acceptedValues accordingly
        setAcceptedValues: function(activeNode) {
            if (!this.model.acceptedValues) {
                this.model.acceptedValues = [];
            }
            this.model.acceptedValues.length = 0;
            this.model.acceptedValues.push(activeNode.data.value);
            activeNode.visit(_.bind(function(child) {
                this.model.acceptedValues.push(child.data.value);
            }, this));
        },

        valueKeyPressed: function(e) {
            // trigger onchange event for input.value el on "enter" keypress
            if (e.keyCode === 13) {
                this.valueChanged(e);
            }
        },

        valueChanged: function(e) {
            var val = e.target.value;
            var node = this.getNodeByKey(val);
            if (!node) {
                this.$el.find(".value").val(this.value);
                tools.swal("error",
                    "editGrid.noNodeWithKey",
                    translater.getValueFromKey("editGrid.noNodeWithKeyMessage", {id: val}));
                return;
            }

            // activate node
            this.setActiveNode(node);
        },

        getValue: function() {
            return this.value;
        },

        render: function() {
            Backbone.Form.editors.Text.prototype.render.call(this);
            this.$el = $(_.template(TreeEditor)({
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
                console.error("TreeEditor: couldn't find suitable fetch url");
                return this;
            }

            // init tree
            this.initTree(url);

            return this;
        }
    });
});
