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
        events: {
            'click div.col-md-3'                 : 'appendToDrop',
            'click div.col-md-10'                : 'appendToDrop',
            'click #smallFeatures .scroll > div' : 'appendToDrop'
        },

        template : function() {
            return _.template(WidgetPanelViewTemplate)({
                section : this.section
            });
        },

        initialize : function() {
            _.bindAll(this, 'template');

            this.initSection();
            this.initFormChannel();
        },

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
                swal({
                    title:translater.getValueFromKey('modal.field.error') || "Echec de l'ajout!",
                    text:translater.getValueFromKey('modal.field.errorMsg') || "Une erreur est survenue lors de l'ajout du champ !",
                    type:"error",
                    closeOnConfirm: true
                }, function(){
                    window.onkeydown = null;
                    window.onfocus = null;
                });
            }
        },

        initSection : function() {
            var sections = {text: {}, numeric: {}, list: {}, presentation: {}, autocomplete: {}, tree: {}, file: {},
                other: {}, reneco: {}};

            var context = window.context || $("#contextSwitcher .selected").text().toLowerCase();

            var checkDisplayMode = function(fieldType){
                if (context == "all" || (AppConfig.appMode.hasOwnProperty(context) &&
                    $.inArray(fieldType, AppConfig.appMode[context]) == -1))
                    return (false);
                return (true);
            };

            for (var i in Fields) {
                if (Fields[i].type !== undefined && checkDisplayMode(Fields[i].type)) {
                    if (Fields[i].section === undefined)
                    {
                        sections['other'][i] = {
                            i18n             : i.replace('Field', '').toLowerCase(),
                            doubleColumn     : Fields[i].doubleColumn !== undefined,
                            fontAwesomeClass : Fields[i].fontAwesomeClass
                        }
                    }
                    else
                    {
                        if (sections[Fields[i].section] === undefined)
                        {
                            //  create new sections
                            sections[ Fields[i].section ] = {};
                        }

                        sections[ Fields[i].section ][i] = {
                            i18n             : i.replace('Field', '').toLowerCase(),
                            doubleColumn     : Fields[i].doubleColumn !== undefined,
                            fontAwesomeClass : Fields[i].fontAwesomeClass
                        }
                    }
                }
            }

            for (var section in sections)
            {
                if (Object.keys(sections[section]).length == 0)
                    delete(sections[section]);
            }

            this.section = sections;
        },

        onRender : function() {
            this.$el.i18n();
        }

    });

    return WidgetPanelView;

});
