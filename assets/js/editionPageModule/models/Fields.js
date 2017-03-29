define([
    'jquery', 'underscore', 'backbone', '../../Translater', '../editor/CheckboxEditor', 'app-config',
    '../../homePageModule/collection/FormCollection', './ExtraContextProperties/ExtraProperties'
], function($, _, Backbone, Translater, CheckboxEditor, AppConfig, FormCollection, ExtraProperties) {

    var fieldTemplate = _.template('\
        <div class="form-group field-<%= key %>">\
            <label class="control-label" for="<%= editorId %>"><%= title %></label>\
            <div data-editor >\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
            </div>\
        </div>\
    ');

    var models = {}, translater = Translater.getTranslater();

    var Node = Backbone.Model.extend({
        schema: {
            title: {
                type  : "Text",
                title : translater.getValueFromKey('schema.title')
            },
            key: {
                type  : 'Number',
                title : translater.getValueFromKey('schema.key')
            },
            folder: {
                type        : CheckboxEditor,
                fieldClass : "checkBoxEditor",
                title : translater.getValueFromKey('schema.readonly')
            }
        },

        initialize: function(options) {
        }
    });

    var getFormsList = function(context){
        //TODO CHANGE THIS CRAP, LOAD FORMSLIST ON FORM LOADING AND NOT ON FIELD SETTINGS PANEL OPENING
        if (this.getFormsListResult && context.collection.name == this.savedCollectionName)
            return (this.getFormsListResult);
        var toret = [];
        if (AppConfig.config.options.URLOptions){
            var formCollection = new FormCollection({
                url : AppConfig.config.options.URLOptions.allforms + "/" + window.context
            });

            formCollection.fetch({
                async: false,
                reset : true,
                success : _.bind(function() {
                    $.each(formCollection.models, function(index, value){
                        if ((context.collection.name != value.attributes.name &&
                            (!value.attributes.context || value.attributes.context == window.context)) &&
                            !value.attributes.obsolete)
                        {
                            toret.push({"val" : value.attributes.id ,"label" : value.attributes.name});
                        }
                    });
                }, this)
            });

            this.getFormsListResult = toret;
            this.savedCollectionName = context.collection.name;

            return(toret);
        }
    };

    //  ----------------------------------------------------
    //  Field herited by BaseField
    //  ----------------------------------------------------

    var reorderProperties = function(jsonobject){
        var toOrder = {};
        $.each(jsonobject, function(index, value){
            if (value.after)
            {
                toOrder[index] = value;
                delete jsonobject[index];
            }
        });

        var toret = {};
        $.each(jsonobject, function(index, value){
            toret[index] = value;
            $.each(toOrder, function(subindex, subvalue){
               if(subvalue.after == index){
                   toret[subindex] = subvalue;
                   delete toOrder[subindex];
               }
            });
        });

        return toret;
    };

    models.BaseField = Backbone.Model.extend({

        defaults: {
            order       : 1,
            name        : "",
            labelFr     : "",
            labelEn     : "",
            required    : false,

            // Linked fields values GONE

            editMode    : {visible : true, editable : true, nullable : true, nullmean : false},
            isDragged   : false,
            showCssProperties   : false,
            editorClass : '',
            fieldClassEdit  : '',
            fieldClassDisplay  : '',
            atBeginingOfLine : false,
            fieldSize   : 12,
            linkedFieldset               : ''
        },

        schema : {
            labelFr   : {
                type        : "Text",
                title       : translater.getValueFromKey('schema.label.fr'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators : ['required'],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.label.fr')
                }
            },
            labelEn   : {
                type        : "Text",
                title       : translater.getValueFromKey('schema.label.en'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                validators : ['required'],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.label.en')
                }
            },
            name   : {
                type        : "Text",
                title       : translater.getValueFromKey('schema.name'),
                editorClass : 'form-control',
                template    : fieldTemplate,
                fieldClass  : 'marginBottom10',
                validators : ['required'],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.name')
                }
            },

            //  Linked field section
            isLinkedField : {
                type        : CheckboxEditor,
                fieldClass  : "checkBoxEditor",
                title       : translater.getValueFromKey('schema.isLinkedField') || "isLinkedField"
            },
            linkedFieldTable : {
                type : 'Select',
                title       : translater.getValueFromKey('schema.linkedFieldTable'),
                template    : fieldTemplate,
                editorClass : 'form-control',
                options : []
            },
            linkedField : {
                type : 'Select',
                title       : translater.getValueFromKey('schema.linkedField'),
                template    : fieldTemplate,
                editorClass : 'form-control',
                options : []
            },

            editMode : {
                type        : 'Object',
                subSchema   : {
                    visible : {
                        type: CheckboxEditor,
                        title: translater.getValueFromKey('schema.editMode.visible'),
                        fieldClass: "checkBoxEditor"
                    },
                    editable : {
                        type: CheckboxEditor,
                        title: translater.getValueFromKey('schema.editMode.editable'),
                        fieldClass: "checkBoxEditor"
                    },
                    nullable : {
                        type: CheckboxEditor,
                        title: translater.getValueFromKey('schema.editMode.nullable'),
                        fieldClass: "checkBoxEditor"
                    },
                    nullmean : {
                        type: CheckboxEditor,
                        title: translater.getValueFromKey('schema.editMode.nullmean'),
                        fieldClass: "checkBoxEditor"
                    }
                },
                title       : translater.getValueFromKey('schema.editMode.editMode')
            },

            //  Css field section GONE

            atBeginingOfLine : {
                type        : CheckboxEditor,
                fieldClass  : "checkBoxEditor",
                title       : translater.getValueFromKey('schema.atBeginingOfLine') || "atBeginingOfLine"
            },
            fieldSize : {
                type        : 'Number',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.fieldSize'),
                validators : ['required',
                    function checkValue(value, formValues) {
                    if (value < 1 || value > 12) {
                        return {
                            type : 'Invalid number',
                            message : translater.getValueFromKey('schema.sizeError')
                        }
                    }
                }]
            },
            linkedFieldset : {
                title       : translater.getValueFromKey('schema.linkedFieldset'),
                editorClass : 'form-control',
                template    : fieldTemplate
            }
        },

        initialize : function(options) {
            if (AppConfig.appMode.topcontext != "reneco")
            {
                $.extend(this.schema, this.schema, {
                    showCssProperties : {
                        type        : CheckboxEditor,
                        fieldClass  : "checkBoxEditor",
                        title       : translater.getValueFromKey('schema.showCssProperties') || "showCssProperties"
                    },
                    editorClass : {
                        type        : "Text",
                        title       : translater.getValueFromKey('schema.editorClass'),
                        editorClass : 'form-control',
                        fieldClass  : 'marginTop20',
                        template    : fieldTemplate
                    },
                    fieldClassEdit : {
                        type        : "Text",
                        title       : translater.getValueFromKey('schema.fieldClassEdit'),
                        editorClass : 'form-control',
                        template    : fieldTemplate
                    },
                    fieldClassDisplay : {
                        type        : "Text",
                        title       : translater.getValueFromKey('schema.fieldClassDisplay'),
                        editorClass : 'form-control',
                        template    : fieldTemplate
                    }
                });

                $.extend(this.defaults, this.defaults, {
                    isLinkedField                : false,
                    linkedFieldTable             : '',
                    linkedField                  : ''
                });
            }
            _.bindAll(this, 'getJSON');
        },

        isAdvanced : function(index) {
            return this.getSchemaProperty(index, 'advanced') === "advanced";
        },

        /**
         * Return the model in JSON object
         *
         * @returns {object} field as json object
         */
        getJSON : function() {
            var jsonObject                  = {
                    validators : []
                },
                schemaKeys                  = _.keys( typeof this.schema == "function" ? this.schema() : this.schema ),
                schemaKeysWithoutValidator  = _.without(schemaKeys, 'required');

            _.each(schemaKeysWithoutValidator, _.bind(function(el) {
                jsonObject[el] = this.get(el);
            }, this));

            jsonObject["id"]    = this.get("id");
            jsonObject["order"] = this.get("order");

            if (this.get('editMode') & 4 != 4) {
                jsonObject['validators'].push('required');
            }
            if (this.get('editMode') & 2 != 2) {
                jsonObject['validators'].push('readonly');
            }
            return _.omit(jsonObject, ['isLinkedField', 'showCssProperties']);
        }

    });

    models.BaseFieldExtended = models.BaseField.extend({
        defaults : function() {
            return _.extend( {}, models.BaseField.prototype.defaults, {
                defaultValue : "",
                isDefaultSQL : false,
                help         : translater.getValueFromKey('placeholder.text')
            });
        },

        schema: function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.default'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                isDefaultSQL: {
                    type        : CheckboxEditor,
                    fieldClass  : "hidden",
                    title       : "isSQL"
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.help'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.help')
                    }
                }
            })
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    });

    models.AutocompleteField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Autocomplete");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                defaultValue : "",
                help         : translater.getValueFromKey('placeholder.autocomplete'),
                triggerlength: 2,
                url          : "ressources/autocomplete/example.json",
                isSQL        : false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Autocomplete");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.default'),
                    fieldClass  : 'advanced',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.help'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.help')
                    }
                },
                triggerlength: {
                    type        : (ExtraProperties.getPropertiesContext().getHideExceptionForProperty('AutocompleteField','triggerlength')?'Hidden':'Number'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.triggerlength'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.triggerlength')
                    }
                },
                url: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.url'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.url')
                    }
                },
                isSQL: {
                    type        : CheckboxEditor,
                    fieldClass  : "hidden",
                    title       : "isSQL"
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Autocomplete",
        i18n   : 'autocomplete',
        section : 'autocomplete'
    });

    models.FileField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("File");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                mimeType     : "*",
                filesize     : 200, //  specify max file size in ko,
                help         : translater.getValueFromKey('placeholder.file'),
                preview      : false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("File");

            var toret =  _.extend({}, models.BaseField.prototype.schema, {
                mimeType: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.mime'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.mime')
                    }
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.help'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.help')
                    }
                },
                filesize: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.size'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.fileSize')
                    }
                },
                preview : {
                    type        : CheckboxEditor,
                    fieldClass  : "checkBoxEditor",
                    title       : translater.getValueFromKey('schema.preview') || "preview"
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : "File",
        i18n   : 'file',
        section : 'file'
    });

    models.TreeViewField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("TreeView");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
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
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("TreeView");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                defaultNode: {
                    type  : 'Number',
                    title : translater.getValueFromKey('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.tree.default')
                    }
                },
                multipleSelection: {
                    type        : CheckboxEditor,
                    fieldClass : "checkBoxEditor",
                    title : translater.getValueFromKey('schema.multipleSelection'),
                },
                hierarchicSelection: {
                    title : translater.getValueFromKey('schema.hierarchic'),
                    type        : CheckboxEditor,
                    fieldClass : "checkBoxEditor"
                },
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.webServiceURL'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.tree.url')
                    }
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'TreeView',
        i18n: 'tree',
        section : 'tree'
    });

    models.ThesaurusField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Thesaurus");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                    defaultValue : "",
                    webServiceURL : AppConfig.paths.thesaurusWSPath,
                    defaultNode: "",
                    fullpath : ""
                });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Thesaurus");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.default'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.webServiceURL'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.node.url')
                    }
                },
                defaultNode: {
                    type  : 'Text',
                    title : translater.getValueFromKey('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.tree.default')
                    }
                },
                fullpath: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    editorAttrs : { disabled: true },
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.fullpath')
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'Thesaurus',
        i18n: 'thesaurus',
        section : 'tree'
    });

    models.AutocompleteTreeViewField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("AutocompleteTreeView");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                language    : { hasLanguage: true, lng: 'En' },
                wsUrl       : 'ressources/thesaurus',
                webservices : 'autocompleteTreeView.json',
                startId     : '0',
                defaultNode : ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("AutocompleteTreeView");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                wsUrl : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.wsUrl')
                },
                defaultNode: {
                    type  : 'Text',
                    title : translater.getValueFromKey('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                webservices : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.ws')
                },
                language : {
                    type        : 'Select',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.wslng'),
                    options : ["fr", "en"]
                },
                fullpath: {
                    type        : 'Hidden',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : ""
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type: 'AutocompleteTreeView',
        i18n: 'autocomp',
        section : 'tree'
    });

    models.ChildFormField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("ChildForm");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                childForm : "",
                childFormName : "",
                help : translater.getValueFromKey('placeholder.childform')
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("ChildForm");

            var toret = _.extend( {}, models.BaseField.prototype.schema, {
                childForm: {
                    type        : 'Select',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.childForm'),
                    validators  : ['required'],
                    options     : getFormsList(this)
                },
                childFormName: {
                    type        : 'Hidden',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : ""
                },
                help: {
                    type        : 'Hidden',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : ""
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'ChildForm',
        i18n   : 'childForm',
        section : 'other'
    });

    // This input type is EcoReleve Dependent
    models.ObjectPickerField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("ObjectPicker");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                objectType : "Monitored Site",
                wsUrl : "",
                triggerAutocomplete : 0,
                linkedLabel : ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("ObjectPicker");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                objectType: {
                    type        : 'Select',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.objectType'),
                    options     : ["Individual", "Non Identified Individual", "Monitored Site", "Sensor"],
                    validators : ['required']
                },
                wsUrl : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.wsUrl'),
                    validators : ['required']
                },
                triggerAutocomplete: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.ACTrigger'),
                    validators : [function checkValue(value) {
                        if (value < 1) {
                            return {
                                type : 'Invalid number',
                                message : translater.getValueFromKey('schema.ACTriggerMinValue')
                            }
                        }
                    }],
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.num.ACTrigger')
                    }
                },
                linkedLabel : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.linkedLabel')
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'ObjectPicker',
        i18n   : 'objectpicker',
        section : 'reneco'
    });

    // This input type is EcoReleve Dependent
    models.SubFormGridField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("SubFormGrid");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                childForm : "",
                childFormName : "",
                nbFixedCol : "1",
                delFirst : true,
                showLines : true
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("SubFormGrid");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                childForm: {
                    type        : 'Select',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.childForm'),
                    validators  : ['required'],
                    options     : getFormsList(this)
                },
                childFormName: {
                    type        : 'Hidden',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : ""
                },
                nbFixedCol: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.nbFixedCol'),
                    validators : [function checkValue(value) {
                        if (value < 1) {
                            return {
                                type : 'Invalid number',
                                message : translater.getValueFromKey('schema.nbFixedColMinValue')
                            }
                        }
                    }]
                },
                delFirst : {
                    type        : CheckboxEditor,
                    fieldClass  : "checkBoxEditor",
                    title       : translater.getValueFromKey('schema.delFirst')
                },
                showLines : {
                    type        : CheckboxEditor,
                    fieldClass  : "checkBoxEditor",
                    title       : translater.getValueFromKey('schema.showLines')
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },
        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'SubFormGrid',
        i18n   : 'subFormGrid',
        section : 'reneco'
    });

    // This input type is Track Dependent
    models.PositionField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Position");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                defaultPath : "",
                webServiceURL : AppConfig.paths.positionWSPath,
                defaultNode: "",
                positionPath : ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Position");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                defaultPath : {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.defaultPath'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                webServiceURL : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.webServiceURL'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.node.url')
                    }
                },
                defaultNode: {
                    type  : 'Text',
                    title : translater.getValueFromKey('schema.defaultNode'),
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
                positionPath : {
                    type        : 'Text',
                    editorClass : 'form-control',
                    editorAttrs : { disabled: true },
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.positionPath'),
                    validators : ['required']
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Position',
        i18n   : 'position',
        section : 'reneco'
    });

    //  ----------------------------------------------------
    //  Field herited by TextField
    //  ----------------------------------------------------

    models.TextField = models.BaseField.extend({

        defaults : function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Text");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                defaultValue : "",
                isDefaultSQL : false,
                help         : translater.getValueFromKey('placeholder.text'),
                minLength    : 1,
                maxLength    : 255
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Text");

            var toret =  _.extend( {}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.default'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                isDefaultSQL: {
                    type        : CheckboxEditor,
                    fieldClass  : "hidden",
                    title       : "isSQL"
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.help'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.help')
                    }
                },
                minLength: {
                    type        : 'Hidden',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.min')
                },
                maxLength: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.maxTextLength'),
                    validators : ['required',
                        function checkValue(value, formValues) {
                            if (value < 1 || value > 255) {
                                return {
                                    type : translater.getValueFromKey('schema.maxTextLengthError'),
                                    message : translater.getValueFromKey('schema.maxTextLengthMin')
                                }
                            }
                        }
                    ],
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('schema.maxlength255')
                    }
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : "Text",
        i18n   : 'text',
        section : 'text'
    });

    models.TextAreaField = models.TextField.extend({

        defaults : function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("TextArea");

            var toret = _.extend( {}, models.TextField.prototype.defaults(), {

            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("TextArea");
            var schema =  _.extend( {}, models.TextField.prototype.schema(), {

            });

            var toret =  _.extend( {}, schema, {
                defaultValue: {
                    type        : 'Text',
                    title       : translater.getValueFromKey('schema.default'),
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.value')
                    }
                },
                isDefaultSQL: {
                    type        : CheckboxEditor,
                    fieldClass  : "hidden",
                    title       : "isSQL"
                },
                help: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.help'),
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('placeholder.help')
                    }
                },
                maxLength: {
                    type        : 'Number',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.maxTextLength'),
                    validators : [function checkValue(value, formValues) {
                        if (value < 1 || value > 255) {
                            return {
                                type : translater.getValueFromKey('schema.maxTextLengthError'),
                                message : translater.getValueFromKey('schema.maxTextLengthMin')
                            }
                        }
                    }],
                    editorAttrs : {
                        placeholder : translater.getValueFromKey('schema.maxlength255')
                    }
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : 'TextArea',
        i18n   : 'TextArea',
        section : 'text'
    });

    models.PatternField = models.TextField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Pattern");

            var toret = _.extend( {}, models.TextField.prototype.defaults(), {
                pattern: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Pattern");

            var toret =  _.extend( {}, models.TextField.prototype.schema(), {
                pattern: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.pattern')
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : "Pattern",
        i18n   : 'mask',
        section : 'other'
    });

    models.DateField = models.BaseFieldExtended.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Date");

            var toret = _.extend( {}, models.BaseFieldExtended.prototype.defaults(), {
                format: (AppConfig.appMode.topcontext == "reneco" ? "DD/MM/YYYY" : ""),
                help : translater.getValueFromKey('placeholder.date')
            });

            if (AppConfig.appMode.topcontext == "reneco")
            {
                toret.fieldSize = 2;
            }

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Date");

            var formatFieldProps = {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.format'),
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.format')
                }
            };

            if (AppConfig.appMode.topcontext == "reneco")
            {
                formatFieldProps.type = 'Select';
                delete formatFieldProps.editorAttrs;
                formatFieldProps.options = ["DD/MM/YYYY", "HH:mm:ss", "DD/MM/YYYY HH:mm:ss"]
            }


            var toret =  _.extend( {}, models.BaseFieldExtended.prototype.schema(), {
                format: formatFieldProps
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        initialize: function() {
            models.BaseFieldExtended.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : "Date",
        i18n   : 'date',
        section : 'numeric'
    });

    //  ----------------------------------------------------
    //  Field herited by NumberField
    //  ----------------------------------------------------


    models.NumberField = models.TextField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Number");

            var baseSchema = _.pick(
                models.TextField.prototype.defaults(), _.keys(models.BaseField.prototype.defaults, 'help')
            );
            baseSchema.help = translater.getValueFromKey('placeholder.numeric');

            var toret = _.extend( {}, baseSchema, {
                minValue     : '',
                maxValue     : '',
                precision    : 1,
                decimal      : true,
                defaultValue : '',
                unity        : []
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        baseSchema : {
            decimal : {
                type        : CheckboxEditor,
                fieldClass : "checkBoxEditor",
                title       : translater.getValueFromKey('schema.decimal')
            },
            defaultValue : _.pick(models.TextField.prototype.schema(), 'defaultValue')['defaultValue'],
            minValue: {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.min'),
                validators : [function checkValue(value, formValues) {
                    if (value != "")
                    {
                        if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                            return {
                                type: 'Invalid number',
                                message: "La valeur saisie est d'un format incorrect"
                            }
                        }
                        value = parseFloat(value);

                        if (value.toString().substr(0, 1) != '#' && formValues['maxValue'] != "" && value > formValues['maxValue']) {
                            return {
                                type: 'Invalid number',
                                message: "La valeur maximale est inférieure à la valeur minimale"
                            }
                        }
                    }
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.num.min')
                }
            },
            maxValue: {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.max'),
                validators : [function checkValue(value, formValues) {
                    if (value != "")
                    {
                        if (!$.isNumeric(value) && value.toString().substr(0,1) != '#')
                        {
                            return {
                                type : 'Invalid number',
                                message : "La valeur saisie est d'un format incorrect"
                            }
                        }
                        value = parseFloat(value);

                        if (value.toString().substr(0,1) != '#' && formValues['minValue'] != "" && value < formValues['minValue']) {
                            return {
                                type : 'Invalid number',
                                message : "La valeur maximale est inférieure à la valeur minimale"
                            }
                        }
                    }
                }],
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.num.max')
                }
            },
            precision: {
                type        : 'Number',
                editorClass : 'form-control',
                fieldClass  : 'advanced',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.precision'),
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.num.precision')
                }
            },
            unity: {
                type        : 'Select',
                title       : translater.getValueFromKey('schema.unity'),
                template    : fieldTemplate,
                editorClass : 'form-control',
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.num.unity')
                },
                options     : []
            }
        },

        schema : function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Number");
            var schema = _.extend( {}, _.pick(models.TextField.prototype.schema(), _.keys(models.BaseField.prototype.schema), 'help'), this.baseSchema);

            schema.defaultValue.type = 'Number';
            schema.defaultValue.validators = [function checkValue(value, formValues) {
                if (value != null && value != "")
                {
                    if (formValues['maxValue'] != "" && formValues['maxValue'].substr(0,1) != '#' && value > formValues['maxValue']) {
                        return {
                            type : 'Invalid number',
                            message : "La valeur par défault est supérieur à la valeur maximale"
                        }
                    } else if (formValues['minValue'] != "" && formValues['minValue'].substr(0,1) != '#' && value < formValues['minValue']) {
                        return {
                            type : 'Invalid number',
                            message : "La valeur par défault est inférieure à la valeur minimale"
                        }
                    }
                }

                return undefined;
            }];

            var toret =  _.extend( {}, schema, {
                pattern: {
                    type        : 'Text',
                    editorClass : 'form-control',
                    template    : fieldTemplate,
                    title       : translater.getValueFromKey('schema.pattern')
                }
            });

            toret = reorderProperties(_.extend(toret, toret, extraschema));

            return toret;
        },

        initialize: function() {
            models.TextField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Number',
        i18n   : 'Number',
        section : 'numeric'
    });

    models.DecimalField = models.NumberField.extend({

        defaults : function() {
            return _.extend({},
                models.NumberField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Decimal"));
        },

        schema : function() {
            return reorderProperties(_.extend({},
                models.NumberField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Decimal")));

            /* TODO KEEP AS EXAMPLE OF THE OLD WAY
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Decimal");
            return models.NumberField.prototype.schema();
            */
        }

    }, {
        type   : 'Decimal',
        i18n   : 'decimal',
        section : 'numeric'
    });

    models.NumericRangeField = models.NumberField.extend({

        defaults : function() {
            return _.extend({},
                models.NumberField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("NumericRange"));
        },

        schema : function() {
            return reorderProperties(_.extend({},
                models.NumberField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("NumericRange")));
        }

    }, {
        type   : 'NumericRange',
        i18n   : 'numericrange',
        section : 'numeric'
    });


    //  ----------------------------------------------------
    //  Field herited by EnumerationField
    //  ----------------------------------------------------


    models.EnumerationField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Enumeration");

            var toret = _.extend( {}, models.BaseField.prototype.defaults, {
                choices: [
                    {
                        id             : 1,
                        isDefaultValue : false,
                        fr             : 'Mon option',
                        en             : "My first Option",
                        value          : "1"
                    }
                ],
                //  the default value refers to the default choice id
                //  We used an array because we can have multiple default value
                defaultValue: [1],
                expanded: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        getJSON : function() {
            var json = models.BaseField.prototype.getJSON.apply(this, arguments);
            json.choices = JSON.stringify(this.get('choices'));

            return json;
        },

        schema: function() {
            return reorderProperties(_.extend( {}, models.BaseField.prototype.schema,
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Enumeration")));
        },

        /**
         * To manage Enumeration field values we used Backgrid.
         * So we need to specify which columns use
         */
        columns : [
            {
                name     : 'isDefaultValue',
                label    : '',
                cell     : 'boolean'
            },
            {
                name     : 'fr',
                label    : 'fr',
                cell     : 'string'
            },
            {
                name     : 'en',
                label    : 'en',
                cell     : 'string'
            },
            {
                name     : 'value',
                label    : 'value',
                cell     : 'string'
            },
            {
                name     : 'action',
                label    : '',
                cell     : 'string',
                editable : false
            }
        ],

        /**
         * Default value when we add a new row
         */
        columDefaults : {

            isDefaultValue : false,
            fr             : 'French label',
            en             : 'English value',
            value          : 'Value',
            action         : ''
        },

        /**
         * Constructor
         *
         * Get models.BaseField schema and add it on EnumerationField schema
         */
        initialize: function(options) {
            models.BaseField.prototype.initialize.apply(this, arguments);
            if (typeof this.get('choices') === 'string') {
                this.set('choices', JSON.parse(this.get('choices')));
            }
        }
    });

    models.SelectField = models.EnumerationField.extend({

        defaults : function() {
            return _.extend({},
                models.EnumerationField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Select"));
        },

        schema : function() {
            return reorderProperties(_.extend({},
                models.EnumerationField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Select")));
        },

        subSchema : models.EnumerationField.prototype.subSchema,

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Select',
        i18n   : 'select',
        section : 'list'
    });

    models.CheckBoxField = models.EnumerationField.extend({

        defaults : function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("CheckBox");

            var toret = _.extend( {}, models.EnumerationField.prototype.defaults(), models.BaseField.prototype.defaults, {
                isBinaryWeight : false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("CheckBox");

            var toret =  _.extend( {}, models.EnumerationField.prototype.schema(), models.BaseField.prototype.schema, {
                isBinaryWeight : {
                    type        : CheckboxEditor,
                    fieldClass  : "checkBoxEditor",
                    title       : translater.getValueFromKey('schema.isBinaryWeight') || "isBinaryWeight"
                }
            });

            return reorderProperties(_.extend(toret, toret, extraschema));
        },

        subSchema : models.EnumerationField.prototype.subSchema,

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
        }

    }, {
        type   : 'CheckBox',
        i18n   : 'checkbox',
        section : 'list'
    });

    models.RadioField = models.EnumerationField.extend({

        defaults : function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Radio");

            var toret = _.extend( {}, models.EnumerationField.prototype.defaults(), models.BaseField.prototype.defaults, {
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema : function() {
            return reorderProperties(_.extend( {}, models.EnumerationField.prototype.schema(), models.BaseField.prototype.schema,
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Radio")));
        },

        subSchema : models.EnumerationField.prototype.subSchema,

        initialize: function() {
            models.EnumerationField.prototype.initialize.apply(this, arguments);
        }
    }, {
        type   : 'Radio',
        i18n   : 'radio',
        section : 'list'
    });


    //  ----------------------------------------------------
    //  Other Fields (might be deprecated)
    //  ----------------------------------------------------


    models.HiddenField = Backbone.Model.extend({
        defaults: {
            id          : 0,
            order       : 1,
            title       : translater.getValueFromKey('tooltip.hidden'),
            name        : "Field",
            value       : ""
        },

        schema: {
            name   : {
                type        : "Text",
                title       : 'Name',
                editorClass : 'form-control',
                template    : fieldTemplate,
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.name')
                }
            },
            value: {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate,
                title       : translater.getValueFromKey('schema.value'),
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.value')
                }
            },

            //  Linked field section
            isLinkedField : {
                type        : CheckboxEditor,
                fieldClass  : "checkBoxEditor",
                title       : translater.getValueFromKey('schema.isLinkedField') || "isLinkedField"
            },
            linkedFieldTable : {
                type : 'Select',
                title       : translater.getValueFromKey('schema.linkedFieldTable'),
                template    : fieldTemplate,
                editorClass : 'form-control',
                options : []
            },
            linkedField : {
                type : 'Select',
                title       : translater.getValueFromKey('schema.linkedField'),
                template    : fieldTemplate,
                editorClass : 'form-control',
                options : []
            }
        }
    }, {
        type   : 'Hidden',
        i18n   : 'hidden',
        section : 'presentation'
    });

    models.HorizontalLineField = Backbone.Model.extend({}, {
        type   : 'HorizontalLine',
        section : 'presentation',
        i18n   : 'presentation'
    });

    models.SubformField = Backbone.Model.extend({

        defaults: {
            id                : 0,
            order             : 1,
            fields            : [],
            fieldsObject      : [],
            legend            : 'Fieldset'
        },

        schema : {
            legend   : {
                type        : 'Text',
                editorClass : 'form-control',
                template    : fieldTemplate ,
                title       : translater.getValueFromKey('schema.legend'),
                editorAttrs : {
                    placeholder : translater.getValueFromKey('placeholder.legend')
                }
            }
        },

        addField : function(field) {

            //  Update field array
            var arr = this.get('fields');

            arr.push(field.get('name'));
            this.set('fields', arr);

            //  Send event to the subForm view
            //  The subForm view will create subView corresponding to the field in parameter
            this.trigger('fieldAdded', field);
        },

        removeField : function(field) {

            var arr     = this.get('fields'),
                index   = arr.indexOf(field);
            arr.splice(index, 1);
            this.set('fields', arr);
            this.trigger('fieldRemoved');
        }

    }, {
        type   : 'Subform',
        i18n   : 'fieldset',
        section : 'presentation'
    });

    return models;

});
