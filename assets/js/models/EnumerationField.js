define(['backbone', 'models/BaseField'], function(Backbone, BaseField) {

    var EnumerationField = BaseField.extend({

        defaults: function() {
            return _.extend(BaseField.prototype.defaults, {
                itemList: {
                    items: [{
                        id: 0,
                        value: "0",
                        en: "My first Option",
                        fr: 'Mon option'
                    }, {
                        id: 1,
                        value: "1",
                        en: "My second Option",
                        fr: 'Mon option 2'
                    }],
                    defaultValue: 1
                },
                multiple: false,
                expanded: false
            });
        },


        /**
         * Constructor
         *
         * Get BaseField schema and add it on EnumerationField schema
         */
        initialize: function() {
            BaseField.prototype.initialize.apply(this, arguments);
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
         * Return object XML content
         *
         * @returns {String} XML content
         */
        getXML: function() {
            var xml = BaseField.prototype.getXML.apply(this, arguments);

            xml += '<itemList>' +
                '<items>';
            _.each(this.get('itemList')['items'], function(el, idx) {
                xml += '<item id="' + el['id'] + '"><en>' + el['en'] + '</en><fr>' + el['fr'] + '</fr><value>' + el['value'] + '</value></item>';
            });
            xml += '</items>';
            xml += '<defaultValue>' + this.get('itemList')['defaultValue'] + '</defaultValue>';
            xml += '</itemList>';
            xml += '<expanded>' + this.get('expanded') + '</expanded>';
            xml += '<multiple>' + this.get('multiple') + '</multiple>';

            return xml;
        }

    }, {
        schema: function() {
            return _.extend(BaseField.Constructor.schema, {
                items: {
                    type: "array",
                    itemList: {
                        defaultValue: {
                            type: "string"
                        },
                        lang: {
                            type: "string"
                        },
                        type: "array",
                        items: {
                            label: {
                                type: "string"
                            },
                            value: {
                                type: "string"
                            }
                        }
                    }
                },
                expanded: {
                    type: "boolean"
                },
                multiple: {
                    type: "boolean"
                }
            });
        }
    });

    return EnumerationField;

});