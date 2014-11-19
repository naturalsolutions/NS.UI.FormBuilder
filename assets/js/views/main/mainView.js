define([
    'jquery',
    'underscore',
    'backbone',
    'views/main/panelView',
    'views/main/formView',
    'views/main/settingView',
    'text!../../../templates/main/mainView.html',
    'backbone.radio',
    'i18n',
    'sweetalert'
], function($, _, Backbone, PanelView, FormView, SettingView, mainViewTemplate, Radio) {

    var MainView = Backbone.View.extend({

        events : {
            'click #clearAll' : 'clear',
            'click #export'   : 'export',
            'click #save'     : 'save',
            'click #toggle'   : 'toggle',
            'click #untoggle' : 'untoggle'
        },

        initialize : function(options) {
            this.el         = options.el;
            this.template   = _.template(mainViewTemplate);
            this.URLOptions = options.URLOptions;
            this.form       = options.form;

            this.mainChannel = Backbone.Radio.channel('global');

            _.bindAll(this, 'render', 'renderSubView', 'getSubView', 'clear', 'export', 'save');
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            this.renderSubView();
            return this;
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

        renderSubView : function() {
            //  ---------------------------------------------------
            //  Create each view for the formbuilder

            this.panelView = new PanelView({
                el: '.widgetsPanel',
                collection: this.form,
            });

            this.formView = new FormView({
                collection: this.form,
                el: $('.dropArea')
            });

            this.settingView = new SettingView({
                el : '.settings',
                URL : _.pick(this.URLOptions, 'preConfiguredField')
            })

            this.panelView.render();
            this.formView.render();
            this.settingView.render();
        },

        clear : function() {
            var self = this;

            swal({
                title              : "Etes vous sûr?",
                text               : "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : "Oui, supprimer",
                cancelButtonText   : "Annuler",
                closeOnConfirm     : false,
                closeOnCancel      : false
            }, function(isConfirm) {
                if (isConfirm) {
                    swal("Supprimé !", "Votre formulaire a été supprimé !", "success");
                    self.form.clearAll();
                } else {
                    swal("Annulé", "", "error");
                }
            });


        },

        export : function() {
            require(['views/modals/exportProtocol'], _.bind(function(exportProtocolJSON) {
                $(this.el).append('<div class="modal  fade" id="exportModal"></div>');
                var modalView = new exportProtocolJSON({
                    el: "#exportModal",
                    URLOptions: this.URLOptions
                });
                modalView.render();
                $("#exportModal").i18n();

                $('#exportModal').on('hidden.bs.modal', _.bind(function () {

                    var datas = modalView.getData();
                    if (datas['response'] === true) {
                        this.mainChannel.trigger('export', datas);
                    }

                }, this));

            }, this));
        },

        save : function() {

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