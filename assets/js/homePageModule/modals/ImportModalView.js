define([
    'underscore',
    'backbone',
    'text!homePageModule/templates/modals/ImportModalView.html',
    'bootstrap'
], function(_, Backbone, exportJSONTemplate) {

    var ExportJSONProtocolModalView = Backbone.View.extend({

        events: {
            'click .btn-lg': 'importProtocol',
            'click .find, input[type="text"]' : function() {
                $(this.el).find('input[type="file"]').trigger('click')
            },
            'change input[type="file"]' : 'setText'
        },

        initialize: function(options) {
            this.template = _.template(exportJSONTemplate);
            _.bindAll(this, 'render', 'importProtocol');
        },

        render: function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({
                show: true
            });
            return this;
        },

        setText : function(e) {
            if ($(e.target).val() != "") {
                var split = $(e.target).val().split('\\');
                $(this.el).find('input[type="text"]').val(split[split.length -1]);
            }
        },

        importProtocol: function(e) {
            var val         = $(this.el).find('input[type="text"]').val(),
                fileSelect  = val != "";

            $(this.el).find('input[type="text"]')[fileSelect ? 'removeClass' : 'addClass']('error');

            if (fileSelect) {
                $(this.el).modal('hide').removeData();
            }
        },

        getData: function() {
            return {
                file : $(this.el).find('input[type="file"]')[0]
            }
        }

    });

    return ExportJSONProtocolModalView;

});