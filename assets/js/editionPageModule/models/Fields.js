define([
    'jquery', 'lodash', 'tools', 'backbone', '../../Translater',
    '../editor/CheckboxEditor', '../editor/EditModeEditor', '../editor/AppearanceEditor',
    '../editor/ChoicesEditor', '../editor/AutocompTreeEditor', '../editor/LanguagesEditor',
    'app-config', '../../homePageModule/collection/FormCollection', './ExtraContextProperties/ExtraProperties',
    'text!../templates/FieldTemplate.html', 'text!../templates/FieldTemplateEditorOnly.html'
], function(
    $, _, tools, Backbone, Translater,
    CheckboxEditor, EditModeEditor, AppearanceEditor,
    ChoicesEditor, AutocompTreeEditor, LanguagesEditor,
    AppConfig, FormCollection, ExtraProperties,
    FieldTemplate, FieldTemplateEditorOnly) {

    var fieldTemplate = _.template(FieldTemplate);
    var fieldTemplateEditorOnly = _.template(FieldTemplateEditorOnly);

    var models = {}, translater = Translater.getTranslater();

    var getFormsList = function(context) {
        //TODO CHANGE THIS CRAP, LOAD FORMSLIST ON FORM LOADING AND NOT ON FIELD SETTINGS PANEL OPENING
        if (this.getFormsListResult && context.collection.name == this.savedCollectionName)
            return (this.getFormsListResult);
        var toret = [];
        if (AppConfig.config.options.URLOptions) {
            var formCollection = new FormCollection({
                url: AppConfig.config.options.URLOptions.allforms + "/" + window.context
            });

            formCollection.fetch({
                async: false,
                reset: true,
                success: _.bind(function() {
                    $.each(formCollection.models, function(index, value) {
                        if ((context.collection.name != value.attributes.name &&
                                (!value.attributes.context || value.attributes.context == window.context)) &&
                            !value.attributes.obsolete) {
                            toret.push({"val": value.attributes.id, "label": value.attributes.name});
                        }
                    });
                }, this)
            });

            this.getFormsListResult = toret;
            this.savedCollectionName = context.collection.name;

            return (toret);
        }
    };

    // Although isSQLPropertySetter is not really a validator(!),
    // it is intended to be plugged in the validators section of a specific "isSQL" property,
    // it will check, at validation time, if provided property from model is detected as
    // being a SQL script, and set the current model's property holding this validator accordingly.
    //
    // * model is the parent base model
    // * srcProperty is the attribute from model that needs to be checked
    // * isSQLproperty is the current property to be set
    //
    // property using this will hold a bool value,
    // it should be hidden because it will be overriden at validate time.
    //
    // It is admitedly hacky, but seemed like a good way to avoid code duplication, kind of simply.
    var isSQLPropertySetter = function(model, srcProperty, isSQLProperty) {
        return function() {
            if (!model || !model.attributes ||
                model.attributes[srcProperty] === undefined ||
                model.attributes[isSQLProperty] === undefined ||
                typeof(model.attributes[srcProperty]) !== "string" ||
                typeof(model.attributes[isSQLProperty]) !== "boolean") {

                console.log("looks like a bad usage of isSQLPropertySetter");
                return;
            }

            var sqlStuff = model.attributes[srcProperty].toLowerCase();
            model.attributes[isSQLProperty] =
                sqlStuff.indexOf("select") >= 0 && sqlStuff.indexOf("from") > 0;
        };
    };

    //  ----------------------------------------------------
    //  Field herited by BaseField
    //  ----------------------------------------------------
    models.BaseField = Backbone.Model.extend({

        defaults: {
            order: 1,
            name: "",
            required: false,
            translations: {},

            linkedFieldTable: '',
            linkedField: '',

            editMode: 7,
            isDragged: false,
            showCssProperties: false,
            editorClass: '',
            fieldClassEdit: '',
            fieldClassDisplay: '',
            atBeginingOfLine: false,
            fieldSize: 12,
            linkedFieldset: ''
        },

        schema: {
            translations: {
                type: LanguagesEditor,
                title: "", // it's already in it's own panel, display empty title
                template: fieldTemplateEditorOnly,
                languages: {
                    // todo some kind of conf value ?
                    fr: {
                        name: translater.getValueFromKey('languages.fr'),
                        extraValidators: [{
                            type : 'required',
                            message : translater.getValueFromKey('form.validation'),
                            targets: ["Name"]
                        }],
                        required: true
                    },
                    en: {
                        name: translater.getValueFromKey('languages.en'),
                        extraValidators: [{
                            type : 'required',
                            message : translater.getValueFromKey('form.validation'),
                            targets: ["Name"]
                        }],
                        required: true
                    },
                    ar: {
                        name: translater.getValueFromKey('languages.ar')
                    }
                },
                schema: {
                    Name: {
                        type        : "Text",
                        title       : translater.getValueFromKey("languages.label"),
                        template    : fieldTemplate
                    },
                    Help: {
                        type        : "Text",
                        title       : translater.getValueFromKey("schema.help"),
                        template    : fieldTemplate
                    }
                }
            },
            name: {
                type: "Text",
                title: translater.getValueFromKey('schema.name'),
                template: fieldTemplate,
                fieldClass: 'marginBottom10',
                validators: ['required']
            },

            linkedFieldTable: {
                type: 'Select',
                title: translater.getValueFromKey('schema.linkedFieldTable'),
                template: fieldTemplate,
                options: function(apply, control) {
                    // all the passing around of "linkedTablesList" ends up here
                    // todo it could probably be avoided (bis)
                    var linkedTablesList = control.model.get("linkedTablesList");
                    if (!linkedTablesList) return;
                    apply(linkedTablesList);
                },
            },
            linkedField: {
                type: 'Select',
                title: translater.getValueFromKey('schema.linkedField'),
                template: fieldTemplate,
                options: function(apply, control) {
                    // all the passing around of "linkedFieldsList" ends up here
                    // todo it could probably be avoided
                    var linkedFieldsList = control.model.get("linkedFieldsList");
                    if (!linkedFieldsList) return;
                    var options = _.map(linkedFieldsList, function(obj) {
                        return obj.key;
                    });
                    apply(options);
                },
            },

            editMode: {
                type: EditModeEditor,
                title: translater.getValueFromKey('schema.editMode.editMode'),
                template: fieldTemplate
            },

            // appearance englobes values for atBeginingOfLine & fieldSize
            // this is not completely ideal but works well with BaseView's
            // mechanism that setValue's based on input name.
            appearance: {
                type: AppearanceEditor,
                title: translater.getValueFromKey('editGrid.appearance'),
                template: fieldTemplate
            },

            atBeginingOfLine: {
                type: "Hidden"
            },
            fieldSize: {
                type: "Hidden",
                validators: ['required',
                    _.bind(function checkValue(value) {
                        // skip check for ecoreleve, fieldSize can be in pixels
                        if (this.context == "ecoreleve") {
                            return;
                        }
                        if (value < 1 || value > 12) {
                            return {
                                type: 'Invalid number',
                                message: translater.getValueFromKey('schema.sizeError')
                            }
                        }
                    }, this)]
            },

            linkedFieldset: {
                title: translater.getValueFromKey('schema.linkedFieldset'),
                template: fieldTemplate
            }
        },

        i18nFields: ["translations"],

        /**
         * languageSchema returns i18n related fields from this.schema()
         **/
        languagesSchema: function() {
            if (this.languagesSchema_cache)
                return this.languagesSchema_cache;

            var schema = this.getSchema();
            var languageProperties = _.pick(schema, _.bind(function(v, k) {
                return _.includes(this.i18nFields, k);
            }, this));
            this.languagesSchema_cache = languageProperties;
            return languageProperties;
        },

        /**
         * extraSchema returns any field not present in excluded this.schema() or
         * this.languages schema
         */
        extraSchema: function(excluded) {
            if (this.extraSchema_cache)
                return this.extraSchema_cache;

            if (!excluded) excluded = [];
            var keys = excluded.concat(this.i18nFields);
            var schema = this.getSchema();
            var extraProperties = _.pick(schema, function(v, k) {
                return !_.includes(keys, k);
            });
            this.extraSchema_cache = extraProperties;
            return extraProperties;
        },

        mainSchema: function(included) {
            if (this.mainSchema_cache)
                return this.mainSchema_cache;

            if (!included) included = [];
            var schema = this.getSchema();
            var mainProperties = _.pick(schema, _.bind(function(v, k) {
                return _.includes(included, k);
            }, this));

            this.mainSchema_cache = mainProperties;
            return mainProperties;
        },

        /**
         * getSchema returns this.schema or this.schema() depending on type
         */
        getSchema: function() {
            if (typeof (this.schema) === 'function') {
                return this.schema();
            } else {
                return this.schema;
            }
        },

        cacheCompatibleFields: function(context, src, dest) {
            if (!this.prototype.compatibleFields) {
                this.prototype.compatibleFields = {};
            }

            if (!this.prototype.compatibleFields[context]) {
                this.prototype.compatibleFields[context] = {};
            }

            this.prototype.compatibleFields[context][src] = dest;
        },

        getCompatibleFields: function(ctx) {
            var srcType = this.constructor.type;
            var compatibleFieldPacks = tools.getContextConfig(ctx, "allowedConvert");

            // do we have it in cache ?
            if (this.prototype.compatibleFields &&
                this.prototype.compatibleFields[ctx] &&
                this.prototype.compatibleFields[ctx][srcType]) {

                return this.prototype.compatibleFields[ctx][srcType];
            }

            // do the work
            var pack;
            for (var i in compatibleFieldPacks) {
                pack = compatibleFieldPacks[i];

                // search srcType in field pack
                var idx = pack.indexOf(srcType);
                if (idx > -1) {
                    // found, copy array
                    pack = pack.slice();
                    // splice it (remove src type)
                    pack.splice(idx, 1);
                    break;
                }

                pack = null;
            }

            // cache value in prototype
            this.cacheCompatibleFields(ctx, srcType, pack);

            // assign value to model
            return pack;
        },

        initialize: function(options) {
            // set prototype
            this.prototype = models.BaseField.prototype;

            // set meta object for use in templates etc. will be ignored
            var meta = {
                i18n: this.constructor.i18n,
                type: this.constructor.type
            };
            this.set("meta", meta);

            // set compatible convert fields
            this.set("compatibleFields", this.getCompatibleFields(options.context));

            if (AppConfig.topcontext != "reneco") {
                $.extend(this.schema, this.schema, {
                    showCssProperties: {
                        type: CheckboxEditor,
                        template: fieldTemplate,
                        fieldClass: "checkBoxEditor",
                        title: translater.getValueFromKey('schema.showCssProperties') || "showCssProperties"
                    },
                    editorClass: {
                        type: "Text",
                        title: translater.getValueFromKey('schema.editorClass'),
                        fieldClass: 'marginTop20',
                        template: fieldTemplate
                    },
                    fieldClassEdit: {
                        type: "Text",
                        title: translater.getValueFromKey('schema.fieldClassEdit'),
                        template: fieldTemplate
                    },
                    fieldClassDisplay: {
                        type: "Text",
                        title: translater.getValueFromKey('schema.fieldClassDisplay'),
                        template: fieldTemplate
                    }
                });

                $.extend(this.defaults, this.defaults, {
                    linkedFieldTable: '',
                    linkedField: ''
                });
            }
            _.bindAll(this, 'getJSON');
        },

        /**
         * Return the model in JSON object
         *
         * @returns {object} field as json object
         */
        getJSON: function() {
            var jsonObject = {
                    validators: []
                },
                schemaKeys = _.keys(typeof this.schema == "function" ? this.schema() : this.schema),
                schemaKeysWithoutValidator = _.without(schemaKeys, 'required');

            _.each(schemaKeysWithoutValidator, _.bind(function(el) {
                jsonObject[el] = this.get(el);
            }, this));

            jsonObject["id"] = this.get("id");
            jsonObject["order"] = this.get("order");

            if (this.get('editMode') & 4 != 4) {
                jsonObject['validators'].push('required');
            }
            if (this.get('editMode') & 2 != 2) {
                jsonObject['validators'].push('readonly');
            }
            return _.omit(jsonObject, ['showCssProperties']);
        }

    });

    models.BaseFieldExtended = models.BaseField.extend({
        defaults: function() {
            return _.extend({}, models.BaseField.prototype.defaults, {
                defaultValue: "",
                isDefaultSQL: false
            });
        },

        schema: function() {
            return _.extend({}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.default'),
                    template: fieldTemplate
                },
                isDefaultSQL: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "hidden",
                    title: "isSQL",
                    validators: [
                        isSQLPropertySetter(this, "defaultValue", "isDefaultSQL")
                    ]
                }
            })
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    });

    models.AutocompleteField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Autocomplete");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                defaultValue: "",
                triggerlength: 2,
                url: "ressources/autocomplete/example.json",
                isSQL: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Autocomplete");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.default'),
                    fieldClass: 'advanced',
                    template: fieldTemplate
                },
                triggerlength: {
                    type: (ExtraProperties.getPropertiesContext().getHideExceptionForProperty('AutocompleteField', 'triggerlength') ? 'Hidden' : 'Number'),
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.triggerlength')
                },
                url: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.url')
                },
                isSQL: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "hidden",
                    title: "isSQL",
                    validators: [
                        isSQLPropertySetter(this, "url", "isSQL")
                    ]
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }

    }, {
        type: "Autocomplete",
        i18n: 'autocomplete',
        section: 'autocomplete'
    });

    models.FileField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("File");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                mimeType: "*",
                filesize: 200, //  specify max file size in ko,
                preview: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("File");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                mimeType: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.mime')
                },
                filesize: {
                    type: 'Number',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.size')
                },
                preview: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor",
                    title: translater.getValueFromKey('schema.preview') || "preview"
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: "File",
        i18n: 'file',
        section: 'file'
    });

    models.TreeViewField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("TreeView");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
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
                webServiceURL: '',
                defaultNode: 0,
                multipleSelection: true,
                hierarchicSelection: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("TreeView");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                defaultNode: {
                    type: 'Number',
                    title: translater.getValueFromKey('schema.defaultNode'),
                    template: fieldTemplate
                },
                multipleSelection: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor",
                    title: translater.getValueFromKey('schema.multipleSelection'),
                },
                hierarchicSelection: {
                    title: translater.getValueFromKey('schema.hierarchic'),
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor"
                },
                webServiceURL: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.webServiceURL')
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'TreeView',
        i18n: 'tree',
        section: 'tree'
    });

    models.ThesaurusField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Thesaurus");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                defaultValue: "",
                webServiceURL: AppConfig.paths.thesaurusWSPath,
                defaultNode: "",
                fullpath: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Thesaurus");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.default'),
                    template: fieldTemplate
                },
                webServiceURL: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.webServiceURL'),
                    editorAttrs: {
                        disabled: function() {
                            return AppConfig.topcontext.toLowerCase() === 'reneco';
                        }
                    }
                },
                defaultNode: {
                    type: AutocompTreeEditor,
                    title: translater.getValueFromKey('schema.defaultNode'),
                    template: fieldTemplate,
                    options: {
                        path: "fullpath"
                    }
                },
                fullpath: {
                    type: 'Hidden',
                    editorAttrs: {disabled: true},
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.fullpath')
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'Thesaurus',
        i18n: 'thesaurus',
        section: 'tree'
    });

    // todo
    models.AutocompleteTreeViewField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("AutocompleteTreeView");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                language: {hasLanguage: true, lng: 'En'},
                wsUrl: 'ressources/thesaurus',
                webservices: 'autocompleteTreeView.json',
                startId: '0',
                defaultNode: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("AutocompleteTreeView");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                wsUrl: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.wsUrl')
                },
                defaultNode: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.defaultNode'),
                    template: fieldTemplate
                },
                webservices: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.ws')
                },
                language: {
                    type: 'Select',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.wslng'),
                    options: ["fr", "en"]
                },
                fullpath: {
                    type: 'Hidden',
                    template: fieldTemplate,
                    title: ""
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'AutocompleteTreeView',
        i18n: 'autocomp',
        section: 'tree'
    });

    models.ChildFormField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("ChildForm");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                childForm: "",
                childFormName: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("ChildForm");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                childForm: {
                    type: 'Select',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.childForm'),
                    validators: ['required'],
                    options: getFormsList(this)
                },
                childFormName: {
                    type: 'Hidden',
                    template: fieldTemplate,
                    title: ""
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'ChildForm',
        i18n: 'childForm',
        section: 'other'
    });

    // This input type is EcoReleve Dependent
    models.ObjectPickerField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("ObjectPicker");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                objectType: "Monitored Site",
                wsUrl: "",
                triggerAutocomplete: 0,
                linkedLabel: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("ObjectPicker");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                objectType: {
                    type: 'Select',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.objectType'),
                    options: ["Individual", "Non Identified Individual", "Monitored Site", "Sensor"],
                    validators: ['required']
                },
                wsUrl: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.wsUrl'),
                    validators: ['required']
                },
                triggerAutocomplete: {
                    type: 'Number',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.ACTrigger'),
                    validators: [function checkValue(value) {
                        if (value < 1) {
                            return {
                                type: 'Invalid number',
                                message: translater.getValueFromKey('schema.ACTriggerMinValue')
                            }
                        }
                    }]
                },
                linkedLabel: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.linkedLabel')
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'ObjectPicker',
        i18n: 'objectpicker',
        section: 'reneco'
    });

    // This input type is EcoReleve Dependent
    models.SubFormGridField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("SubFormGrid");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                childForm: "",
                childFormName: "",
                nbFixedCol: "1",
                delFirst: true,
                showLines: true
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("SubFormGrid");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                childForm: {
                    type: 'Select',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.childForm'),
                    validators: ['required'],
                    options: getFormsList(this)
                },
                childFormName: {
                    type: 'Hidden',
                    template: fieldTemplate,
                    title: ""
                },
                nbFixedCol: {
                    type: 'Number',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.nbFixedCol'),
                    validators: [function checkValue(value) {
                        if (value < 1) {
                            return {
                                type: 'Invalid number',
                                message: translater.getValueFromKey('schema.nbFixedColMinValue')
                            }
                        }
                    }]
                },
                delFirst: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor",
                    title: translater.getValueFromKey('schema.delFirst')
                },
                showLines: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor",
                    title: translater.getValueFromKey('schema.showLines')
                }
            });

            return _.extend(toret, toret, extraschema);
        },
        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'SubFormGrid',
        i18n: 'subFormGrid',
        section: 'reneco'
    });

    // This input type is Track Dependent
    models.PositionField = models.BaseField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Position");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                defaultPath: "",
                webServiceURL: AppConfig.paths.positionWSPath,
                defaultNode: "",
                positionPath: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },
        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Position");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                // todo: shouldn't it be defaultValue ??
                // doesn't match behavior of ThesaurusField which uses defaultValue
                defaultPath: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.defaultPath'),
                    template: fieldTemplate
                },
                webServiceURL: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.webServiceURL'),
                    editorAttrs: {
                      disabled: function() {
                        return AppConfig.topcontext.toLowerCase() === 'reneco';
                      }
                    }
                },
                defaultNode: {
                    type: AutocompTreeEditor,
                    title: translater.getValueFromKey('schema.defaultNode'),
                    template: fieldTemplate,
                    options: {
                        path: "positionPath"
                    }
                },
                positionPath: {
                    type: 'Hidden',
                    editorAttrs: {disabled: true},
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.positionPath'),
                    validators: ['required']
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'Position',
        i18n: 'position',
        section: 'reneco'
    });

    //  ----------------------------------------------------
    //  Field herited by TextField
    //  ----------------------------------------------------

    models.TextField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Text");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                defaultValue: "",
                isDefaultSQL: false,
                minLength: 1,
                maxLength: 255
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Text");

            var toret = _.extend({}, models.BaseField.prototype.schema, {
                defaultValue: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.default'),
                    template: fieldTemplate
                },
                isDefaultSQL: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "hidden",
                    title: "isSQL",
                    validators: [
                        isSQLPropertySetter(this, "defaultValue", "isDefaultSQL")
                    ]
                },
                minLength: {
                    type: 'Hidden',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.min')
                },
                maxLength: {
                    type: 'Number',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.maxTextLength'),
                    validators: ['required',
                        function checkValue(value, formValues) {
                            if (value < 1 || value > 255) {
                                return {
                                    type: translater.getValueFromKey('schema.maxTextLengthError'),
                                    message: translater.getValueFromKey('schema.maxTextLengthMin')
                                }
                            }
                        }
                    ]
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
        }
    }, {
        type: "Text",
        i18n: 'text',
        section: 'text'
    });

    models.TextAreaField = models.TextField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("TextArea");

            var toret = _.extend({}, models.TextField.prototype.defaults(), {});

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("TextArea");
            var schema = _.extend({}, models.TextField.prototype.schema(), {});

            var toret = _.extend({}, schema, {
                defaultValue: {
                    type: 'Text',
                    title: translater.getValueFromKey('schema.default'),
                    template: fieldTemplate
                },
                isDefaultSQL: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "hidden",
                    title: "isSQL",
                    validators: [
                        isSQLPropertySetter(this, "defaultValue", "isDefaultSQL")
                    ]
                },
                maxLength: {
                    type: 'Number',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.maxTextLength'),
                    validators: [function checkValue(value, formValues) {
                        if (value < 1 || value > 255) {
                            return {
                                type: translater.getValueFromKey('schema.maxTextLengthError'),
                                message: translater.getValueFromKey('schema.maxTextLengthMin')
                            }
                        }
                    }]
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.TextField.prototype.initialize.call(this, options);
        }

    }, {
        type: 'TextArea',
        i18n: 'TextArea',
        section: 'text'
    });

    models.PatternField = models.TextField.extend({
        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Pattern");

            var toret = _.extend({}, models.TextField.prototype.defaults(), {
                pattern: ""
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Pattern");

            var toret = _.extend({}, models.TextField.prototype.schema(), {
                pattern: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.pattern')
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.TextField.prototype.initialize.call(this, options);
        }

    }, {
        type: "Pattern",
        i18n: 'mask',
        section: 'other'
    });

    models.DateField = models.BaseFieldExtended.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Date");

            var toret = _.extend({}, models.BaseFieldExtended.prototype.defaults(), {
                format: (AppConfig.topcontext == "reneco" ? "DD/MM/YYYY" : "")
            });

            if (AppConfig.topcontext == "reneco") {
                toret.fieldSize = 2;
            }

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Date");

            var formatFieldProps = {
                type: 'Text',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.format')
            };

            // TODO - UGLY : Abstract special input cases ?
            if (AppConfig.topcontext == "reneco" || window.context == "aygalades") {
                formatFieldProps.type = 'Select';
                delete formatFieldProps.editorAttrs;
                formatFieldProps.options = ["DD/MM/YYYY", "HH:mm:ss", "DD/MM/YYYY HH:mm:ss"]
            }


            var toret = _.extend({}, models.BaseFieldExtended.prototype.schema(), {
                format: formatFieldProps
            });

            return _.extend(toret, toret, extraschema);
        },

        initialize: function(options) {
            models.BaseFieldExtended.prototype.initialize.call(this, options);
        }
    }, {
        type: "Date",
        i18n: 'date',
        section: 'numeric'
    });

    //  ----------------------------------------------------
    //  Field herited by NumberField
    //  ----------------------------------------------------


    models.NumberField = models.TextField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Number");

            var baseSchema = _.pick(
                models.TextField.prototype.defaults(), _.keys(models.BaseField.prototype.defaults)
            );

            var toret = _.extend({}, baseSchema, {
                minValue: '',
                maxValue: '',
                precision: 1,
                decimal: true,
                defaultValue: '',
                unity: []
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        baseSchema: {
            decimal: {
                type: CheckboxEditor,
                template: fieldTemplate,
                fieldClass: "checkBoxEditor",
                title: translater.getValueFromKey('schema.decimal')
            },
            defaultValue: _.pick(models.TextField.prototype.schema(), 'defaultValue')['defaultValue'],
            minValue: {
                type: 'Text',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.min'),
                validators: [function checkValue(value, formValues) {
                    if (value != "") {
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
                }]
            },
            maxValue: {
                type: 'Text',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.max'),
                validators: [function checkValue(value, formValues) {
                    if (value != "") {
                        if (!$.isNumeric(value) && value.toString().substr(0, 1) != '#') {
                            return {
                                type: 'Invalid number',
                                message: "La valeur saisie est d'un format incorrect"
                            }
                        }
                        value = parseFloat(value);

                        if (value.toString().substr(0, 1) != '#' && formValues['minValue'] != "" && value < formValues['minValue']) {
                            return {
                                type: 'Invalid number',
                                message: "La valeur maximale est inférieure à la valeur minimale"
                            }
                        }
                    }
                }]
            },
            precision: {
                type: 'Number',
                fieldClass: 'advanced',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.precision')
            },
            unity: {
                type: 'Select',
                title: translater.getValueFromKey('schema.unity'),
                template: fieldTemplate,
                options: []
            }
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Number");
            var schema = _.extend({}, _.pick(models.TextField.prototype.schema(), _.keys(models.BaseField.prototype.schema)), this.baseSchema);

            schema.defaultValue.type = 'Number';
            schema.defaultValue.validators = [function checkValue(value, formValues) {
                if (value != null && value != "") {
                    if (formValues['maxValue'] != "" && formValues['maxValue'].substr(0, 1) != '#' && value > formValues['maxValue']) {
                        return {
                            type: 'Invalid number',
                            message: "La valeur par défault est supérieur à la valeur maximale"
                        }
                    } else if (formValues['minValue'] != "" && formValues['minValue'].substr(0, 1) != '#' && value < formValues['minValue']) {
                        return {
                            type: 'Invalid number',
                            message: "La valeur par défault est inférieure à la valeur minimale"
                        }
                    }
                }

                return undefined;
            }];

            var toret = _.extend({}, schema, {
                pattern: {
                    type: 'Text',
                    template: fieldTemplate,
                    title: translater.getValueFromKey('schema.pattern')
                }
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        initialize: function(options) {
            models.TextField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'Number',
        i18n: 'number',
        section: 'numeric'
    });

    models.DecimalField = models.NumberField.extend({

        defaults: function() {
            return _.extend({},
                models.NumberField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Decimal"));
        },

        schema: function() {
            return _.extend({},
                models.NumberField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Decimal"));

            /* TODO KEEP AS EXAMPLE OF THE OLD WAY
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Decimal");
            return models.NumberField.prototype.schema();
            */
        },

        initialize: function(options) {
            models.NumberField.prototype.initialize.call(this, options);
        }

    }, {
        type: 'Decimal',
        i18n: 'decimal',
        section: 'numeric'
    });

    models.NumericRangeField = models.NumberField.extend({

        defaults: function() {
            return _.extend({},
                models.NumberField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("NumericRange"));
        },

        schema: function() {
            return _.extend({},
                models.NumberField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("NumericRange"));
        }

    }, {
        type: 'NumericRange',
        i18n: 'numericrange',
        section: 'numeric'
    });


    //  ----------------------------------------------------
    //  Field herited by EnumerationField
    //  ----------------------------------------------------


    models.EnumerationField = models.BaseField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Enumeration");

            var toret = _.extend({}, models.BaseField.prototype.defaults, {
                choices: [],
                expanded: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        getJSON: function(options) {
            var json = models.BaseField.prototype.getJSON.call(this, options);
            json.choices = JSON.stringify(this.get('choices'));

            return json;
        },

        schema: function() {
            return _.extend({}, models.BaseField.prototype.schema,
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Enumeration"),
                {
                    choices: {
                        type: ChoicesEditor,
                        template: fieldTemplate,
                        title: translater.getValueFromKey('editGrid.valuesList'),
                        languages: [
                            "fr", "en", "ar"
                        ]
                    }
                });
        },

        columnDefaults: {
            isDefaultValue: false,
            fr: '',
            en: '',
            ar: '',
            value: ''
        },

        /**
         * Constructor
         *
         * Get models.BaseField schema and add it on EnumerationField schema
         */
        initialize: function(options) {
            models.BaseField.prototype.initialize.call(this, options);
            if (typeof this.get('choices') === 'string') {
                this.set('choices', JSON.parse(this.get('choices')));
            }
        }
    });

    models.SelectField = models.EnumerationField.extend({

        defaults: function() {
            return _.extend({},
                models.EnumerationField.prototype.defaults(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Select"));
        },

        schema: function() {
            return _.extend({},
                models.EnumerationField.prototype.schema(),
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Select"));
        },

        subSchema: models.EnumerationField.prototype.subSchema,

        initialize: function(options) {
            models.EnumerationField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'Select',
        i18n: 'select',
        section: 'list'
    });

    models.CheckBoxField = models.EnumerationField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("CheckBox");

            var toret = _.extend({}, models.EnumerationField.prototype.defaults(), models.BaseField.prototype.defaults, {
                isBinaryWeight: false
            });

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("CheckBox");

            var toret = _.extend({}, models.EnumerationField.prototype.schema(), models.BaseField.prototype.schema, {
                isBinaryWeight: {
                    type: CheckboxEditor,
                    template: fieldTemplate,
                    fieldClass: "checkBoxEditor",
                    title: translater.getValueFromKey('schema.isBinaryWeight') || "isBinaryWeight"
                }
            });

            return _.extend(toret, toret, extraschema);
        },

        subSchema: models.EnumerationField.prototype.subSchema,

        initialize: function(options) {
            models.EnumerationField.prototype.initialize.call(this, options);
        }

    }, {
        type: 'CheckBox',
        i18n: 'checkbox',
        section: 'list'
    });

    models.RadioField = models.EnumerationField.extend({

        defaults: function() {
            var extraschema = ExtraProperties.getPropertiesContext().getExtraPropertiesDefaults("Radio");

            var toret = _.extend({}, models.EnumerationField.prototype.defaults(), models.BaseField.prototype.defaults, {});

            toret = _.extend(toret, toret, extraschema);

            return toret;
        },

        schema: function() {
            return _.extend({}, models.EnumerationField.prototype.schema(), models.BaseField.prototype.schema,
                ExtraProperties.getPropertiesContext().getExtraPropertiesSchema("Radio"));
        },

        subSchema: models.EnumerationField.prototype.subSchema,

        initialize: function(options) {
            models.EnumerationField.prototype.initialize.call(this, options);
        }
    }, {
        type: 'Radio',
        i18n: 'radio',
        section: 'list'
    });

    //  ----------------------------------------------------
    //  Other Fields (might be deprecated)
    //  ----------------------------------------------------


    models.HiddenField = models.BaseField.extend({
        defaults: {
            id: 0,
            order: 1,
            title: translater.getValueFromKey('tooltip.hidden'),
            value: ""
        },

        schema: {
            name: {
                type: "Text",
                title: 'Name',
                template: fieldTemplate
            },
            value: {
                type: 'Text',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.value')
            },

            linkedFieldTable: {
                type: 'Select',
                title: translater.getValueFromKey('schema.linkedFieldTable'),
                template: fieldTemplate,
                options: []
            },
            linkedField: {
                type: 'Select',
                title: translater.getValueFromKey('schema.linkedField'),
                template: fieldTemplate,
                options: []
            }
        }
    }, {
        type: 'Hidden',
        i18n: 'hidden',
        section: 'presentation'
    });

    models.HorizontalLineField = models.BaseField.extend({}, {
        type: 'HorizontalLine',
        section: 'presentation',
        i18n: 'presentation'
    });

    models.SubformField = models.BaseField.extend({

        defaults: {
            id: 0,
            order: 1,
            fields: [],
            fieldsObject: [],
            legend: 'Fieldset'
        },

        schema: {
            legend: {
                type: 'Text',
                template: fieldTemplate,
                title: translater.getValueFromKey('schema.legend')
            }
        },

        addField: function(field) {

            //  Update field array
            var arr = this.get('fields');

            arr.push(field.get('name'));
            this.set('fields', arr);

            //  Send event to the subForm view
            //  The subForm view will create subView corresponding to the field in parameter
            this.trigger('fieldAdded', field);
        },

        removeField: function(field) {

            var arr = this.get('fields'),
                index = arr.indexOf(field);
            arr.splice(index, 1);
            this.set('fields', arr);
            this.trigger('fieldRemoved');
        }

    }, {
        type: 'Subform',
        i18n: 'fieldset',
        section: 'presentation'
    });

    return models;

});
