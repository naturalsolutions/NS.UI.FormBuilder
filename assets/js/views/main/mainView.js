define([
    'jquery',
    'underscore',
    'backbone',
    'views/main/panelView',
    'views/main/formView',
    'views/main/settingView',
    'text!../../../templates/main/mainView.html',
    'i18n',
    'sweetalert'
], function($, _, Backbone, PanelView, FormView, SettingView, mainViewTemplate) {

    var MainView = Backbone.View.extend({

        /**
         * Views event objects
         * @type {Object}
         */
        events : {
            'click #toggle'   : 'toggle',
            'click #untoggle' : 'untoggle'
        },

        /**
         * View constructor
         *
         * @param  {Object} All options for view configuration
         */
        initialize : function(options) {
            this.el         = options.el;
            this.template   = _.template(mainViewTemplate);
            this.URLOptions = options.URLOptions;
            this.form       = options.form;

            _.bindAll(this, 'render', 'renderSubView', 'getSubView');
        },

        /**
         * Render main view, render sub views too
         */
        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            this.renderSubView();
            return this;
        },

        /**
         * Render all main views for the application
         */
        renderSubView : function() {

            //  Panel view, on the left, with each field type
            this.panelView = new PanelView({
                el: '.widgetsPanel',
                collection: this.form,
            });

            //  Form view, central panel with form edition
            this.formView = new FormView({
                collection: this.form,
                el: $('.dropArea'),
                URLOptions : this.URLOptions
            });

            //  Setting view, hide on start display when user tries to edit field or collection properties
            this.settingView = new SettingView({
                el : '#settings',
                URL : _.pick(this.URLOptions, 'preConfiguredField', 'keywordAutocomplete', 'protocolAutocomplete')
            })

            //  Render all subviews

            this.panelView.render();
            this.formView.render();
            this.settingView.render();
        },

        untoggle : function() {
            $('.widgetsPanel').animate({
                marginLeft : 0
            }, 500, function() {
                $(this).css({
                    'position' : 'relative',
                    'z-index' : 'auto'
                })
            });
            $('.dropArea').switchClass('col-md-12', 'col-md-8', 500).css({
                'padding-left' : 0,
                'overflow' : 'hidden'
            })

            //  Toggle footer div
            $('footer div:first-child').animate({
                marginLeft : 0
            }, 100, function() {
                $('footer div:last-child:not(.pull-right)').switchClass('col-md-12', 'col-md-8', 500, function() {
                    $(this).css({
                        'padding-left' : 15,
                        'overflow' : 'hidden'
                    })
                });
            });
        },

        toggle : function() {
            //  Toggle panels
            $('.widgetsPanel').animate({
                marginLeft : - (parseInt($('.widgetsPanel').css('width')) - 50)
            }, 500, function() {
                $(this).css({
                    'position' : 'absolute',
                    'z-index' : '255'
                })
            });
            $('.dropArea').switchClass('col-md-8', 'col-md-12', 500).css({
                'padding-left' : 50,
                'overflow' : 'hidden'
            })

            //  Display gobach
            $('#toggle').attr('id', 'untoggle').text('>')
        },

        getSubView : function(subViewID) {
            return this.formView.getSubView(subViewID);
        },

        getFormJSON : function() {
            return this.formView.getJSON();
        },

        importJSON : function() {
            return this.formView.importJSON();
        }

    });

    return MainView;

});