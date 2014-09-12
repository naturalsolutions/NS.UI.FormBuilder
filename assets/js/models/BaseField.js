define(['backbone'], function(Backbone) {

    var BaseField = Backbone.Model.extend({

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
                fieldClass : 'advanced'
            },
            label   : {
                type  : "Text",
                title : 'Label',
                editorClass : 'span10'
            },
            name : {
                type : 'Object',
                title : '',
                subSchema : {
                    label : {
                        title : '',
                        type : 'Object',
                        subSchema : {
                            value : { type : 'Text', title : 'Name label value', editorClass : 'span10'},
                            lang  : { type : 'Text', title : 'Name label lang', editorClass : 'span10' }
                        }
                    },
                    displayLabel : {
                        type : 'Text',
                        editorClass : 'span10'
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

    return BaseField;

});