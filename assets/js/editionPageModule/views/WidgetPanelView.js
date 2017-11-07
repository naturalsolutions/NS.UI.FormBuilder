define([
    'jquery',
    'marionette',
    'text!../templates/WidgetPanelView.html',
    '../models/Fields',
    '../../Translater',
    'backbone.radio',
    'app-config',
    'tools',
    'i18n',
    'jquery-ui'

], function($, Marionette, WidgetPanelViewTemplate, Fields, Translater, Radio, AppConfig, tools) {
    var WidgetPanelView = Backbone.Marionette.ItemView.extend({
        events: {
            'click div.col-md-3'                 : 'appendToDrop',
            'click div.col-md-10'                : 'appendToDrop',
            'click #smallFeatures .scroll > div' : 'appendToDrop'
        },

        template : function() {
            return _.template(WidgetPanelViewTemplate)({
                fieldTypes : this.fieldTypes
            });
        },

        initialize : function() {
            _.bindAll(this, 'template');

            this.initFieldTypes();
            this.formChannel = Backbone.Radio.channel('form');
        },

        /**
         * Click event callback
         * Launch when user wants to add a field in the form
         *
         * @param e jQuery event
         */
        appendToDrop : function(e) {
            var elementClassName = $(e.target).data("type");
            if (!Fields[elementClassName]) {
                tools.swal('error', 'modal.field.error', 'modal.field.errorMsg');
                return;
            }

            this.formChannel.trigger('addNewElement', elementClassName);
        },

        initFieldTypes : function() {
            var context = window.context || $("#contextSwitcher .selected").text().toLowerCase();

            // no soup for you
            if (!AppConfig.appMode[context] || context == "all") {
                return;
            }

            // insert each field found from specific context in config
            var fieldTypes = {};
            $.each(AppConfig.appMode[context], function (i, fieldType) {
                var field = Fields[fieldType];
                if (!field) {
                    // try appending "Field" suffix
                    fieldType += "Field";
                    field = Fields[fieldType];
                    if (!field) {
                        console.warn('field type "' + fieldType + '" from config is not implemented');
                        return;
                    }
                }
                fieldTypes[fieldType] = {
                    i18n             : fieldType.replace('Field', '').toLowerCase(),
                    doubleColumn     : field.doubleColumn !== undefined,
                    fontAwesomeClass : field.fontAwesomeClass
                };
            });
            this.fieldTypes = fieldTypes;
        },

        onRender : function() {
            this.$el.i18n();
        }

    });

    return WidgetPanelView;

});
