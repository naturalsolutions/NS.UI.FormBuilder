define(['jquery', 'underscore', 'backbone', 'i18n'], function($, _, Backbone) {

    var fieldTemplate = _.template('\
        <div class="form-group padding5 paddingRight25 field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var models = {};

    models.BaseField = Backbone.Model.extend({

        defaults: {
            id      : 0,
            label   : "My label",
            name    : {
                label: {
                    value: "field",
                    lang : "en"
                },
                display_label: "field"
            },
            required: false,
            readOnly: false,
            isDragged : false
        },

        schema : {
            id : {
                type    : "Number",
                fieldClass : 'advanced',
                editorClass : 'form-control',
                template : fieldTemplate
            },
            label   : {
                type  : "Text",
                title : 'Label',
                editorClass : 'form-control',
                template : fieldTemplate
            },
            name : {
                type : 'Object',
                title : '&nbsp;',
                subSchema : {
                    label : {
                        title : '&nbsp;',
                        type : 'Object',
                        subSchema : {
                            value : { type : 'Text', title : 'Name label value', editorClass : 'form-control', template : fieldTemplate },
                            lang  : { type : 'Text', title : 'Name label lang', editorClass : 'form-control', template : fieldTemplate }
                        }
                    },
                    displayLabel : {
                        type : 'Text',
                        editorClass : 'form-control',
                        template : fieldTemplate
                    }
                }
            },
            required : {
                type : 'Checkbox',
                editorClass : 'span10'
            },
            readonly : {
                type : 'Checkbox',
                fieldClass : 'advanced',
                editorClass : 'span10'
            }
        },

        getXML: function() {
            return  "<label>" + this.get('label') + '</label>' +
                    "<name>" +
                    "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                    "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                    "</name>" +
                    "<required>" + this.get('required') + '</required>' +
                    "<readOnly>" + this.get('readOnly') + '</readOnly>';
        },

        isAdvanced : function(index) {
            return this.getSchemaProperty(index, 'advanced') === "advanced";
        }

    });

    models.HiddenField = Backbone.Model.extend({
        defaults: {
            id: 0,
            name: {
                label: {
                    value: "field",
                    lang: "en"
                },
                displayLabel: "field"
            },
            value: ""
        },

        schema: {
            id: {
                type: 'Number'
            },
            name: {
                type: 'Object',
                subSchema : {
                    label : {
                        type :'Object',
                        subSchema : {
                            value : { type : 'Text', editorClass : 'span10' },
                            lang  : { type : 'Text', editorClass : 'span10' }
                        }
                    },
                    displayLabel : {
                        type : 'Text',
                        editorClass : 'span10'
                    }
                }
            },
            value: {
                type : 'Text',
                editorClass : 'span10'
            }
        },

        getSchemaProperty: function(index, property) {
            models.BaseField.prototype.getSchemaProperty.apply(this, arguments);
        },

        changePropertyValue: function(index, value) {
            models.BaseField.prototype.changePropertyValue.apply(this, arguments);
        },

        getXML: function() {
            return "<name>" +
                "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                "</name>" +
                "<value>" + this.get('value') + '</value>';
        }
    }, {
        type   : 'Hidden',
        xmlTag : 'field_hidden',
        i18n   : 'hidden'
    });

    models.HorizontalLineField = Backbone.Model.extend({}, {
        type   : 'HorizontalLine',
        xmlTag : 'field_horizontalLine',
        i18n   : 'line'
    });

    //  ----------------------------------------------------
    //  Field herited by BaseField
    //  ----------------------------------------------------

    models.AutocompleteField = models.BaseField.extend({

        defaults: function() {
            return _.extend(models.BaseField.prototype.defaults, {
                defaultValue : "",
                hint         : "Write some text",
                url          : ""
            });
        },

        schema: function() {
            return _.extend(models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : 'Default value',
                    fieldClass : 'advanced',
                    editorClass : 'span10'
                },
                hint: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                url: {
                    type: 'Text',
                    editorClass : 'span10'
                }
            });
        },

        getXML: function() {
            var xml = models.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                            '<hint>'         + this.get('hint')         + '</hint>' +
                            '<url>'          + this.get('url')          + '</url>';
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Autocomplete",
        xmlTag : 'field_autocomplete',
        i18n   : 'autocomplete'
    });

    models.TextField = models.BaseField.extend({

        defaults : function() {
            return _.extend(models.BaseField.prototype.defaults, {
                defaultValue : "",
                hint         : "Write some text",
                size         : 255,
                multiline    : false
            });
        },

        schema: function() {
            return _.extend(models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    display     : 'Default value',
                    fieldClass : 'advanced',
                    editorClass : 'span10'
                },
                hint: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                size: {
                    type: 'Number',
                    editorClass : 'span10'
                }
            })
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = models.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<defaultValue>' + this.get('defaultValue') + '</defaultValue>' +
                            '<hint>'         + this.get('hint')         + '</hint>' +
                            '<size>'         + this.get('size')         + '</size>' +
                            '<multiline>'    + this.get('multiline')    + '</multiline>';
        }

    }, {

        type   : "Text",
        xmlTag : 'field_text',
        i18n   : 'text'
    });

    models.FileField = models.BaseField.extend({

        defaults: function() {
            return _.extend(models.BaseField.prototype.defaults, {
                defaultValue : "",
                file         : "",
                mimeType     : "*",
                size         : 200 //  specify max file size in ko
            })
        },

        schema: function() {
            return _.extend(models.BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title : 'Default value',
                    editorClass : 'span10'
                },
                file: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                mimeType: {
                    type: 'Text',
                    editorClass : 'span10'
                },
                size: {
                    type: 'Number',
                    title: "Maximum size",
                    editorClass : 'span10'
                }
            });
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            var xml = models.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    "<file>"         + this.get('file')         + '</file>' +
                            "<defaultValue>" + this.get('defaultValue') + '</defaultValue>' +
                            "<mimeType>"     + this.get('mimeType')     + '</mimeType>' +
                            "<size>"         + this.get('size')         + '</size>';
        }
    }, {
        type   : "File",
        xmlTag : 'field_file',
        i18n   : 'file'
    });

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

    models.TreeViewField = models.BaseField.extend({

        defaults: function() {
            return _.extend(models.BaseField.prototype.defaults, {
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
            return _.extend(models.BaseField.prototype.schema, {
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
            models.BaseField.prototype.initialize.apply(this, arguments);
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
            var xml = models.BaseField.prototype.getXML.apply(this, arguments);

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

    models.EnumerationField = models.BaseField.extend({

        defaults: function() {
            return _.extend(models.BaseField.prototype.defaults, {
                itemList: {
                    items: [{
                        id    : 0,
                        value : "0",
                        en    : "My first Option",
                        fr    : 'Mon option'
                    }, {
                        id    : 1,
                        value : "1",
                        en    : "My second Option",
                        fr    : 'Mon option 2'
                    }],
                    defaultValue: 1
                },
                multiple: false,
                expanded: false
            });
        },

        schema: function() {
            return _.extend(models.BaseField.prototype.schema, {
                itemList : {
                    type : 'Object',
                    title : '',
                    subSchema : {
                        defaultValue : { type : 'Text', editorClass : 'span10' },
                        items : {
                            type : 'List',
                            editorClass : 'itemList',
                            itemType : 'Object',
                            add : function() {
                                alert (true)
                            },
                            itemToString : function(item) {
                                return 'ID : ' + item.id + ', <b>EN label</b> : ' + item.en + ', FR label : ' + item.fr + ', value : ' + item.value;
                            },
                            subSchema : {
                                id    : { type : 'Number' },
                                value : { type : 'Text', title : 'Real value', validators : ['required'] },
                                en    : { type : 'Text', title : 'Text display in English', validators : ['required'] },
                                fr    : { type : 'Text', title : 'Text display in French', validators : ['required']}
                            }
                        }
                    }
                },
                expanded: {
                    type: 'Checkbox',
                    editorClass : 'span10'
                },
                multiple: {
                    type: 'Checkbox',
                    editorClass : 'span10'
                }
            });
        },


        /**
         * Constructor
         *
         * Get models.BaseField schema and add it on EnumerationField schema
         */
        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        },

        /**
         * Add an item on an itemList
         *
         * @param {integer} listIndex  itemList index
         * @param {object} element    element to add
         * @param {boolean} selected   if this element is the defaultValue
         */
        addOption: function(listIndex, element, selected) {
            this.get('items')[listIndex]['items'].push(element);
            if (selected) {
                this.get('items')[listIndex]['defaultValue'] = element['id'];
            }

            this.trigger('change');
        },

        /**
         * Remove an item from an itemList
         *
         * @param {integer} listIndex  index of the itemList
         * @param {integer} index      index of element to remove
         */
        removeOption: function(listIndex, index) {
            this.get("items")[listIndex].splice(index, 1);
            this.trigger('change');
        },

        /**
         * Return choosen item list elements
         *
         * @param {integer} itemListIndex  itemList index
         * @returns {array} itemList
         */
        getOption: function(itemListIndex) {
            return this.get('items')[itemListIndex];
        },

        /**
         * Return object XML content
         *
         * @returns {String} XML content
         */
        getXML: function() {
            var xml = models.BaseField.prototype.getXML.apply(this, arguments);

            xml += '<itemList>' +
                '<items>';
            _.each(this.get('itemList')['items'], function(el, idx) {
                xml += '<item id="' + el['id'] + '"><en>' + el['en'] + '</en><fr>' + el['fr'] + '</fr><value>' + el['value'] + '</value></item>';
            });
            xml += '</items>';
            xml += '<defaultValue>' + this.get('itemList')['defaultValue'] + '</defaultValue>';
            xml += '</itemList>';
            xml += '<expanded>' + this.get('expanded') + '</expanded>';
            xml += '<multiple>' + this.get('multiple') + '</multiple>';

            return xml;
        }

    });

    //  ----------------------------------------------------
    //  Field herited by TextField
    //  ----------------------------------------------------

    models.DateField = models.TextField.extend({

        defaults: function() {
            return _.extend(models.TextField.prototype.defaults(), {
                format: "dd/mm/yyyy"
            });
        },

        schema: function() {
            return _.extend(models.TextField.prototype.schema(), {
                format: {
                    type: 'Text',
                    editorClass : 'span10'
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        },
        getXML: function() {
            return models.TextField.prototype.getXML.apply(this, arguments) + '<format>' + this.get("format") + '</format>';
        }
    }, {
        type   : "Date",
        xmlTag : 'field_date',
        i18n   : 'date'
    });

    models.LongTextField = models.TextField.extend({

        defaults : function() {
            return _.extend(models.TextField.prototype.defaults(), {
                multiline : true
            });
        },

        schema: function() {
            return _.extend(models.TextField.prototype.schema(), {
                multiline : {
                    type : 'Checkbox',
                    editorClass : 'span10'
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
            this.set('multiline', true);
        },

        getXML: function() {
            return models.TextField.prototype.getXML.apply(this, arguments);
        }

    }, {
        type   : 'LongText',
        xmlTag : 'field_text',
        i18n   : 'long'
    });

    models.NumericField = models.TextField.extend({

        defaults: function() {
            return _.extend(models.TextField.prototype.defaults(), {
                minValue  : 0,
                maxValue  : 100,
                precision : 1,
                unity     : "meters"
            })
        },

        schema: function() {
            return _.extend(models.TextField.prototype.schema(), {
                minValue: {
                    type: 'Number'
                },
                maxValue: {
                    type: 'Number'
                },
                precision: {
                    type: 'Number'
                },
                unity: {
                    type: 'Text'
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);

            this.set('hint', 'Enter a numeric value');
        },

        getXML: function() {
            return models.TextField.prototype.getXML.apply(this, arguments) +
                '<min>'         + this.get("minValue")  + '</min>' +
                '<max>'         + this.get("maxValue")  + '</max>' +
                '<precision>'   + this.get("precision") + '</precision>' +
                '<unity>'       + this.get("unity")     + '</unity>';
        }
    }, {
        type   : 'Numeric',
        xmlTag : 'field_numeric',
        i18n   : 'numeric'
    });

    models.PatternField = models.TextField.extend({
        defaults: function() {
            return _.extend(models.TextField.prototype.defaults, {
                pattern: ""
            })
        },

        schema: function() {
            return _.extend(models.TextField.constructor.schema, {
                pattern: {
                    type: 'Text'
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        },

        getXML: function() {
            return models.TextField.prototype.getXML.apply(this, arguments) + "<pattern>" + this.get('pattern') + '</pattern>';
        }

    }, {
        type   : "Pattern",
        xmlTag : 'field_pattern',
        i18n   : 'mask'
    });

    //  ----------------------------------------------------
    //  Field herited by EnumerationField
    //  ----------------------------------------------------

    models.CheckBoxField = models.EnumerationField.extend({

        defaults : function() {
            return models.EnumerationField.prototype.defaults();
        },

        schema: function() {
            return models.EnumerationField.prototype.schema();
        },

        getXML: function() {
            return models.EnumerationField.prototype.getXML.apply(this, arguments);
        },

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);

            this.set('multiple', true);
            this.set('expanded', true);
        }

    }, {
        type   : 'CheckBox',
        xmlTag : 'field_list',
        i18n   : 'checkbox'
    });

    models.RadioField = models.EnumerationField.extend({
        defaults : function() {
            return models.EnumerationField.prototype.defaults();
        },

        schema : function() {
            return models.EnumerationField.constructor.schema;
        },

        getXML: function() {
            return models.EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
            this.set('multiple', false);
            this.set('expanded', true);
        }
    }, {
        type   : 'Radio',
        xmlTag : 'field_list',
        i18n   : 'radio'
    });

    models.SelectField = models.EnumerationField.extend({

        defaults : function() {
            return models.EnumerationField.prototype.defaults();
        },

        schema : function() {
            return models.EnumerationField.prototype.schema();
        },

        getXML: function() {
            return models.EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Select',
        xmlTag : 'field_list',
        i18n   : 'select'
    });

    models.SubformField = Backbone.Model.extend({
        defaults: {
            id       : 0,
            fields   : [],
            legend   : 'Fieldset',
            multiple : false
        },

        schema : {
            id       : { type : 'Number', title : 'ID', editorClass : 'span10', fieldClass : 'advanced' },
            multiple : { type : 'Checkbox', editorClass : 'span1', help : 'This fieldset can be present many times in one form' },
            legend   : { type : 'Text', editorClass : 'span10' }
        },

        initialize: function() {
            _.bindAll(this, 'addModel', 'removeModel', 'getXML', 'updateModel');
        },

        addModel: function(model, modelIndex) {
            var arr = this.get('fields');
            model.set('isDragged', true);
            arr.push(model);
            this.set('fields', arr);
        },

        removeModel: function(index) {
            var arr = this.get('fields');
            delete arr[index];
            this.set("fields", arr);
        },

        updateModel: function(index, from, to) {
            var arr = this.get('fields');
            var element = arr[from];
            arr.splice(from, 1);
            arr.splice(to, 0, element);
            this.set('fields', arr);
        },

        getXML: function() {
            var xml = '<legend>' + this.get('legend') + '</legend>';
            xml += '<multiple>' + this.get('multiple') + '</multiple>';
            _.each(this.get('fields'), function(el, idx) {
                xml += '<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>'
            });
            return xml;
        },

        changePropertyValue: function(index, value) {
            models.models.BaseField.prototype.changePropertyValue.apply(this, arguments);
        },
    }, {
        type   : 'Subform',
        xmlTag : 'fieldset',
        i18n   : 'fieldset'
    });

    models.TableField = Backbone.Model.extend({

        defaults: {
            fields: [],
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'moveModel', 'addModel', 'removeModel', 'getXML');
        },

        getXML: function() {
            var xml = models.BaseField.prototype.getXML.apply(this, arguments)
            _.each(this.get('fields'), function(el, idx) {
                xml += '<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>'
            });
            return xml;
        },

        addModel: function(model, modelIndex) {
            var arr = this.get('fields');
            model.set('isDragged', true);
            arr.push(model);
            this.set('fields', arr);
        },

        removeModel: function(index) {
            var arr = this.get('fields');
            delete arr[index];
            this.set("fields", arr);
        },

        moveModel: function(currentIndex, newIndex) {
            var arr = this.get('fields');

            if (arr[newIndex] !== undefined) {
                var tmp = arr[currentIndex];
                arr[currentIndex] = arr[newIndex];
                arr[newIndex] = tmp;
            } else {
                arr[newIndex] = arr[currentIndex];
                delete arr[currentIndex];
            }
            this.set('fields', arr);
            this.trigger('update', currentIndex, newIndex);
            this.trigger('done');
        }

    }, {
        type   : 'Table',
        xmlTag : 'field_table',
        i18n   : 'table'
    });

    return models;

});