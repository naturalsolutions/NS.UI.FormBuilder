define(['backbone'], function(Backbone) {

    var SubformField = Backbone.Model.extend({
        defaults: {
            id: 0,
            fields: [],
            legend: 'Fieldset',
            multiple: false
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
            models.BaseField.prototype.changePropertyValue.apply(this, arguments);
        },
    }, {
        type: 'Subform',
        xmlTag: 'fieldset',
        i18n: 'fieldset'
    });

    return SubformField;

});
