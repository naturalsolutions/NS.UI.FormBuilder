define([
    'underscore',
    'backbone',
    'text!../../../templates/modals/clearProtocol.html',
    'bootstrap'
], function(_, Backbone, clearProtocolTemplate) {

    var ClearProtocolModelView = Backbone.View.extend({

        events: {
            'click .btn-lg': 'clearProtocol',
        },

        initialize: function(options) {
            this.template = _.template(clearProtocolTemplate);
            _.bindAll(this, 'render', 'clearProtocol', 'getData');
        },

        render: function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({
                show: true
            });
            return this;
        },

        clearProtocol: function(e) {
            this.state = $(e.target).data('value');
            $(this.el).modal('hide').removeData();
        },

        getData: function() {
            return this.state;
        }

    });

    return ClearProtocolModelView;

});