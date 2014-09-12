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
            if (index.indexOf("[") > 0) {
                //  Complexe attribute
                var split = index.split('['), firstSelector = split.shift(), currentObject = this.get(firstSelector);

                split.forEach(function(element, idx, array) {
                    if (idx === array.length - 1) {
                        currentObject[ element.substr(0, element.length - 1) ] = value;
                    } else {
                        currentObject = currentObject[ element.substr(1, element.length - 1) ];
                    }
                });

                this.trigger('change');
            } else {
                this.set(index, value);
            }
        }

    }, {
        schema : {
            id : {
                type    : "Number",
                editorClass : 'advanced'
            },
            label   : {
                type : "Text",
                section : "simple",
                title : 'Label'
            },
            name : {
                type : 'Object',
                subSchema : {
                    label : {
                        type : 'Object',
                        subSchema : {
                            value : { type : 'Text' },
                            lang  : { type : 'Text' }
                        }
                    },
                    displayLabel : {
                        type : 'Text'
                    }
                }
            },
            required : {
                type : 'Checkbox'
            },
            readonly : {
                type : 'Checkbox',
                editorClass : 'advanced'
            }
        }
    });

    return BaseField;

});