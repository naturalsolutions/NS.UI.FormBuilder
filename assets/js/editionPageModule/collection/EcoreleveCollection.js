/**
 * Created by David on 22/12/2015.
 */

define([
    'jquery',
    'backbone',
    '../models/Fields',
    '../editor/CheckboxEditor',
    '../editor/NumberEditor',
    'backbone.radio',
    '../../Translater',
    'auth',
    'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, CheckboxEditor, NumberEditor, Radio, translater, auth, FieldTemplate) {

    var fieldTemplate = _.template(FieldTemplate);
    var customNumberEditor = NumberEditor.extend({
        render: function(){
            NumberEditor.prototype.render.call(this);
            this.$el.append('<br/>');
            if(this.form.data.isgrid){
                this.form.afterRender = function(){
                    var nbFixedColEditor = this.getEditor('nbFixedCol');
                    nbFixedColEditor.$el.parent().parent().removeClass('hidden');
                };
            }
            return this;
        }
    });
    return {
        schemaExtention: {
            author : {
                type        : 'Hidden',
                title       : translater.getValueFromKey('form.author'),
                template    : fieldTemplate
            },
            isgrid : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "checkBoxEditor form-group",
                title       : translater.getValueFromKey('form.isgrid'),
                handlers: [function(value, input){
                    //handlers are called on input change
                    var nbFixedColEditor = input.form.getEditor('nbFixedCol');
                    if(input.getValue()){
                        nbFixedColEditor.$el.parent().parent().removeClass('hidden');
                    } else{
                        nbFixedColEditor.$el.parent().parent().addClass('hidden');
                        nbFixedColEditor.setValue('');
                    }
                }]
            },
            ishiddenprotocol : {
                type        : CheckboxEditor,
                template    : fieldTemplate,
                fieldClass  : "checkBoxEditor form-group",
                title       : translater.getValueFromKey('form.ishiddenprotocol')
            },
            nbFixedCol: {
                type: customNumberEditor,
                min: 0,
                template: fieldTemplate,
                fieldClass: 'hidden',
                title: translater.getValueFromKey('schema.nbFixedCol'),
                validators: [function checkValue(value) {
                    if (value < 0) {
                        return {
                            type: 'Invalid number',
                            message: translater.getValueFromKey('schema.nbFixedColMinValue')
                        };
                    }
                }]
            },
        },

        getExtractedDatas: function() {return {};},
        getSchemaExtention: function(){
            return this.schemaExtention;
        },
        initializeExtention: function () {
            return true;
        },

        jsonExtention: function (originalForm) {
            if (originalForm) {
                originalForm.author = auth.username;
            }
            return {
                author : auth.username,
                isgrid : "",
                ishiddenprotocol: "",
                hideprotocolname: "",
                defaultforfieldactivity: "",
                nbFixedCol: ""
            };
        },
        updateAttributesExtention: function () {return true;}
    };
});