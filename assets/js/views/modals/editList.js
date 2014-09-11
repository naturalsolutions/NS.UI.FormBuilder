define(['underscore', 'backbone', 'text!../../../templates/modals/editListModal.html'], function(_, Backbone, editListModalTemplate) {

    var EditListModal = Backbone.View.extend({

        events : {
            'click #addItem'                : 'addItem',
            'click .btn-primary'            : 'saveChanges',
            'change input[type="text"]'     : 'propertyChanged',
            'change input[type="radio"]'    : 'defaultValueChanged',
            'click td .close'               : 'removeItem',
            'hidden'                        : 'close'
        },

        initialize : function (){
            this.template = _.template(editListModalTemplate);
            _.bindAll(this, 'saveChanges', 'propertyChanged', 'defaultValueChanged', 'removeItem');
        },

        render: function() {
            var renderedContent = this.template(this.model);
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });
            return this;
        },

        close : function(e) {
            var len = this.model["items"].length, last = this.model["items"][len - 1];

            if (last["en"] === "" || last["fr"] === "" || last["value"] === "") {
                this.model["items"].splice(len - 1, 1);
            }

            this.remove();
            this.unbind();
            $('#compareModal').after('<div class="modal hide fade" id="editListModal"></div>');
        },

        addItem : function(e) {
            var index = this.model['items'].length, check = true;


            if (this.model['items'][index - 1]["en"] === "" ) {
                check &= false;;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="en"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="en"]').removeClass('error');
            }

            if (this.model['items'][index - 1]["fr"] === "" ) {
                check &= false;;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="fr"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="fr"]').removeClass('error');
            }

            if (this.model['items'][index - 1]["value"] === "" ) {
                check &= false;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').removeClass('error');
            }

            if (check) {
                this.model['items'].push({
                    en : "", value : "", id : index, fr : ""
                });
                $(e.target).parents('tr').before(
                    '<tr>'+
                    '   <td>'+
                    '       <input type="text" data-attr="en" placeholder="New item label" data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="text" data-attr="fr" placeholder="New item label" data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="text" data-attr="value" placeholder="New item value"  data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="radio"  data-index="' + index + '" name="defaultValue" /> <button type="button" data-index="' + index + '" class="close">&times;</button>'+
                    '   </td>'+
                    '</tr>'
                );
            }

        },

        removeItem : function(e) {
            this.model['items'].splice($(e.target).data('index'), 1);
            $(e.target).parents('tr').remove();
            if (this.model['items'].length === 1) {
                this.model['defaultValue'] = 0;
                $(this.el).find('input[type="radio"]').prop('checked', true);
            }
        },

        saveChanges : function() {

            var end =_.bind(function(options) {
                if (options === true) {
                    $(this.el).modal('hide');
                    this.trigger('saved');
                }
            }, this);

            var checkValues = _.bind(function(callback) {
                var check = true;
                _.each( this.model['items'], function(el, idx) {
                    if (el['en'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="en"]').addClass('error');
                    }
                    if (el['fr'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="fr"]').addClass('error');
                    }
                    if (el['value'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="value"]').addClass('error');
                    }
                });
                callback(check);
            }, this);

            checkValues(end);
        },

        propertyChanged : function(e) {
            if ($(e.target).val() === "") {
                $(e.target).addClass('error');
            } else {
                $(e.target).removeClass('error');
                var itemIndex       = $(e.target).data('index'),
                    itemAttribute   = $(e.target).data('attr'),
                    attributeValue  = $(e.target).val();

                this.model["items"][itemIndex][itemAttribute] = attributeValue;
            }
        },

        defaultValueChanged : function(e) {
            this.model['defaultValue'] = $(e.target).data('index');
        }

    });

    return editListModal;

});