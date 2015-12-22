define([
    'jquery',
    'marionette',
    'text!../templates/WidgetPanelView.html',
    '../models/Fields',
    '../../Translater',
    'backbone.radio',
    'sweetalert',
    'app-config',
    'i18n',
    'jquery-ui'

], function($, Marionette, WidgetPanelViewTemplate, Fields,Translater, Radio, swal, AppConfig) {

    //  Get singleton Translater object
    var translater = Translater.getTranslater();

    /**
     * Widget Panel contains contains avlaible field of the application
     */
    var WidgetPanelView = Backbone.Marionette.ItemView.extend({

        /**
         * View events
         */
        events: {
            'click div.col-md-5'                 : 'appendToDrop',
            'click div.col-md-10'                : 'appendToDrop',
            'click #smallFeatures .scroll > div' : 'appendToDrop',
            'click h3'                           : 'displayContent'
        },

        /**
         * Override template function with html template
         *
         * @returns {function}
         */
        template : function() {
            return _.template(WidgetPanelViewTemplate)({
                section : this.section
            });
        },

        /**
         * Initialize view
         *
         * @param options some options like template
         */
        initialize : function(options) {
            _.bindAll(this, 'template');

            this.initSection();
            this.initFormChannel();
        },

        /**
         * Init form channel
         */
        initFormChannel : function() {
            //  The widget panel view used this channel to send event when an user wants to add a field
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

            //  Check if the field type is a valid type
            if (Fields[elementClassName] !== undefined) {
                this.formChannel.trigger('addNewElement', elementClassName);
            } else {
                console.log("err 2");
                swal(
                    translater.getValueFromKey('modal.field.error') || "Echec de l'ajout!",
                    translater.getValueFromKey('modal.field.errorMsg') || "Une erreur est survenue lors de l'ajout du champ !",
                    "error"
                );
            }
        },

        /**
         * Get Fields information, like section, i18n translation ...
         */
        initSection : function() {
            var section = { standard : {}, other : {} };

            var checkDisplayMode = function(fieldType){
                if (AppConfig.appMode.hasOwnProperty(AppConfig.appMode.currentmode) &&
                    $.inArray(fieldType, AppConfig.appMode[AppConfig.appMode.currentmode]) == -1)
                    return (false);
                return (true);
            }

            for (var i in Fields) {
                if (Fields[i].type !== undefined && checkDisplayMode(Fields[i].type)) {
                    if (Fields[i].section === undefined) {
                        section['other'][i] = {
                            i18n             : i.replace('Field', '').toLowerCase(),
                            doubleColumn     : Fields[i].doubleColumn !== undefined,
                            fontAwesomeClass : Fields[i].fontAwesomeClass
                        }
                    } else {
                        if (section[Fields[i].section] === undefined) {
                            //  create new section
                            section[ Fields[i].section ] = {};
                        }
                        section[ Fields[i].section ][i] = {
                            i18n             : i.replace('Field', '').toLowerCase(),
                            doubleColumn     : Fields[i].doubleColumn !== undefined,
                            fontAwesomeClass : Fields[i].fontAwesomeClass
                        }
                    }
                }
            }

            this.section = section;
        },

        /**
         * Accordion callback
         *
         * I create a small accordion because the jquery accordion CSS breaks my application style
         *
         * @param e jQuery event
         */
        displayContent : function(e) {
            var accordion = $(e.currentTarget).data('accordion')
            $('.section[data-accordion!="content-' + accordion + '"]').slideUp(500, function() {
                $('.section[data-accordion="content-' + accordion + '"]').slideDown(500)
            });
        },

        /**
         * Enable accordion
         */
        initAccordion : function() {
            this.$el.find('.section').not(':first').hide();
        },

        /**
         * Render view
         *
         * @param options options object
         */
        onRender : function(options) {
            // run i18nnext translation in the view context
            this.$el.i18n();

            //  Add scroll bar
            this.$el.find('.scroll').slimScroll({
                height       : '89%',
                railVisible  : true,
                alwaysVisible: true
            });

            //  Disable selection on field element
            $('.fields').disableSelection();

            this.initAccordion();
        }

    });

    return WidgetPanelView;

});
