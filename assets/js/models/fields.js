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

    var checkboxFieldTemplate = _.template('\
        <div><div class="form-group row checkbox padding5 paddingRight25 field-<%= key %>">\
            <div data-editor class="col-md-2" >\
                <p class="help-block" data-error></p>\
            </div>\
            <label class="control-label left" for="<%= editorId %>"><%= title %></label>\
        </div>\
        <div class="row padding5 marginLeft10"><p class="help-block"><%= help %></p></div></div>\
    ');

    i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

    var models = {};

    models.BaseField = Backbone.Model.extend({

        defaults: {
            id          : 0,
            title       : "My label",
            name        : "Field",
            required    : false,
            readOnly    : false,
            isDragged   : false,
            editorClass : '',
            fieldClass  : ''
        },

        schema : {
            id : {
                type        : "Number",
                fieldClass  : 'advanced',
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            title   : {
                type        : "Text",
                title       : $.t('schema.title'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators : ['required']
            },
            name   : {
                type        : "Text",
                title       : $.t('schema.name'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            required : {
                type        : 'Checkbox',
                editorClass : 'form-control',
                template    : checkboxFieldTemplate,
                title       : $.t('schema.required')
            },
            readonly : {
                type        : 'Checkbox',
                editorClass : 'form-control',
                template    : checkboxFieldTemplate,
                title       : $.t('schema.readonly')
            },
            editorClass : {
                type        : "Text",
                title       : $.t('schema.editorClass'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            fieldClass : {
                type        : "Text",
                title       : $.t('schema.fieldClass'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            fieldSize : {
                type : 'Select',
                title       : $.t('schema.fieldSize'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                options : [$.t('schema.sizeValue.small'), $.t('schema.sizeValue.medium'), $.t('schema.sizeValue.large')]
            },
            endOfLine : {
                type        : 'Checkbox',
                editorClass : 'form-control',
                template    : checkboxFieldTemplate,
                title       : $.t('schema.eol')
            },
        },

        isAdvanced : function(index) {
            return this.getSchemaProperty(index, 'advanced') === "advanced";
        }

    });

    models.HiddenField = Backbone.Model.extend({
        defaults: {
            id    : 0,
            title : "My label",
            name  : "Field",
            value : ""
        },

        schema: {
            id: {
                type: 'Number',
                title : "ID"
            },
            name   : {
                type        : "Text",
                title       : 'Name',
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            title   : {
                type        : "Text",
                title       : $.t('schema.title'),
                editorClass : 'form-control',
                template    : fieldTemplate
            },
            value: {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : $.t('schema.value')
            }
        }
    }, {
        type   : 'Hidden',
        section : 'presentation',
        i18n   : 'hidden'
    });

    models.HorizontalLineField = Backbone.Model.extend({}, {
        type   : 'HorizontalLine',
        section : 'presentation',
        i18n   : 'line'
    });

    //  ----------------------------------------------------
    //  Field herited by BaseField
    //  ----------------------------------------------------

    models.AutocompleteField = models.BaseField.extend({

        defaults: function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
                defaultValue : "",
                help         : "Write some text",
                url          : "ressources/autocomplete/example.json"
            });
        },

        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : $.t('schema.default'),
                    fieldClass  : 'advanced',
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.help')
                },
                url: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.url')
                }
            });
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Autocomplete",
        section : 'autocomplete',
        i18n   : 'autocomplete'
    });

    models.TextField = models.BaseField.extend({

        defaults : function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
                defaultValue : "",
                help         : "Write some text",
                size         : 255,
                multiline    : false
            });
        },

        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : $.t('schema.default'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.help')
                },
                size: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.size'),
                    validators : [function checkValue(value, formValues) {
                        if (value < 0 || value > 255) {
                            return {
                                type : 'Invalid number',
                                message : "La taille doit être comprise en 0 et 255"
                            }
                        }
                    }]
                }
            })
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {

        type   : "Text",
        section : 'standard',
        i18n   : 'text'
    });

    models.FileField = models.BaseField.extend({

        defaults: function() {
            return _.extend({}, models.BaseField.prototype.defaults, {
                mimeType     : "*",
                size         : 200 //  specify max file size in ko
            })
        },

        schema: function() {
            return _.extend({}, models.BaseField.prototype.schema, {
                mimeType: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.mime')
                },
                size: {
                    type        : 'Number',
                    title       : "Maximum size",
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.size')
                }
            });
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : "File",
        i18n   : 'file'
    });

    var Node = Backbone.Model.extend({
        schema: {
            title: {
                type  : "Text",
                title : $.t('schema.title')
            },
            key: {
                type  : 'Number',
                title : $.t('schema.key')
            },
            folder: {
                type  : 'Checkbox',
                template : checkboxFieldTemplate,
                title : $.t('schema.readonly')
            }
        },

        initialize: function(options) {
        }
    });

    models.TreeViewField = models.BaseField.extend({

        defaults: function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
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
                webServiceURL : '',
                defaultNode: 0,
                multipleSelection: true,
                hierarchicSelection: false
            })
        },

        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultNode: {
                    type  : 'Number',
                    title : $.t('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                multipleSelection: {
                    type  : 'Checkbox',
                    title : $.t('schema.multipleSelection'),
                    editorClass : 'form-control',
                    template    : checkboxFieldTemplate
                },
                hierarchicSelection: {
                    type  : 'Checkbox',
                    title : $.t('schema.hierarchic'),
                    editorClass : 'form-control',
                    template    : checkboxFieldTemplate
                },
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.webServiceURL')
                }
            });
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'TreeView',
        i18n: 'tree'
    });

    models.EnumerationField = models.BaseField.extend({

        defaults: function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
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
                webServiceURL : "",
                multiple: false,
                expanded: false
            });
        },

        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.webServiceURL')
                },
                itemList : {
                    type : 'Object',
                    title : '',
                    subSchema : {
                        defaultValue : {
                            type        : 'Text',
                            editorClass : 'form-control',
                            template    : fieldTemplate,
                            title       : $.t('schema.default')
                        },
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
                                id    : {
                                    type  : 'Number',
                                    title : "ID"
                                 },
                                value : {
                                    type       : 'Text',
                                    title      : $.t('schema.real'),
                                    validators : ['required']
                                },
                                en    : {
                                    type : 'Text',
                                    title      : 'Text display in English',
                                    validators : ['required'] ,
                                    title      : $.t('schema.englishText')
                                },
                                fr    : {
                                    type       : 'Text',
                                    title      : $.t('schema.frenchText'),
                                    validators : ['required']
                                }
                            }
                        }
                    }
                },
                expanded: {
                    type: 'Checkbox',
                     editorClass : 'form-control', template : fieldTemplate
                },
                multiple: {
                    type: 'Checkbox',
                     editorClass : 'form-control', template : fieldTemplate
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
        }

    });

    //  ----------------------------------------------------
    //  Field herited by TextField
    //  ----------------------------------------------------

    models.DateField = models.TextField.extend({

        defaults: function() {
            return _.extend( {}, models.TextField.prototype.defaults(), {
                format: "dd/mm/yyyy"
            });
        },

        schema: function() {
            return _.extend( {}, models.TextField.prototype.schema(), {
                format: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.format')
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : "Date",
        i18n   : 'date'
    });

    models.LongTextField = models.TextField.extend({

        defaults : function() {
            return _.extend( {}, models.TextField.prototype.defaults(), {
                multiline : true
            });
        },

        schema: function() {
            var schema =  _.extend( {}, models.TextField.prototype.schema(), {
                multiline : {
                    type        : 'Checkbox',
                    editorClass : 'form-control',
                    template    : checkboxFieldTemplate,
                    title       : $.t('schema.multiline')
                }
            });
            schema.size.validators = [function checkValue(value, formValues) {
                if (value < 0 || value > 8000) {
                    return {
                        type : 'Invalid number', 
                        message : "La taille doit être comprise en 0 et 8000"
                    }
                }
            }];
            return schema;
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
            this.set('multiline', true);
        }

    }, {
        type   : 'LongText',
        i18n   : 'long'
    });

    models.NumericField = models.TextField.extend({

        defaults: function() {
            var baseSchema = _.pick(
                models.TextField.prototype.defaults(), _.keys(models.BaseField.prototype.defaults, 'help')
            );
            baseSchema.help = $.t('schema.numericHelp')
            return _.extend( {}, baseSchema, {
                minValue     : 0,
                maxValue     : 100,
                precision    : 1,
                decimal      : true,
                defaultValue : 10,
                unity        : "meters",
            })
        },

        baseSchema : {
            decimal : {
                    type        : 'Checkbox',
                    editorClass : 'form-control',
                    template    : checkboxFieldTemplate,
                    title       : $.t('schema.decimal')
                },
                defaultValue : _.pick(models.TextField.prototype.schema(), 'defaultValue')['defaultValue'],
                minValue: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.min')
                },
                maxValue: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.max'),
                    validators : [function checkValue(value, formValues) {
                        if (value < formValues['minValue']) {
                            return {
                                type : 'Invalid number',
                                message : "La valeur maximale est inférieure à la valeur minimale"
                            }
                        }
                    }]
                },
                precision: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    fieldClass  : 'advanced',
                    template    : fieldTemplate,
                    title       : $.t('schema.precision')
                },
                unity: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.unity')
                }
            },

        schema : function() {
            var schema = _.extend( {}, _.pick(models.TextField.prototype.schema(), _.keys(models.BaseField.prototype.schema), 'help'), this.baseSchema);

            schema.defaultValue.type = 'Number';
            schema.defaultValue.validators = [function checkValue(value, formValues) {
                if (value > formValues['maxValue']) {
                    return {
                        type : 'Invalid number',
                        message : "La valeur par défault est supérieur à la valeur maximale"
                    }
                } else if (value < formValues['minValue']) {
                    return {
                        type : 'Invalid number',
                        message : "La valeur par défault est inférieure à la valeur minimale"
                    }
                } else {
                    return undefined;
                }

            }]
            return schema;
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Numeric',
        i18n   : 'numeric'
    });

    //  Numeric field with range
    //  It's the same modal we change only constructor object
    models.NumericRangeField = models.NumericField.extend({

        defaults : function() {
            return models.NumericField.prototype.defaults()
        },

        schema : function() {
            return models.NumericField.prototype.schema()
        },

    }, {
        type   : 'NumericRange',
        i18n   : 'numericrange'
    });


    models.PatternField = models.TextField.extend({
        defaults: function() {
            return _.extend( {}, models.TextField.prototype.defaults, {
                pattern: ""
            })
        },

        schema: function() {
            return _.extend( {}, models.TextField.constructor.schema, {
                pattern: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.pattern')
                }
            });
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Pattern",
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

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);

            this.set('multiple', true);
            this.set('expanded', true);
        }

    }, {
        type   : 'CheckBox',
        i18n   : 'checkbox'
    });

    models.RadioField = models.EnumerationField.extend({
        defaults : function() {
            return models.EnumerationField.prototype.defaults();
        },

        schema : function() {
            return models.EnumerationField.constructor.schema;
        },

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
            this.set('multiple', false);
            this.set('expanded', true);
        }
    }, {
        type   : 'Radio',
        i18n   : 'radio'
    });

    models.SelectField = models.EnumerationField.extend({

        defaults : function() {
            return models.EnumerationField.prototype.defaults();
        },

        schema : function() {
            return models.EnumerationField.prototype.schema();
        },

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Select',
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
            id       : {
                type        : 'Number',
                title       : 'ID',
                editorClass : 'form-control',
                template    : fieldTemplate,
                fieldClass  : 'advanced'
            },
            multiple : { 
                type        : 'Checkbox',
                editorClass : 'form-control',
                template    : checkboxFieldTemplate,
                help        : 'This fieldset can be present many times in one form' ,
                title       : $.t('schema.multiple')
            },
            legend   : { 
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate ,
                title       : $.t('schema.legend')
            }
        },

        initialize: function(options) {
            _.bindAll(this, 'addModel', 'removeModel', 'updateModel');
        },

        addModel: function(model) {
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
        }
    }, {
        type   : 'Subform',
        i18n   : 'fieldset'
    });

    models.ThesaurusField = models.BaseField.extend({
        defaults: function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
                webServiceURL : 'ressources/thesaurus/thesaurus.json',
                defaultNode: ""
            });
        },
        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultNode: {
                    type  : 'Text',
                    title : $.t('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.webServiceURL')
                }
            });
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'Thesaurus',
        i18n: 'thesaurus'
    });

    models.AutocompleteTreeView = models.BaseField.extend({
        defaults: function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
                language    : { hasLanguage: true, lng: 'En' },
                wsUrl       : 'ressources/thesaurus',
                webservices : 'autocompleteTreeView.json',
                startId     : '85263',
                defaultNode : ""
            });
        },
        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultNode: {
                    type  : 'Text',
                    title : $.t('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                wsUrl : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.wsUrl')
                },
                webservices : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.ws')
                },
                language : {
                    type        : 'Select',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : $.t('schema.wslng'),
                    options : ["fr", "en"]
                }
            });
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'AutocompleteTreeView',
        i18n: 'autocomp'
    });

    return models;

});