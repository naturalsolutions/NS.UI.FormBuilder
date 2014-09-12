define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var TableField = Backbone.Model.extend({

        defaults: {
            fields: [],
        },

        initialize: function(options) {
            BaseField.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'moveModel', 'addModel', 'removeModel', 'getXML');
        },

        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments)
            _.each(this.get('fields'), function(el, idx) {
                xml += '<' + el.constructor.xmlTag + ' id="' + el.get('id') + '" >' + el.getXML() + '</' + el.constructor.xmlTag + '>'
            });
            return xml;
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

        moveModel: function(currentIndex, newIndex) {
            var arr = this.get('fields');

            if (arr[newIndex] !== undefined) {
                var tmp = arr[currentIndex];
                arr[currentIndex] = arr[newIndex];
                arr[newIndex] = tmp;
            } else {
                arr[newIndex] = arr[currentIndex];
                delete arr[currentIndex];
            }
            this.set('fields', arr);
            this.trigger('update', currentIndex, newIndex);
            this.trigger('done');
        }

    }, {
        type: 'Table',
        xmlTag: 'field_table',
        i18n: 'table'
    });

    return TableField;

});