define([
    'jquery',
    'underscore',
    'backbone',
    'assets/js/views/main/panelView.js',
    'assets/js/views/main/formView.js',
    'i18n',
    'jqueryui',
    //'nanoscroller',
    'bootstrap'
], function($, _, Backbone, PanelView, FormView) {


    var MainView = Backbone.View.extend({

        initialize : function(options) {
            this.el = options.el;
            $(this.el).append(
                '<div class="row content">'+
                '   <div class="col-md-3 widgetsPanel nano"></div>'+
                '   <div class="col-md-9 dropArea"></div>'+
                '   <div class="col-md-5 settings"></div>'+
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
                    title           : '<i class="fa fa-cloud"></i><span data-i18n="nav.save.title" data-key="save">Save protocol</span>',
                    allowedRoles    : ["reader"],
                    actions: {
                        'save.repo' : new NS.UI.NavBar.Action({
                            //  Display modal window for save the protocol in the repository
                            title       : 'Save',
                            allowedRoles: ['reader'],
                            url : "#save/repo"
                        }),
                        'export': new NS.UI.NavBar.Action({
                            //  Allow to export protocol as a XML file
                            allowedRoles    : ["reader"],
                            title           : 'Export as JSON or XML',
                            url : "#export"
                        })
                    }
                }),

                'import' : new NS.UI.NavBar.Action({
                    actions : {
                        'import.JSON' : new NS.UI.NavBar.Action({
                            allowedRoles: ["reader"],
                            title       : 'Importer un fichier JSON',
                            utl : "#import/json"
                        }),
                        'import.XML' : new NS.UI.NavBar.Action({
                            allowedRoles: ["reader"],
                            title       : 'Importer un fichier XML',
                            url : '#import/xml'
                        }),
                        'import.load' : new NS.UI.NavBar.Action({
                            title       : 'Charger depuis le serveur',
                            allowedRoles: ["reader"],
                            url : '#load'
                        })
                    },
                    title       : '<i class="fa fa-upload"></i><span data-i18n="nav.import.title" data-key="import">Import</span>',
                    allowedRoles: ["reader"]
                }),

                clear: new NS.UI.NavBar.Action({
                    handler: function() {
                        require(['app/formbuilder'], function(formbuilderRef) {
                            formbuilderRef.mainView.clear();
                        });
                    },
                    allowedRoles: ["reader"],
                    title       : '<i class="fa fa-trash-o"></i> Tout supprimer'
                }),

                show: new NS.UI.NavBar.Action({
                    url : '#show',
                    allowedRoles: ["reader"],
                    title: '<span class="fa fa-bars" data-i18n="nav.compare" data-key="show"></span>'
                })
            };
        }
    });

    return MainView;
});