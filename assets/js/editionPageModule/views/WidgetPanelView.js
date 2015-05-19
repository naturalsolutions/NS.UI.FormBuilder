define([
    'jquery',
    'marionette',
    'text!../templates/WidgetPanelView.html',
    '../models/Fields',
    'backbone.radio',
    'i18n',
    'jquery-ui',
    'sweetalert'
], function($, Marionette, WidgetPanelViewTemplate, Fields, Radio) {


    var WidgetPanelView = Backbone.Marionette.ItemView.extend({

        events: {
            'click div.col-md-5'       : 'appendToDrop',
            'click div.col-md-10'      : 'appendToDrop',
            'click #smallFeatures div' : 'appendToDrop',
            'click h3'                 : 'displayContent'
        },

        template : function() {
            return _.template(WidgetPanelViewTemplate)({
                section : this.section
            });
        },


        initialize : function(options) {
            this.collection = options.fieldCollection;
            _.bindAll(this, 'template')

            this.initSection();
            this.initFormChannel();
        },

        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');
        },

        appendToDrop : function(e) {
            var elementClassName = $(e.target).data("type");

            if (Fields[elementClassName] !== undefined) {
                this.formChannel.trigger('addElement', elementClassName);
            } else {
                swal("Une erreur est survenue !", "Le champ n'a pas pu être généré !", "error");
            }
        },

        initSection : function() {
            var section = { standard : {}, other : {} };

            for (var i in Fields) {
                if (Fields[i].type !== undefined) {
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

        displayContent : function(e) {
            var accordion = $(e.currentTarget).data('accordion')
            $('.section[data-accordion!="content-' + accordion + '"]').slideUp(500, function() {
                $('.section[data-accordion="content-' + accordion + '"]').slideDown(500)
            });
        },

        initAccordion : function() {
            this.$el.find('.section').not(':first').hide();
        },


        onRender : function(options) {
            // run i18nnext translation in the view context
            this.$el.i18n();

            //  Add scrollbar
            this.$el.find('.scroll').slimScroll({
                height : '90%'
            });

            //  Disable selection on field element
            $('.fields').disableSelection();

            this.initAccordion();
        }

    });

    return WidgetPanelView;

});
