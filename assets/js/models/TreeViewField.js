define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var Node = Backbone.Model.extend({
        schema: {
            title: {
                type: "Text"
            },
            key: {
                type: 'Number'
            },
            folder: {
                type: 'Checkbox'
            }
        },

        initialize: function(options) {
            
        }
    });

    var TreeViewField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                node: [{
                    title: "Node 1",
                    key: "1"
                }, {
                    title: "Folder 2",
                    key: "2",
                    folder: true,
                    children: [{
                        title: "Node 2.1",
                        key: "3"
                    }, {
                        title: "Node 2.2",
                        key: "4"
                    }]
                }],
                defaultNode: 0,
                multipleSelection: true,
                hierarchicSelection: false
            })
        },

        schema: function() {
            return _.extend(BaseField.prototype.schema, {
                defaultNode: {
                    type: 'Number'
                },
                multipleSelection: {
                    type: 'Checkbox'
                },
                hierarchicSelection: {
                    type: 'Checkbox'
                },
                node: {
                    type: 'List',
                    itemType: 'Object',
                    itemToString: function(node) {
                        return '<b>Title : </b>' + node.title + ', <b>Key : </b>' + node.key + ', <b>is a folder : </b>' + (node.folder ? 'Yes' : 'No');
                    },
                    subSchema: {
                        title: {
                            type: "Text"
                        },
                        key: {
                            type: 'Number'
                        },
                        folder: {
                            type: 'Checkbox'
                        },
                        children : {
                            type : 'List',
                            itemToString: function(node) {
                                return 'Children : <b>Title : </b>' + node.title + ', <b>Key : </b>' + node.key + ', <b>is a folder : </b>' + (node.folder ? 'Yes' : 'No');
                            },
                            itemType : 'NestedModel',
                            model : Node
                        }
                    }
                }
            });
        },

        initialize: function() {
            BaseField.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'getNodeXml', 'getXML');
        },

        getNodeXml: function(node) {
            var str = '<node>' +
                '   <title>' + node['title'] + '</title>' +
                '   <key>' + node['key'] + '</key>' +
                '   <folder>' + (node['folder'] === undefined ? "false" : node['folder']) + '</folder>';

            if (node['folder'] === true) {
                str += "<children>";
                _.each(node['children'], _.bind(function(subNode) {
                    str += this.getNodeXml(subNode);
                }, this));
                str += "</children>";
            }

            return str + '</node>';
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);

            xml += '<defaultNode>' + this.get('defaultNode') + '</defaultNode>' +
                '<multipleSelection>' + this.get('multipleSelection') + '</multipleSelection>' +
                '<hierarchicSelection>' + this.get('hierarchicSelection') + '</hierarchicSelection>';
            _.each(this.get('node'), _.bind(function(el) {
                xml += this.getNodeXml(el);
            }, this));


            return xml;
        }
    }, {
        type: 'TreeView',
        xmlTag: 'field_treeView',
        i18n: 'tree'
    });

    return TreeViewField;

});
