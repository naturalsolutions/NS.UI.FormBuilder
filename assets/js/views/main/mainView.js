define([
    'jquery',
    'underscore',
    'backbone',
    'views/main/panelView',
    'views/main/formView',
    'i18n'
], function($, _, Backbone, PanelView, FormView) {

    var MainView = Backbone.View.extend({

        initialize : function(options) {
            this.el = options.el;
            $(this.el).append(
                '<div class="row content">'+
                '   <div class="col-md-3 widgetsPanel nano"></div>'+
                '   <div class="col-md-9 dropArea"></div>'+
                '   <div class="col-md-5 settings nano"></div>'+
                '</div>'
            );

            this.URLOptions = options.URLOptions;


            this.form = options.form || new app.views.Form({}, {
                name: "My form"
            });

            this.panelView = new PanelView({
                el: '.widgetsPanel',
                collection: this.form,
            });

            this.formView = new FormView({
                collection: this.form,
                el: $('.dropArea')
            });

            this.panelView.render();
            this.formView.render();

            _.bindAll(this, 'getFormXML', 'downloadXML', 'importXML', 'getActions', 'getSubView');
        },

        getSubView : function(subViewID) {
            return this.formView.getSubView(subViewID);
        },

        clear: function() {
            this.form.clearAll();
        },

        getFormXML : function() {
            return this.formView.getXML();
        },

        getFormJSON : function() {
            return this.formView.getJSON();
        },

        downloadXML : function() {
            return this.formView.downloadXML();
        },

        importXML : function() {
            return this.formView.importXML();
        },

        importJSON : function() {
            return this.formView.importJSON();
        },

        getActions : function() {
            return {
                save : new NS.UI.NavBar.Action({
                    title           :$.t('nav.save.title'),
                    allowedRoles    : ["reader"],
                    actions: {
                        'repo' : new NS.UI.NavBar.Action({
                            title       : $.t('nav.save.cloud'),
                            allowedRoles: ['reader'],
                            url : "#save"
                        }),
                        'export': new NS.UI.NavBar.Action({
                            allowedRoles    : ["reader"],
                            title           : $.t('nav.save.export'),
                            url : "#export"
                        })
                    }
                }),

                import : new NS.UI.NavBar.Action({
                    actions : {
                        'import.file' : new NS.UI.NavBar.Action({
                            allowedRoles : ["reader"],
                            title        : $.t("nav.import.import"),
                            utl          : "#import"
                        }),
                        'import.load' : new NS.UI.NavBar.Action({
                            title        : $.t("nav.import.cloud"),
                            allowedRoles : ["reader"],
                            url          : '#load'
                        })
                    },
                    title       : $.t("nav.import.title"),
                    allowedRoles: ["reader"]
                }),

                clear: new NS.UI.NavBar.Action({
                    url          : '#clear',
                    allowedRoles : ["reader"],
                    title        : $.t('nav.clear')
                }),

                show: new NS.UI.NavBar.Action({
                    url          : '#show',
                    allowedRoles : ["reader"],
                    title        : $.t('nav.compare')
                })
            };
        }
    });

    return MainView;

});