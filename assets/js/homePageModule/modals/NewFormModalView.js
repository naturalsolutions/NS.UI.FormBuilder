define([
    'underscore',
    'backbone',
    'text!homePageModule/templates/modals/NewFormModalView.html',
    'app-config',
    'bootstrap',
    'i18n'
], function(_, Backbone, exportJSONTemplate, AppConfig) {

    /**
    * Model view used to import a form in the formbuilder with a JSON file
    */
    var NewFormModalView = Backbone.View.extend({

        /**
         * View events
         */
        events: {
            'click #createForm'               : 'createForm',
            'keypress input[type="text"]'     : 'triggerClick'
        },

        /**
         * Initialize the view and bind context
         */
        initialize: function(options) {
            this.template = _.template(exportJSONTemplate);
            _.bindAll(this, 'render', 'createForm');

            this.templates = options.templates || [];
            this.onClose = options.onClose;

            if (AppConfig.appMode.topcontext == "reneco")
                this.templates = [];

            console.log("templates = ");
            console.log(this.templates);
        },

        /**
         * Render view and run model view with bootstrap
         * @returns {ExportJSONProtocolModalView}
         */
        render: function() {
            var renderedContent = this.template(this);
            $(this.el).html(renderedContent);
            $(this.el).modal({
                show: true
            });
            this.$el.i18n();

            return this;
        },

        createForm : function(e) {
            this.onClose(
                this.$el.find('#formName').val(),
                this.$el.find('#templateName').val()
            );
            $(this.el).modal('hide').removeData();
        },

        triggerClick : function(e) {
            var key = e.which;
            if(key === 13) {
                this.$el.find('#createForm').trigger('click');
            }
        }

    });

    return NewFormModalView;

});