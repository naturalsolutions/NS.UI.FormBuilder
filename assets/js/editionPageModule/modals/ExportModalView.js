define([
    'underscore',
    'backbone',
    'text!editionPageModule/templates/modals/ExportModalView.html',
    'bootstrap',
    'fuelux',
    'i18n'
], function(_, Backbone, ExportModalViewTemplate) {

    var ExportJSONProtocolModalView = Backbone.View.extend({

        events : {
            'click button' : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(ExportModalViewTemplate);
            _.bindAll(this, 'render', 'getData');
            this.response = false;
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });
            $(this.el).i18n();
            return this;
        },

        /**
        * Validate information and send protocol to the repository
        *
        * @param {type} e primary button clicked event
        */
        validateProtocolSave : function (e){
            var exportProtocolComment = $('#exportProtocolFileName').val() === "";

            $('#exportProtocolFileName')[ exportProtocolComment === true ? 'addClass' : 'removeClass']("error");

            if (!exportProtocolComment) {
                $('#exportModal').modal('hide').removeData();
                this.response = true;
            }
        },

        getData : function() {
            return { filename : $('#exportProtocolFileName').val(), response : this.response}
        }

    });

    return ExportJSONProtocolModalView;

});
