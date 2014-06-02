/**
 * @fileOverview model.js
 * This file implements all field models
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

var formBuilder = (function(formBuild) {

    //  --------------------------------------------
    //  Basic models herited from Backbone model
    //  --------------------------------------------
    
    /**
     * Basic field model
     * Establishes common field attributes
     */
    formBuild.BaseField         = Backbone.Model.extend({        
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
            readOnly: false
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
        },
        
        getSchemaProperty: function(index, property) {        
            if (index.indexOf("/") > 0) {
                //  Complex index like : /name/label/lang -> ['name']['label']['lang']
                var split = index.split('/'), str = "this.constructor.schema";                
                for (var each in split) {                
                    str += (parseInt(each) === split.length - 1) ? '["' + split[each] + '"]' : '["' + split[each] + '"]["elements"]';                    
                }
                return eval(str + '["' + property + '"]');
            } else {
                //  Simple index
                return this.constructor.schema[index] !== undefined ? this.constructor.schema[index][property] : "";
            }
        },
        
        changePropertyValue : function(index, value) {
            if (index.indexOf("/") > 0) {
                var split = index.split('/'), str = 'this.get' + '("' + split[0] + '")';
                
                for (var i = 1 ; i < split.length ; i++) {
                    str += '["' + split[i] + '"]';
                }
                
                eval(str + ' = "' + value + '"');
            } else {
                this.set(index, value);
            }
        }

    }, {
        schema : {
            id      : { type    : "integer", section : "advanced", display: "ID"},
            label   : { type    : "string", section : "simple" },
            name : {
                type : "object",
                elements: {
                    label: {
                        type : "object",
                        elements : {
                            value   : { type: "string" },
                            lang    : { type: "string" }
                        }
                    },                    
                    display_label    : {type : "string", display: "Real displayed value" }
                }
            },
            required : { type : "boolean", section : "advanced" },
            readOnly : { type : "boolean"}
        }
    });
    
    /**
     * graphical horizontal line field model
     */
    formBuild.HorizontalLineField    = Backbone.Model.extend({
    }, {
        type    : 'HorizontalLine',
        xmlTag  : 'field_horizontalLine'
    });

    /**
     * Hidden field model
     */
    formBuild.HiddenField       = Backbone.Model.extend({
        defaults: {
            id  : 0,
            name    : {
                label: {
                    value: "field",
                    lang : "en"
                },
                displayLabel: "field"
            },
            value: ""
        },
        getSchemaProperty: function(index, property) {  
            formBuild.BaseField.prototype.getSchemaProperty.apply(this, arguments);
        },
        getXML: function() {
            return  "<name>" +
                    "   <label lang='" + this.get('name')['label']['lang'] + "'>" + this.get('name')['label']['value'] + '</label>' +
                    "   <display_label>" + this.get('name')['displayLabel'] + '</display_label>' +
                    "</name>" +
                    "<value>" + this.get('value') + '</value>';
        }
    }, {
        type    : 'Hidden',
        xmlTag  : 'field_hidden',
        schema: {
            id: {type: "integer"},
            name : {
                type : "object",
                elements: {
                    label: {
                        type : "object",
                        elements : {
                            value   : { type: "string" },
                            lang    : { type: "string" }
                        }
                    },                    
                    displayLabel    : {type : "string" }
                }
            },
            value: {type: "string"}
        }
    });

    //  --------------------------------------------
    //  Models herited from Base field model
    //  --------------------------------------------
    
    /**
     * Text field model
     */
    formBuild.TextField         = formBuild.BaseField.extend({
        defaults: {
            defaultValue: "",
            hint        : "Write some text",
            size        : 255
        },
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<defaultValue>'    + this.get('defaultValue')  + '</defaultValue>' +
                            '<hint>'            + this.get('hint')          + '</hint>' +
                            '<size>'            + this.get('size')          + '</size>';
        },
        initialize : function(options) {
            formBuild.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.BaseField.schema);
        }
    }, {
        type    : "Text",
        xmlTag  : 'field_text',
        schema : {
            defaultValue: { type : "string", display: "Default value", section : "advanced" },
            hint        : { type : "string" },
            size        : { type : "integer"}
        }
    });
    
    /**
     * File field model
     */
    formBuild.FileField         = formBuild.BaseField.extend({
        defaults: {
            defaultValue: "",
            file        : "",
            mimeType    : "*",
            size        : 200    //  specify max file size in ko
        },
        initialize : function() {
            formBuild.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.BaseField.schema);
        },
       getXML : function () {
           var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
           return xml + "<file>"            + this.get('file')          + '</file>' + 
                        "<defaultValue>"    + this.get('defaultValue')  + '</defaultValue>' + 
                        "<mimeType>"        + this.get('mimeType')      + '</mimeType>' + 
                        "<size>"            + this.get('size')          + '</size>';
       }
    }, {
        type    : "File",
        xmlTag  : 'field_file',
        schema : {
            defaultValue: { type : "string" },
            file        : { type : "string" },
            mimeType    : { type : "string" },
            size        : { type : "integer", display: "Maximum size"}
        }
    });
    
    /**
     * Tree view model
     */
    formBuild.TreeViewField     = formBuild.BaseField.extend({
       defaults : {
            node: [
                {
                    title   : "Node 1", 
                    key     : "1"
                },
                {
                    title   : "Folder 2", 
                    key     : "2", 
                    folder  : true, 
                    children: [
                        {
                            title: "Node 2.1",
                            key: "3"
                        },
                        {
                            title: "Node 2.2",
                            key: "4"
                        }
                    ]
                }
            ],
           defaultNode          : 0,
           multipleSelection    : true,
           hierarchicSelection  : false
       },
       
       initialize : function() {
           formBuild.BaseField.prototype.initialize.apply(this, arguments);
           _.extend(this.constructor.schema, formBuild.BaseField.schema);
           _.bindAll(this, 'getNodeXml', 'getXML');
       },
       
       getNodeXml : function(node) {
           var str =    '<node>' + 
                        '   <title>'    + node['title']     + '</title>' + 
                        '   <key>'      + node['key']       + '</key>'  +
                        '   <folder>' + (node['folder'] === undefined ? "false" : node['folder'])    + '</folder>';
                
                        if (node['folder'] === true) {
                            str += "<children>";
                            _.each(node['children'], _.bind(function(subNode) {
                                str +=  this.getNodeXml(subNode);
                            }, this));
                            str += "</children>";
                        }
                        
           return str + '</node>';
       },
       
       getXML : function() {
           var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
           
           xml +=   '<defaultNode>'         + this.get('defaultNode')           + '</defaultNode>' + 
                    '<multipleSelection>'   + this.get('multipleSelection')     + '</multipleSelection>' + 
                    '<hierarchicSelection>' + this.get('hierarchicSelection')   + '</hierarchicSelection>';
           _.each(this.get('node'), _.bind(function(el) {
               xml +=   this.getNodeXml(el);
           }, this));
           
           
           return xml;
       }
    }, {
        type    : 'TreeView',
        xmlTag  : 'field_treeView',
        schema : {
            defaultNode         : { type : "integer" },
            multipleSelection   : { type : "boolean" },
            hierarchicSelection : { type : "boolean" },
            node : [
                {
                    title   : { type : "string"     },
                    key     : { type : "integer"    },
                    folder  : { type : "boolean"    },
                    children: [ { type : "node" } ]
                }
            ]
        }
    });

    /**
     * enumeration field type
     */
    formBuild.EnumerationField  = formBuild.BaseField.extend({
        
        defaults: {
            items: [
                {   //  itemList
                    items: [
                        {label: "My Firsta Option", value: "1", id: 0},
                        {label: "My second Option", value: "2", id: 1}
                    ],
                    lang: "en",
                    defaultValue: 1 //  default value corresponds to item id
                },
                {   //  ItemList
                    items: [
                        {label: "Ma premiere option", value: "1", id: 150},
                        {label: "Ma seconde Option", value: "2", id: 151}
                    ],
                    lang: "fr",
                    defaultValue: 151
                }
            ],
            multiple : false, 
            expanded : false
        },
        
        /**
         * Constructor
         * 
         * Get BaseField schema and add it on EnumerationField schema
         */
        initialize : function() {
            formBuild.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.BaseField.schema);
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
         * Return XML content for all itemList
         * 
         * @returns {String} XML content
         */
        getItemListXML : function() {
            var xml = "";
            _.each(this.get('items'), function(el, idx) {
                xml +=  '<itemList lang="' + el['lang'] + '" >';
                _.each(el['items'], function(item, id) {
                    xml +=  '<item id="' + item['id'] + '">' + 
                            '   <label>' + item['label'] + '</label>' +
                            '   <value>' + item['value'] + '</value>' + 
                            '</item>';
                });
                xml +=  '<defaultValue>' + el['defaultValue'] + '</defaultValue>';
                xml +=  '</itemList>';
            });
            return xml;
        },
        
        /**
         * Return object XML content
         * 
         * @returns {String} XML content
         */
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<items>' + this.getItemListXML() + '</items>' + 
                            '<expanded>' +  this.get('expanded') + '</expanded>'+ 
                            '<multiple>' +  this.get('multiple') + '</multiple>';
        }
        
    }, {
        schema: {            
            items : {
                type : "array",
                itemList : {
                    defaultValue    : { type : "string" },
                    lang            : { type : "string" },
                    type: "array",
                    items : {
                        label   : { type : "string" },
                        value   : { type : "string" }
                    }
                }
            },            
            expanded : { type : "boolean" },
            multiple : { type : "boolean" }
        }
    });
    
    _.defaults(formBuild.TextField.prototype.defaults,          formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.FileField.prototype.defaults,          formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.TreeViewField.prototype.defaults,      formBuild.BaseField.prototype.defaults);
    _.defaults(formBuild.EnumerationField.prototype.defaults,   formBuild.BaseField.prototype.defaults);
    
    //  --------------------------------------------
    //  Models herited from text field model
    //  --------------------------------------------
    
    /**
     * Pattern field model
     */
    formBuild.PatternField      = formBuild.TextField.extend({
        defaults : {
            pattern : ""
        } ,
        initialize : function() {
            formBuild.TextField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.TextField.schema);
        },
        getXML : function() {
            return formBuild.TextField.prototype.getXML.apply(this, arguments) + "<pattern>" + this.get('pattern') + '</pattern>';
        }
    }, {
        type: "Pattern",
        xmlTag : 'field_pattern',
        schema : {
            pattern : { type : "string" }
        }
    });
    
    /**
     * date pickear field type
     */
    formBuild.DateField         = formBuild.TextField.extend({
        defaults: {
            format: "dd/mm/yyyy"
        },
        initialize : function() {
            formBuild.TextField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.TextField.schema);
        },
        getXML: function() {
            return formBuild.TextField.prototype.getXML.apply(this, arguments) + '<format>' + this.get("format") + '</format>';
        }
    }, {
        type    : "Date",
        xmlTag  : 'field_date',
        schema : {
            format : { type : "string" }
        }
    });

    /**
     * numeric field type
     */
    formBuild.NumericField      = formBuild.TextField.extend({
        defaults: {
            minValue    : 0,
            maxValue    : 100,
            precision   : 1,
            unity       : "meters"
        },
        initialize : function() {
            formBuild.TextField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.TextField.schema);
            this.set('hint', 'Enter a numeric value');
        },

        getXML: function() {
            return  formBuild.TextField.prototype.getXML.apply(this, arguments) +
                    '<min>' + this.get("minValue")  + '</min>' +
                    '<max>' + this.get("maxValue")  + '</max>' +
                    '<precision>'+ this.get("precision")      + '</precision>' +
                    '<unity>' + this.get("unity")  + '</unity>';
        }
    }, {
        type    : 'Numeric',
        xmlTag  : 'field_numeric',
        schema : {
            minValue    : { type : "integer" },
            maxValue    : { type : "integer" },
            precision   : { type : "integer" },
            unity       : { type : "string"  }
        }
    });

    /**
     * long text field type
     */
    formBuild.LongTextField     = formBuild.TextField.extend({
        defaults: {
            resizable: false
        },
        initialize : function() {
            formBuild.TextField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.TextField.schema);
        },
        getXML: function() {
            return formBuild.TextField.prototype.getXML.apply(this, arguments) + '<resizable>' + this.get("resizable") + '</resizable>';
        }
    }, {
        type    : 'LongText',
        xmlTag  : 'field_longText',
        schema : {
            resizable : { type : "boolean" }
        }
    });

    _.defaults(formBuild.NumericField.prototype.defaults,   formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.PatternField.prototype.defaults,   formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.DateField.prototype.defaults,      formBuild.TextField.prototype.defaults);
    _.defaults(formBuild.LongTextField.prototype.defaults,  formBuild.TextField.prototype.defaults);
    
    //  --------------------------------------------
    //  Models herited from enumeration field model
    //  --------------------------------------------
    
    /**
     * Checkbox field type
     */
    formBuild.CheckBoxField     = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize : function() {
            formBuild.EnumerationField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.EnumerationField.schema);
            this.set('multiple', true);
            this.set('expanded', true);
        }
    }, {
        type    : 'CheckBox',
        xmlTag  : 'field_list'
    });

    /**
     * radio field type
     */
    formBuild.RadioField        = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize : function() {
            formBuild.EnumerationField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.EnumerationField.schema);
            this.set('multiple', false);
            this.set('expanded', true);
        }
    }, {
        type    : 'Radio',
        xmlTag  : 'field_list'
    });

    /**
     * select field type
     */
    formBuild.SelectField       = formBuild.EnumerationField.extend({
        getXML: function() {
            return formBuild.EnumerationField.prototype.getXML.apply(this, arguments);
        },
        initialize : function() {
            formBuild.EnumerationField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.EnumerationField.schema);
        }
    }, {
        type    : 'Select',
        xmlTag  : 'field_list'
    });

    _.defaults(formBuild.RadioField.prototype.defaults,         formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.CheckBoxField.prototype.defaults,      formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.SelectField.prototype.defaults,        formBuild.EnumerationField.prototype.defaults);    

    return formBuild;
    
})(formBuilder);