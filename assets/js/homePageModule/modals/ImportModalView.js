define([
    'underscore',
    'backbone',
    'text!homePageModule/templates/modals/ImportModalView.html',
    'bootstrap',
    'i18n'
], function(_, Backbone, exportJSONTemplate) {

    /**
     * Model view used to import a form in the formbuilder with a JSON file
     */
    var ExportJSONProtocolModalView = Backbone.View.extend({

        /**
         * View events
         */
        events: {
            'click #importForm'               : 'importForm',
            'click .find, input[type="text"]' : 'triggerClick',
            'change input[type="file"]'       : 'setText'
        },

        /**
         * Initialize the view and bind context
         */
        initialize: function() {
            this.template = _.template(exportJSONTemplate);
            _.bindAll(this, 'render', 'importForm', 'triggerClick');
        },

        /**
         * Render view and run model view with bootstrap
         * @returns {ExportJSONProtocolModalView}
         */
        render: function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({
                show: true
            });
            this.$el.i18n();
            return this;
        },

        /**
         * Trigger click on the real input file when user clicks on the button
         */
        triggerClick : function() {
            this.$el.find('input[type="file"]').trigger('click')
        },

        /**
         * Currently web browsers lock access to input file path, some browser done fake path
         * So we display only the filename
         * @param e jquery event
         */
        setText : function(e) {
            if ($(e.target).val() != "") {
                var split = $(e.target).val().split('\\');
                $(this.el).find('input[type="text"]').val(split[split.length -1]);
            }
        },

        /**
         * Import form
         * @param e
         */
        importForm: function(e) {
            var val         = $(this.el).find('input[type="text"]').val(),
                fileSelect  = val != "";

            $(this.el).find('input[type="text"]')[fileSelect ? 'removeClass' : 'addClass']('error');

            if (fileSelect) {
                $(this.el).modal('hide').removeData();
            }
        },

        /**
         * Return datas
         *
         * @returns {{file: *}}
         */
        getData: function() {
            return {
                file : $(this.el).find('input[type="file"]')[0]
            }
        }

    });

    return ExportJSONProtocolModalView;

});