define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

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
            return _.extend(BaseField.schema, {
                defaultNode: {
                    type: 'Number'
                },
                multipleSelection: {
                    type: 'Checkbox'
                },
                hierarchicSelection: {
                    type: 'Checkbox'
                },
                node : {
                    type : 'Object',
                    subSchema : {
                        node : {
                            type : 'Object',
                            subSchema : {
                                title: {
                                    type: "string"
                                },
                                key: {
                                    type: 'Number'
                                },
                                folder: {
                                    type: 'Checkbox'
                                },
                                /*children: [{
                                    type: "node"
                                }]*/
                            }
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
        type   : 'TreeView',
        xmlTag : 'field_treeView',
        i18n   : 'tree'
    });

    return TreeViewField;

});