/**
 * @fileOverview brain.js
 * Main javascript file, instance main formbuilder object
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

$(document).ready(function() {

    formBuilder.init();

    $('#export').click(function() {
        formBuilder.formView.downloadXML();
    });

    $('#import').click(function() {
        formBuilder.formView.importXML();
    });

    $('#clear').click (function() {
        formBuilder.clear();
    });    
    
    $('#show').click(function() {
        var html =  '<div id="popup" class="row-fluid">'+
                        '<h2 class="offset1">Your XMLs will be validated after import</h2><br />'+
                        '<div class="row-fluid">'+
                        '   <input type="file" id="sourceHide"  class="hide" />'+
                        '   <label class="span2 offset1">Source XML file</label>'+
                        '   <input type="text" class="span5" id="source" placeholder="Your XML File" />'+
                        '   <button type="button" class="span3" id="findSource" style="margin-left: 10px;">Find</button>'+
                        '</div>' + 
                        '<div class="row-fluid">'+
                        '   <input type="file" id="updateHide"  class="hide" />'+
                        '   <label class="span2 offset1">Updated XML file</label>'+
                        '   <input type="text" class="span5" id="update" placeholder="Your XML File" />'+
                        '   <button type="button" class="span3" id="findUpdate" style="margin-left: 10px;">Find</button>'+
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<br />'+
                            '<button class="span4 offset3" id="versionningButton">Run versionning</button>'+
                        '</div>'+
                    '</div>';
            
        $(html).dialog({
            
            modal       : true,
            width       : 750,
            resizable   : false,
            draggable   : false,
            position    : 'center',
            
            create: function() {
                
                $(this).find('#findSource, #findUpdate').bind('click', function() {
                    $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide' ).trigger('click');
                });
                
                $(this).find('input[type="file"]').bind('change', function() {
                    var id      = $(this).prop('id').replace('Hide', '');
                    var split   = $(this).val().split('\\');                    
                    $('#' + id).val( split[ split.length - 1] );
                });
                
                $(this).find('#versionningButton').bind('click', _.bind(function() {
                    
                    $(this).dialog('close');
                    
                    var source = $(this).find('#sourceHide')[0].files[0];
                    var update = $(this).find('#updateHide')[0].files[0];
                    
                    var srcName = source['name'], updName = update['name'];
                    
                    if (source !== null && update !== null) {
                        
                        if (source.type === "text/xml" && update.type === "text/xml") {
                            
                            var reader = new FileReader();
                            
                            reader.readAsText(source, "UTF-8");
                            
                            reader.onload = function(evt) {
                                    
                                try {
                                    
                                    var result = formBuilder.XMLValidation(evt.target.result);
                                    
                                    if (result !== true) {
                                        //  error
                                    } else {
                                        source = evt.target.result;
                                        
                                        reader = new FileReader();
                                        reader.readAsText(update, "UTF-8");
                                        
                                        reader.onload = function(evt) {
                                            
                                           result = formBuilder.XMLValidation(evt.target.result);
                                            if (result === true) {
                                                update = evt.target.result;
                                               
                                               $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                                   $('.dropArea').append ( formBuilder.GetXMLDiff(source, update, srcName, updName)).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                               })
                                            }
                                                
                                        };
                                    }
                                    
                                } catch(exp) {
                                    formBuilder.displayError("Error");
                                }
                            };
                            
                            reader.onerror = function(evt) {
                                formBuilder.displayError ("Reading error", 'An error was occure during reading file');
                            };
                            
                        } else {
                            formBuilder.displayError ('File mime type error', "You must choose only XML files");
                        }
                        
                    } else {
                        formBuilder.displayError ("Error durring XML loading ! ");
                    }

                }, this));
            }
        });

    });


});
/**
 * @fileOverview collection.js
 * This file describ form collection model
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *                  model.js
 *                  xmllint
 *                  blod
 *                  FileSaver
 *                  NS_Schema.xsd
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

var formBuilder = (function(formBuild) {


    /**
     * Implement form object as a fields collection
     */
    formBuild.Form = Backbone.Collection.extend({
        model: formBuild.BaseField,

        initialize: function(models, options) {
            this.name   = options.name || 'My form';
            this.count  = 0;
            _.bindAll(this, 'updateWithXml', 'clearAll', 'getSize', 'tagNameToClassName', 'addElement', 'readXSD');
        },

        /**
         * Allow to arrange the collection through model id
         * 
         * @param {formBuild.BaseModel} model  model
         * @returns {integer} comparaison between id
         */
        comparator: function(model) {
            return model.get(model.id);
        },

        getSize: function( ) {
            return this.length;
        },

        /**
         * Clear form collection
         */
        clearAll: function() {
            while (this.models.length > 0) {
                var el = this.at(this.models.length - 1);
                el.trigger('destroy', el);
            }
            this.count = 0;
        },

        /**
         * Extract XML code from models values
         * @returns {string} XML code
         */
        getXML: function() {
            var arr     = this.models.slice(1, this.models.length);
            var xml     = $.parseXML('<?xml version="1.0" ?><form id="test attribute"   xmlns="http://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3schools.com note.xsd"></form>');
            var xmlDoc  = $(xml);

            xmlDoc.find('form').append('<name>' + this.name + '</name>');
            xmlDoc.find('form').append("<fields></fields>");
            this.sort();

            _.each(arr, function(el, idx) {
                xmlDoc.find('fields').append('<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>');
            });

            return (new XMLSerializer()).serializeToString(xml);
        },        
        
        /**
         * 
         * @param {type} tag
         * @returns {unresolved}
         */
        tagNameToClassName: function(tag) {
            var split = tag.split('_');
            split[1] = split[1][0].toUpperCase() + split[1].slice(1);
            split[0] = split[0][0].toUpperCase() + split[0].slice(1);
            return split.reverse().join("");
        },
        
        addElement: function(element, nameType) {
            var el = new formBuild[nameType](element);
            if (el !== null) {
                this.add(el);
            }
        },
        
        /**
         * 
         * @param {type} content
         * @returns {undefined}
         */
        updateWithXml: function(content) {
            this.reset();
            
            var xmlDoc = $.parseXML(content), element = null, fieldNameType = "", array = null;
            
            var form = $.xml2json(xmlDoc);
            delete form['xmlns'];
            delete form['xmlns:xsi'];
            delete form['xsi:schemaLocation'];
            
            _.each(form['fields'], _.bind(function(el, idx) {               

                fieldNameType = this.tagNameToClassName(idx);                
                if (el.length > 1) {
                    _.each(el, _.bind(function(subElement, subIndex) {
                        this.addElement(subElement, fieldNameType);                        
                    }, this));
                } else {
                    this.addElement(el, fieldNameType);
                }

            }, this));
        }
    });

    return formBuild;

})(formBuilder);
/**
 * @fileOverview formBuilder.js
 * Implemente main formbuilder object
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
var formBuilder = (function(formBuild) {

    formBuild = {
        init: function() {
                $("#formBuilder").html(
                    '<div class="row-fluid content">' +
                        '<div class="span3 widgetsPanel nano"></div>' +
                        '<div class="span9 dropArea"></div>' +
                        '<div class="settings span5"></div>' +
                    '</div>'
                );

                this.form = new formBuild.Form({}, {
                    name: "My form"
                });

                this.panelView = new formBuild.PanelView({
                    el: $('.widgetsPanel'),
                    collection: this.form,
                });
                this.panelView.render();

                this.formView = new formBuild.FormView({
                    collection: this.form,
                    el: $('.dropArea')
                });
                this.formView.render();

                this.settingsView = new formBuild.SettingView({
                    el: $('.settings')
                });
                this.settingsView.render();
        },
        clear : function() {
            this.form.clearAll();
        }
    };

    return formBuild;

})(formBuilder);
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
                //  Complex index like : /name/label/lang -> ['name']['label']['lang']
                var split = index.split('/'), str = "this.constructor.schema";                
                for (var each in split) {                
                    str += (parseInt(each) === split.length - 1) ? '["' + split[each] + '"]' : '["' + split[each] + '"]["elements"]';                    
                }
                return eval(str + '["' + property + '"]');
            } else {
                //  Simple index
                return this.constructor.schema[index][property];
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
            id      : { type    : "integer", section : "advanced" },
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
                    displayLabel    : {type : "string" }
                }
            },
            required : { type : "boolean", section : "advanced" },
            readOnly : { type : "boolean"}
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
        XMLToObject : function(xml) {
            formBuild.BaseField.prototype.XMLToObject.apply(this, arguments);
        },
        initialize : function(options) {
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
           
           /*_.each(this.get('node'), function(el, idx) {
               
               if (el['children'] !== undefined) {
                   var ch = el['children'];
                   el['children'] = [];
                   _.each(ch['node'], function(sub, id) {
                       sub['folder'] = false;
                       el['children'][id] = sub;
                   })   
               } 

           });           */
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
            option     : [
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
            this.get('option').push(element);
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
            this.get('option').splice(index, 1);
            this.trigger('change');
        },
        
        saveOption: function(index, obj, select) {
            this.get('option')[index] = obj;
            if (select === true) {
                this.set('defaultValue', obj['value']);
            };
            this.trigger('change');
        },
        
        getOption: function(index) {
            return this.get('option')[index];
        },
        
        getXML: function() {
            var xml = formBuild.BaseField.prototype.getXML.apply(this, arguments) + '<defaultValue>' + this.get('defaultValue') + '</defaultValue>';
            console.log (this)
            console.log ("OP : ", this.get('option'))
            _.each(this.get('option'), function(el) {
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
            option: [
                {
                    label: {type: "string"},
                    value: {type: "string"}
                }
            ]
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
        xmlTag  : 'field_checkBox'
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
var formBuilder = (function(formBuild) {

    /**
     * Return if the XML Content is valid
     * 
     * @param {string} xmlContent xml content to check
     * @returns {array|Boolean} a boolean if everything is ok or an array with the errors
     */
    formBuild.XMLValidation = function(xmlContent) {
            var result;
            $.ajax({                
                url         : 'xml/NS_Schema.xsd',
                dataType    : 'html',
                async       : false                
            }).done(function(data) {
                
                var Module = {
                    xml         : xmlContent,
                    schema      : data,
                    arguments   : ["--noout", "--schema", 'NS_Schema.xsd', 'output.xml']
                }, xmllint = validateXML(Module);

                if (xmllint.indexOf('validates') > 0) {
                    result = true;
                } else {
                    var split   = xmllint.split(':');
                    result      = {
                        error   : split[3],
                        element : split[2],
                        message : split[split.length - 1].split('.', 1)[0]
                    };
                }

            }).error(function(jqXHR, textStatus, errorThrown) {
                throw errorThrown.message;
            });

            return result;
    };
    
    /**
     * 
     * @param {type} baseTText
     * @param {type} newText
     * @param {type} selector
     * @param {type} contextSize
     * @param {type} baseTextName
     * @param {type} newTextName
     * @param {type} inline
     * @returns {diffview.buildView.ctelt.e|Element|diffview.buildView.celt.e}
     */
    formBuild.GetXMLDiff = function (baseText, newText, baseTextName, newTextName, inline, contextSize) {
        
        var base    = difflib.stringAsLines(baseText), 
            newtxt  = difflib.stringAsLines(newText),
            sm      = new difflib.SequenceMatcher(base, newtxt),
            opcodes = sm.get_opcodes();

        // build the diff view and add it to the current DOM
        return diffview.buildView({
            baseTextLines   : base,
            newTextLines    : newtxt,
            opcodes         : opcodes,
            // set the display titles for each resource
            baseTextName    : baseTextName  || 'Source file',
            newTextName     : newTextName   || 'Updated file',
            contextSize     : contextSize   || null,
            viewType        : inline        ||  0
        });
    };
    
    /**
     * 
     * @param {type} title
     * @param {type} msg
     * @returns {undefined}
     */
    formBuild.displayError = function(title, msg) {
        var modal = $(
                        '<div id="dialog-message" title="' + title + '">' +
                            '<p>' +
                                '<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 50px 0;"></span>' +
                                msg +
                            '</p>' +
                        '</div>'
                    );
        $(modal).dialog({
            modal       : true,
            width       : 500,
            height      : 250,
            position    : 'center',
            draggable   : false,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });
    };
    
    return formBuild;

})(formBuilder);
/**
 * @fileOverview view.js
 * This file implements all field and specific views
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *                  jqueryui
 *                  model.js
 *                  collection.js
 *
 * Each views (exept settings views : Settingview) has a class property "templateSrc".
 * That property contains the view HTML code for backbone templating render.
 *
 * Some views uses jquery ui to add some effect and for a better interface.
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

var formBuilder = (function(formBuild) {
    
    /**
     * It's the basic views for all field view.
     */
    formBuild.BaseView = Backbone.View.extend({
        events: {
            'click  .fa-trash-o' : 'removeView',
            'click .fa-wrench'   : 'setting',
            'focus input'        : 'updateSetting'
        },
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView', 'setting', 'updateSetting', 'getHtml', 'deleteView');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);
        },
        updateIndex: function(idx) {
            this.model.id = parseInt(idx);
        },
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },
        getHtml : function() {
            return this.html(this.model.toJSON());
        },
        deleteView : function() {
            $(this.el).remove();
            this.remove();
        },
        removeView: function() {
            //this.model.collection.remove(this.model);
            //this.model.trigger('destroy');
            this.model.set('state', 'delete');
            $(this.el).remove();
            this.remove();
        },
        updateSetting : function() {
            if (!$('.dropArea').hasClass('span9')) {
                formBuild.set = new formBuild.SettingView({
                    model: this.model,
                    el: $('.settings')
                }).render();
            }
        },
        setting: function() {
            if ($('.dropArea').hasClass('span9')) {
                formBuild.settingsView.changeModel(this.model);
            }
        }
    });
    
    /**
     * View for text field element
     * Herited from base view
     */
    formBuild.TextFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name %>" readonly="<%= readOnly %>"  id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * View for pattern field
     */
    formBuild.PatternFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name["displayLabel"] %>" readonly="<%= readOnly %>"  id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" pattern="<%= pattern %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    /**
     * file field view
     */
    formBuild.FileFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="file" class="span8" name="<%= name["displayLabel"] %>"  id="<%= id%>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    /**
     * NumericFieldView
     */
    formBuild.NumericFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input').spinner({
                step: this.model.step,
                min : this.model.minValue
            }).parent('span').addClass('span8')
        }
    }, {
        templateSrc :   '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<input class="span12 spin" name="<%= name %>" step="<%= step %>" id="<%= id%>" placeholder="<%= hint %>" min="<%= minValue %>" max="<%= maxValue %>" value="<% defaultValue || 0 %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Radio field view
     */
    formBuild.RadioFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'click input[type="radio"]'        : 'updateSetting'
            });
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;" id="<%= id %>">'+
                            '<% _.each(option, function(el, index) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input type="radio" style="margin-left: 10px;" name="<%= name %>" value="<%= el.value%>" <% if (defaultValue == index) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Options field vue
     */
    formBuild.SelectFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change select'        : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).find(':selected').data('idx'), true);
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<select name="<% name %>" class="span8"> '+
                            '<% _.each(option, function(el, idx) { %>' +
                                '<option data-idx=<%= idx %> value="<%= el.value %>" <% if (defaultValue == idx) {%> selected <% } %> ><%= el.label %></option>'+
                            '<% }) %>' +
                        '</select> '+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    /**
     * Checkbox field view
     */
    formBuild.CheckBoxFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).data('idx'), $(e.target).is(':checked'));
        },
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;">'+
                            '<% _.each(option, function(el, idx) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input data-idx=<%= idx %> type="checkbox" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (defaultValue == idx) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Long text view
     */
    formBuild.LongTextFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },
        initialize : function() {
            formBuild.BaseView.prototype.initialize.apply(this, arguments);
            $(this.el).addClass('textArea');
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>" ><%= label %></label>'+
                        '<textarea class="span8" style="<% if(!resizable){ %>resize: none<%}%>" class="span8"  name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>"><%= defaultValue %></textarea>'+
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });
    
    /**
     * Tree view field view
     */
    formBuild.TreeViewFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        render : function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            var src = this.model.get('node');
            //console.log (src)
            $(this.el).find('#tree').fancytree({
                source: src,
                checkbox : true,
                selectMode : 2
            });
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>" ><%= label %></label>'+
                        '<div class="span8" id="tree"></div>' + 
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    /**
     * date field view
     */
    formBuild.DateFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
       render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input').datepicker({
               format: this.model.get('format')
           });
       }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Main form view
     */
    formBuild.FormView = Backbone.View.extend({
        events: {
            'change #protocolName' : 'changeFormName'
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'addElement', 'changeFormName', 'importXML', 'downloadXML', 'updateView', 'showVersionning');
            this.collection.bind('add', this.addElement);
            this.collection.bind('change', this.updateView);
            this._view = [];
        },
        
        updateView : function() {
          $(this.el).find('#protocolName').val(this.collection.name);
        },
        
        showVersionning : function(e) {

            for (var v in this._view) {

                if (this._view[v].model.get('state') === "delete") {
                    
                } else {
                    $(this._view[v].$el).addClass(this._view[v].model.get('state'));
                }

            }
            
            /*$(".drop").sortable('disable')
            $('.widgetsPanel').switchClass('span3', 'span0', 500, function() {
                $('.dropArea').switchClass('span9', 'span12', 250)
            });

            $('.drop').html("");
            
            var cpt = 0, id = "";
            
            _.each (this.collection.models, function(element, index) {
                
                var domElement = $('<div></div>');
                
                switch (element.get('state')) {
                    
                    case "new" :                         
                        id = "dropField" + cpt;        
                        $(domElement).append(
                            '<div class="row-fluid noMarginTop new" style="height : 35px; overflow : hidden">' + 
                            '   <div class="span6 grey" style="height : 35px;">&nbsp;</div>' + 
                            '   <div class="span6 dropField noMarginTop transparent" style="padding : 2px;"  id="' + id  + '" ></div>'+
                            '</div>'
                        );                      
                        break;
                        
                    case "none" : 
                        id = "dropField" + cpt;        
                        $(domElement).append(
                            '<div class="row-fluid noMarginTop">' + 
                            '   <div class="span12 dropField" id="' + id  + '" ></div>'+
                            '</div>'
                        );
                        break;
                        
                    case "delete" : 
                        id = "dropField" + cpt;        
                        $(domElement).append(
                            '<div class="row-fluid noMarginTop">' + 
                            '   <div class="span6 dropField" id="' + id  + '" ></div>'+
                            '   <div class="span6 delete">&nbsp;</div>' + 
                            '</div>'
                        );
                        break;
                        
                    case "change" : 
                        id = "dropField" + cpt;        
                        $(domElement).append(
                            '<div class="row-fluid noMarginTop">' + 
                            '   <div class="span6 dropField" id="' + id  + '" ></div>'+
                            '   <div class="span6 change>"&nbsp;</div>' + 
                            '</div>'
                        );
                        break;
                        break;
                }
                
                if (formBuild[element.constructor.type + "FieldView"] !== undefined) {
                    console.log ($(domElement).html())
                    $('.drop').append( $(domElement).html() );
                    var vue = new formBuild[element.constructor.type + "FieldView"]({
                        el      : $("#" + id),
                        model   : element
                    });
                    vue.render();
                    $("#" + id).find('.fa').hide()
                    cpt++;
                }
                
                
                
            });*/
        },
        
        addElement: function(el) {
            
            var id = "dropField" + this.collection.length;
        
            $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');            
            
            if (formBuild[el.constructor.type + "FieldView"] !== undefined) {
                var vue = new formBuild[el.constructor.type + "FieldView"]({
                    el      : $("#" + id),
                    model   : el
                });

                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                }
            } else {
                formBuilder.displayError("Error", "Can't create view for this field");
            }
            
        },
        render: function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            var _vues = this._view;
            $(".drop").sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".dropField",
                connectWith : ".sortable",
                handle      : 'label, input[type="text"]',
                containement: '.dropArea',
                stop: function(event, ui) {
                    for (var v in _vues) {
                        _vues[v].updateIndex($('#' + v).index());
                    }
                }
            }).disableSelection();
            return this;
        },
        changeFormName: function() {
            this.collection.name = $('#protocolName').val();
        },
        downloadXML: function() {
            var str = '<div id="popup">' + this.constructor.popupDwSrc + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create: function() {
                    var parent = $(this);
                    $(this).find('button').bind('click',function() {
                        if ($(parent).find('input[type="text"]').val() !== "") {
                            try {
                                var isFileSaverSupported = !!new Blob();
                                var blob = new Blob(
                                        [coll.collection.getXML()],
                                        {type: "application/xml;charset=utf-8"}
                                );
                                saveAs(blob, $(parent).find('input[type="text"]').val() + '.xml');
                                $(parent).dialog('close');
                            } catch (e) {
                                console.log (e)
                                formBuild.displayError("Error", "Can't create file");
                            }
                        } else {
                            formBuild.displayError("Error", "You need to enter a name for your file");
                        }
                    });
                }
            });
        },
        importXML: function() {
            var str = '<div id="popup">' + this.constructor.popupSrc + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create : function() {
                    var parent = $(this);
                    $(this).find('input[type="file"]').bind("change", function() {
                        var split = $(this).val().split('\\');
                        $(parent).find('#fileToImport').val( split[ split.length - 1] );
                    });
                    $(this).find('#findButton').bind('click', function() {
                        $(parent).find('#fileToImportHide').trigger('click');
                    });
                    $(this).find('#fileToImport').bind('click', function() {
                        $(parent).find('#fileToImportHide').trigger('click');
                    });
                    $(this).find('#importButton').bind('click', function() {
                        $(parent).dialog('close');
                        var file = $(parent).find('#fileToImportHide')[0].files[0];

                        if (file) {
                            if (file.type === "text/xml") {
                                var reader = new FileReader();
                                reader.readAsText(file, "UTF-8");
                                reader.onload = function(evt) {
                                    //try {
                                        
                                        var result = formBuild.XMLValidation(evt.target.result);
                                        if (result !== true) {
                                            var str = 'There is a error on the ' + result['element'] + '<br />';
                                            str += result['message'] + '<br />Please check your XML file';
                                            formBuild.displayError(result['error'], str);
                                        } else {
                                            coll.collection.updateWithXml(evt.target.result);
                                        }
                                    /*} catch (err) {
                                        var str = "Your XML File can't be validated.<br />The specific error is : " + err;
                                        formBuild.displayError('Error during XML validation', str);
                                    }*/
                                };
                                reader.onerror = function(evt) {
                                    formBuild.displayError("An error was occured", 'An error was occure during reading file');
                                };
                            } else {
                                formBuild.displayError("File type error", 'Your have to give an XML file.');
                            }
                        } else {
                            formBuild.displayError("An error was occured", 'An error was occure during reading file');
                        }
                    });
                }
            });
        }
    }, {
        templateSrc:    '<div class="row-fluid">'+
                            '<input type="text" id="protocolName" name="protocolName" value="<%= this.collection.name %>" />'+
                            '<hr class="mainHr"/><br />' +
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<div class="span10 offset1 drop"></div>'+
                        '</div>',

        popupSrc:   '<div id="popup" class="row-fluid">'+
                        '<h2 class="offset1">Your XML will be validate after import</h2><br />'+
                        '<div class="row-fluid">'+
                            '<input type="file" id="fileToImportHide"  class="hide" />'+
                            '<label class="span2 offset1">XML file</label>'+
                            '<input type="text" class="span5" id="fileToImport" placeholder="Your XML File" />'+
                            '<button type="button" class="span3" id="findButton" style="margin-left: 10px;">Find</button>'+
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<br />'+
                            '<button class="span4 offset3" id="importButton">Import</button>'+
                        '</div>'+
                    '</div>',

        popupDwSrc: '<div id="popupDownload" class="row-fluid">'+
                        '<div class="row-fluid">'+
                            '<h2 class="offset1 span10 center">Now you can download your XML File</h2>'+
                        '</div>'+
                        '<br />'+
                        '<div class="row-fluid">'+
                            '<label class="span4 offset1 right" style="line-height: 30px;">XML file name</label>'+
                            '<input type="text" class="span5" id="fileName" placeholder="Your XML filename" />'+
                        '</div>'+
                        '<br />'+
                        '<div class="row-fluid">'+
                            '<button type="button" class="span10 offset1" id="downloadButton">Dowload</button>'+
                        '</div>'+
                        '<br />'+
                    '</div>'
    });

    /**
     * Settings field view
     */
    formBuild.SettingView = Backbone.View.extend({
        
        events: {
            'click .close'          : 'hidePannel',
            'change .property'      : 'updateModel',
            'click .addOption'      : "addOption",
            'click h2 > a'          : 'displayOptions',
            /*'click .saveOp'         : 'saveOption',
            'click .cancelOp'       : 'cancelOption',
            'click .removeOp'       : 'removeOption',
            'click .editOp'         : 'editOption',
            'click .saveChangeOp'   : 'saveChangeOption',
            'click .cancelChangeOp' : 'cancelChangeOption',*/
            'click #accordion h1'   : 'accordion',
            
            'click .edit' : 'editOption',
            'click .remove' : 'removeOption'
        },
        
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 
                            'hidePannel', 
                            'removePanel', 
                            'changeModel', 
                            'addOption', 
                            'getSubTemplateForArray', 
                            'getSubTemplateForObject'
                        );
            this.model = null;
            this._op = true;
        },
        
        /**
         * Display advanced model field
         */
        displayOptions: function(e) {
            if (!$(e.target).hasClass('selected')) {
                $(".settings h2 > a").toggleClass('selected');
                if ($(e.target).prop('id') === "simple") {
                    $('.advanced').addClass('hide', 500);
                } else {
                    $('.advanced').removeClass('hide', 500);
                }
            }
        },
            
        /**
         * Change the view's model
         * @param {type} model new model
         */
        changeModel : function(model) {
            if (! this.model === null) {
                this.model.off( null, null, this );
                this.model = null;
            }
            this.model = model;
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.removePanel);

            $('.dropArea').switchClass('span9', 'span7', 100);
            $('.widgetsPanel').toggle(100);
            this.render();
        },
        
        removePanel: function() {
          this.hidePannel();
        },
        
        /**
         * Render the view in HTML
         */
        render: function() {
            if (this.model !== null) {
                var renderedContent = this.template(this.model.toJSON());
                $(this.el).html(renderedContent);
                if (this._op) {
                    $('#optionsPanel').addClass('toggle');
                } else {
                    $('#settingsPanel').addClass('toggle');
                }
                return this;
            }
        },
        
        /**
         * Hide the panel using jquery ui effect
         */
        hidePannel : function() {
            if ($('.dropArea').hasClass('span7')) {
                $('.dropArea').switchClass('span7', 'span9', 100);
                $('.widgetsPanel').toggle(100);
                this._op = true;
            }
        },
        
        /**
         * Update model property when input value has changed
         */
        updateModel: function(e) {
            if ($(e.target).prop("type") === "checkbox") {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            } else {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
            }
            this.model.set('state', 'change');
        },
        
        /**
         * Run graphic effects when accordion event is send by the view
         */
        accordion: function(e) {
            $(e.target).next('div').siblings('div').slideUp();
            $(e.target).next('div').slideToggle();
        },
        
        /**
         * Remove option for an array field in the model (like "options" field)
         */
        removeOption: function(e) {
            if (confirm("Are you sur ?")) {
                this._op = false;
                this.model.removeOption( $(e.target).parents('tr').prop("id") );
            }
        },
        
        
        addOption : function(e) {
            
            var html =  '<div id="myModal" class="modal span8 offset2 fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
                        '   <div class="modal-header">'+
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                        '       <h3 id="myModalLabel">Add an option</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">';
                _.each(this.model.constructor.schema['options']['values'], function(element, index) {
                    html +=     '<div class="row-fluid">'+
                                '   <input type="text" class="span8 offset2 object" data-index="'+index+'" placeholder="' + index + '"' + ' />'+
                                '</div><br />';
                });
                html += '       <div class="row-fluid"><label class="span3 offset2">Is the default value ? </label><input type="checkbox" /></div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                        '       <button class="btn btn-primary saveChange">Save changes</button>'+
                        '   </div>'+
                        '</div>';
                
            var popup = $(html);
            $(popup).modal();
            $(popup).find('.saveChange').bind('click', _.bind(function(e) {
                var newOption = {};
                
                $(popup).find('.object').each( function(index, element) {
                   newOption[ $(element).data('index') ] = $(element).val();
                });
                
                this.model.addOption(newOption, $(popup).find('input[type="checkbox"]').is(':checked'));
            }, this));
        },
        
        editOption : function(e) {
            var parent  = $(e.target).closest('tr'),
                select  = $(parent).find('[data-index="default"]').text() === "Yes" ? true : false,
                index   = $(parent).prop('id'),
                obj     = {};
                $(parent).find('.object').each(function(index, element) {
                    obj[ $(element).data('index') ] = $(element).text();
                });
        
            var html =  '<div id="myModal" class="modal span8 offset2 fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
                        '   <div class="modal-header">'+
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                        '       <h3 id="myModalLabel">Add an option</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">';
                _.each(this.model.constructor.schema['options']['values'], function(element, index) {
                    html +=     '<div class="row-fluid">'+
                                '   <input type="text" class="span8 offset2 object" data-index="'+index+'" placeholder="' + index + '"' + ' value="' + obj[index] + '" />'+
                                '</div><br />';
                });
                html += '       <div class="row-fluid"><label class="span3 offset2">Is the default value ? </label><input type="checkbox"' +(select ? "checked" : "") + '/></div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                        '       <button class="btn btn-primary saveChange">Save changes</button>'+
                        '   </div>'+
                        '</div>';
                
            var popup = $(html);
            
            $(popup).modal();
            
            $(popup).find('.saveChange').bind('click', _.bind(function(e) {
                
                obj = {};
                
                $(popup).find('.object').each( function(index, element) {
                   obj[ $(element).data('index') ] = $(element).val();
                });
                
                this.model.saveOption(index, obj, $(popup).find('input[type="checkbox"]').is(':checked'));
                $(popup).modal('hide');
                
            }, this));
        },
        
        
        /**
         * Get HTML template for an element
         * 
         * @param {type} element
         * @param {type} idx
         * @param {type} type
         * @param {type} section
         * @returns {String}
         */
        getSubTemplateHTML : function(element, idx, type, section) {
            
            switch (type) {
                
                case "integer" : 
                    var str = (section === "advanced") ? '<div class="advanced hide">' : '<div>';

                    return  str + '<div class="row-fluid">' +
                            '   <label class="span10 offset1">' + idx + '</label>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                            '   <input class="span10 offset1 property" type="number" data-attr="' + idx + '" placeholder="' + idx + '" value="' + element + '" />' +
                            '</div></div>';
                    
                case "string":
                default : 
                    var str = (section === "advanced") ? '<div class="advanced hide">' : '<div>';

                    return  str + '<div class="row-fluid">' +
                            '   <label class="span10 offset1">' + idx + '</label>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                            '   <input class="span10 offset1 property" type="text" data-attr="' + idx + '" placeholder="' + idx + '" value="' + element + '" />' +
                            '</div></div>';

                    case "boolean" :
                        if (section === "advanced") {
                            var str = '<div class="row-fluid advanced hide">&nbsp;</div><div class="row-fluid advanced hide">';
                        } else {
                            var str = '<div class="row-fluid">&nbsp;</div><div class="row-fluid">';
                        }

                        str += '   <label class="span4 offset1">' + idx + ' : </label>' +
                                '   <input class="span2 property" data-attr="' + idx + '" type="checkbox" ' + (element === true ? 'checked' : ' ') + ' />' +
                                '</div>';
                        return str;
            }
        },

        /**
         * Run through an object field and return the HTML
         * 
         * @param {type} element
         * @param {type} idx
         * @returns {String}
         */
        getSubTemplateForObject: function(element, idx) {

            var str = "", type = "", section = "";

            _.each(element, _.bind(function(subElement, index) {

                type    = this.model.getSchemaProperty(idx + "/" + index, 'type');
                section = this.model.getSchemaProperty(idx + "/" + index, 'section');

                str     += (type === "object") ? this.getSubTemplateForObject(subElement, idx + "/" + index) : this.getSubTemplateHTML(subElement, idx + "/" + index, type, section);

            }, this));

            return str;
        },
        
        /**
         * Return a table html template for array type element
         * 
         * @param {type} element
         * @param {type} idx
         * @returns {String}
         */
        getSubTemplateForArray : function(element, idx) {
            
            var i   = 0;
            var str =   '<div class="row-fluid">'+
                        '   <label class="span10 offset1">' + idx + '</label>'+
                        '</div>'+
                        '<table class="table table-stripped span10 offset1">' +
                        '   <thead>' +
                        '       <tr>';
            _.each (this.model.constructor.schema[idx]['values'], function(subHead, index) {
                str += '        <th>' + index + '</th>';
            });
            str +=      '       <th>Default value</th>'+
                        '       <th>Action</th>'+
                        '       </tr>' +
                        '   </thead>'+
                        '   <tbody>';
                
            _.each(element, _.bind(function(subElement, index) {
                str +=  '       <tr id="' + i + '">';
                _.each(subElement, function(values, id) {
                    str += '        <td data-index="'+ id + '" class="object">' + values + '</td>';
                });                
                str +=  '           <td data-index="default">' + ((subElement['value'] === this.model.get('defaultValue') ? "Yes" : "No")) + '</td>' +
                        '           <td><a href="#" class="edit">Edit</a> / <a href="#" class="remove">Remove</td>' +
                        '       </tr>';
                i++;
            }, this));            
            str +=      '       <tr>' + 
                        '           <td colspan="' + (_.size(element) + 2) + '" class="center">' +
                        '               <a href="#" class="addOption">Add an option</a>' + 
                        '           </td>'+
                        '       </tr>' +
                        '   </tbody>' +
                        '</table>';
                
            return str;
        },
        
        /**
         * Return field element HTML template
         * 
         * @param {type} element the element field
         * @param {type} idx the element field name
         * @returns {String} HTML template for model fields
         */
        getTemplate : function(element, idx, type) {    
            
            var el = this.model.constructor.schema[idx];

            if (el !== undefined) {
                
                var section = this.model.constructor.schema[idx];
                type    = type !== undefined ? type : this.model.constructor.schema[idx]['type'];

                switch (type) {
                    case "integer":
                    case "string" :
                    case "boolean":
                        return this.getSubTemplateHTML(element, idx, type, section);
                        break;

                    case "array" :
                        return this.getSubTemplateForArray(element, idx);
                        break;

                    case "object":
                        return this.getSubTemplateForObject(element, idx);
                        break;
                    
                    default : 
                        return "none";
                        break;
                }
            }

        }
        
    }, {
        templateSrc:    '<div id="accordion">'+
                        '   <h1>Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <a href="#" id="simple" class="selected">Simple options</a> / <a href="#" id="advanced">Advanced options</a>'+
                        '       </h2>'+
                        '       <% _.each(this.model.attributes, _.bind(function(el, idx) { %> ' +
                        '           <%= this.getTemplate(el, idx) %>' +
                        '       <%}, this)); %>' +
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '   <button class="close center" style="width: 100%">Save</button>'+
                        '</div>'
    });

    /**
     * Panel view
     */
    formBuild.PanelView = Backbone.View.extend({
        events: {
            'dblclick .fields': 'appendToDrop'
        },
        initialize: function(collection) {
            this._collection = collection;
            _.bindAll(this, 'appendToDrop');
        },
        appendToDrop : function(e) {
            $(e.target).disableSelection();
            
            if (formBuild[$(e.target).data("type") + 'Field'] !== undefined) {
                var f = new formBuild[$(e.target).data("type") + 'Field']({
                    id: this.collection.getSize()
                });
                this.collection.add(f);
            } else {
                alert ("Can't create field object");
            }            
        },
        render: function() {
            $(this.el).html(this.constructor.templateSrc);
            $('.fields').disableSelection();
            $(this.el).nanoScroller();
            return this;
        }
    }, {
        templateSrc :   '<div class="nano-content">'+
                            '<h1 class="center">Fields</h1>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Text">' +
                                    'Text' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Pattern">' +
                                    'Pattern' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="File">' +
                                    'File picker' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="LongText">' +
                                    'Long Text' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="TreeView">' +
                                    'Tree view' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Radio">' +
                                    'Radio buttons'+
                                '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="CheckBox">' +
                                    '<i class="fa fa-check-square-o"></i>&nbsp;Checkboxes' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Select">' +
                                    'Options' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Numeric">' +
                                    'Numéric' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Date">' +
                                    'Date' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Hidden">' +
                                    'Hidden' +
                                '</div>' +
                            '</div>'+
                            '<h1 class="center">Layouts</h1>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="hr">' +
                                    'Horizontal line' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="fieldset">' +
                                    'Fieldset' +
                                '</div>' +
                            '</div>'+
                        '</div>'
    });

    /**
     * Hidden field view
     */
    formBuild.HiddenFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {});
        }
    }, {
        templateSrc :   '<label class="span3 grey">My hidden field</label> '+
                        '<input type="text" disabled class="span8" name="<%= name %>" id="<%= id%>" value="<%= value %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    //  -------------------------------------------------------
    //  Only graphical value
    //  -------------------------------------------------------
    
    /**
     * Display an horizontal line in the form
     */
    formBuild.HorizontalLineView = formBuild.BaseView.extend({
        render : function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            $(this.el).addClass('min');
        }
    }, {
        templateSrc:    '<hr class="span10 offset1" />' +
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i> '+
                        '</div>'
    });
    
    return formBuild;

})(formBuilder);