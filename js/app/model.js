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
                displayLabel: "field"
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
        
        getSchemaProperty: function(index, property) {            
            if (index.indexOf("/") > 0) {
                //  Complex index
                var split = index.split('/'), str = "this.constructor.schema";                
                for (var each in split) {                
                    str += (parseInt(each) === split.length - 1) ? '["' + split[each] + '"]' : '["' + split[each] + '"]["elements"]';                    
                }
                return eval(str + '["' + property + '"]');
            } else {
                //  Simple index
                return this.constructor.schema[index][property];
            }
        }
        ,
        changePropertyValue : function(index, value) {
            
            if (index.indexOf("/") > 0) {
                var split = index.split('/'), str = 'this.get' + '("' + split[0] + '")'
                
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
            id      : { 
                type    : "integer", 
                section : "advanced"
            },
            label   : { 
                type    : "string", 
                section : "simple" 
            },
            name : {
                type : "object",
                elements: {
                    label: {
                        type : "object",
                        elements : {
                            value: {
                                type: "string"
                            },
                            lang: {
                                type: "string"
                            }
                        }
                    },                    
                    displayLabel    : {type : "string" }
                }
            },
            required : {
                type : "boolean", section : "advanced"
            },
            readOnly : {
                type : "boolean"
            }
        }
    });
    
    /**
     * graphical horizontal line field model
     */
    formBuild.HorizontalLine    = Backbone.Model.extend({
    }, {
        type    : 'hr',
        xmlTag  : 'field_horizontalLine'
    });

    /**
     * Hidden field model
     */
    formBuild.HiddenField       = Backbone.Model.extend({
        defaults: {
            id  : 0,
            name: {
                label: { value: "", lang: "en" },
                displayLabel: ""
            },
            value: ""
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
            name: {
                label: {
                    value: {type: "string"},
                    lang: {type: "string"}
                },
                displayLebel: {type: "string"}
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
        initialize : function() {
            formBuild.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.BaseField.schema);
        }
    }, {
        type    : "Text",
        xmlTag  : 'field_text',
        schema : {
            defaultValue: { type : "string" },
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
            size        : { type : "integer"}
        }
    });
    
    /**
     * Tree view model
     */
    formBuild.TreeViewField     = formBuild.BaseField.extend({
       defaults : {
            nodes: [
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
                        title   : "Node 2.1", 
                        key     : "3"
                    },
                    {
                        title   : "Node 2.2", 
                        key     : "4"
                    }
                ]}
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
                        '   <isParent>' + (node['folder'] === undefined ? "false" : node['folder'])    + '</isParent>';
                
                        if (node['folder'] === true) {
                            _.each(node['children'], _.bind(function(subNode) {
                                str +=  this.getNodeXml(subNode);
                            }, this));
                        }
                        
           return str + '</node>';
       },
       
       getXML : function() {
           var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments);
           
           xml +=   '<defaultNode>'         + this.get('defaultNode')           + '</defaultNode>' + 
                    '<multipleSelection>'   + this.get('multipleSelection')     + '</multipleSelection>' + 
                    '<hierarchicSelection>' + this.get('hierarchicSelection')   + '</hierarchicSelection>';
            
           _.each(this.get('nodes'), _.bind(function(el) {
               xml +=   this.getNodeXml(el);
           }, this));
           
           
           return xml;
       }
    }, {
        type    : 'TreeView',
        xmlTag  : 'field_tree',
        schema : {
            defaultNode         : { type : "integer" },
            multipleSelection   : { type : "boolean" },
            hierarchicSelection : { type : "boolean" },
            nodes : {
                title   : { type : "string"     },
                key     : { type : "integer"    },
                folder  : { type : "boolean"    },
                children: { type : [{ type : "node"}] }
            }
        }
    });

    /**
     * enumeration field type
     */
    formBuild.EnumerationField  = formBuild.BaseField.extend({
        defaults: {
            options     : [
                {
                    label : "My first option", value : 0
                },
                {
                    label : "My second option", value : 1
                }
            ],
            defaultValue: 0
        },
        initialize : function() {
            formBuild.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.BaseField.schema);
        },
        
        /**
         * Add an option to the model
         * 
         * @param {type} element
         * @param {type} select
         * @returns {undefined}
         */
        addOption: function(element, select) {
            this.get('options').push(element);
            if (select === true) {
                this.set('defaultValue', element['value']);
            };            
            this.trigger('change');
        },
        
        /**
         * Remove an option from the model
         * 
         * @param {type} index
         * @returns {undefined}
         */
        removeOption: function(index) {
            this.get('options').splice(index, 1);
            this.trigger('change');
        },
        
        saveOption: function(index, obj, select) {
            this.get('options')[index] = obj;
            if (select === true) {
                this.set('defaultValue', obj['value']);
            };
            this.trigger('change');
        },
        
        getOption: function(index) {
            return this.get('options')[index];
        },
        
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments) + '<defaultValue>' + this.get('defaultValue') + '</defaultValue>';
            _.each(this.get('options'), function(el) {
                xml +=  '<option>' +
                        '   <label>' + el["label"] + '</label>' +
                        '   <value>' + el["value"] + '</value>' +
                        '</option>';
            });
            return xml;
        }
        
    }, {
        type    : 'options',
        xmlTag  : 'field_enum',
        schema: {
            defaultValue: {type: "integer"},
            options: {
                type: "array",
                values: {
                    label: {type: "string"},
                    value: {type: "string"}
                }
            }
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
            step        : 1
        },
        initialize : function() {
            formBuild.TextField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, formBuild.TextField.schema);
        },

        getXML: function() {
            return  formBuild.TextField.prototype.getXML.apply(this, arguments) +
                    '<min>' + this.get("minValue")  + '</min>' +
                    '<max>' + this.get("maxValue")  + '</max>' +
                    '<step>'+ this.get("step")      + '</step>';
        }
    }, {
        type    : 'Numeric',
        xmlTag  : 'field_numeric',
        schema : {
            minValue: { type : "integer" },
            maxValue: { type : "integer" },
            step    : { type : "integer" }
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
        }
    }, {
        type    : 'CheckBox',
        xmlTag  : 'field_checkbox',
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
        }
    }, {
        type    : 'Radio',
        xmlTag  : 'field_radio'
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
        xmlTag  : 'field_select'
    });

    _.defaults(formBuild.RadioField.prototype.defaults,         formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.CheckBoxField.prototype.defaults,      formBuild.EnumerationField.prototype.defaults);
    _.defaults(formBuild.SelectField.prototype.defaults,        formBuild.EnumerationField.prototype.defaults);    
    
    return formBuild;

})(formBuilder);