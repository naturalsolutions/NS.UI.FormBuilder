define([
    'jquery',
    'underscore',
    'backbone',
    'assets/js/views/main/panelView.js',
    'assets/js/views/main/formView.js',
    'i18n',
    'jqueryui',
    'nanoscroller',
    'bootstrap'
], function($, _, Backbone, PanelView, FormView) {


    var MainView = Backbone.View.extend({

        initialize : function(options) {
            this.el = options.el;
            $(this.el).append(
                '<div class="row-fluid content">'+
                '   <div class="span3 widgetsPanel nano"></div>'+
                '   <div class="span9 dropArea"></div>'+
                '   <div class="span5 settings"></div>'+
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
                            handler: _.bind(function() {

                                require(['views/modals/saveProtocol'], _.bind(function(SaveProtocolModalView) {
                                    var modalView = new SaveProtocolModalView({
                                        el: '#saveModal',
                                        protocolAutocomplete : this.URLOptions.protocolAutocomplete,
                                        keywordAutocomplete  : this.URLOptions.keywordAutocomplete
                                    });
                                    modalView.render();
                                }, this));

                            }, this)
                        }),
                        'save.export': new NS.UI.NavBar.Action({
                            //  Allow to export protocol as a XML file
                            handler: function() {
                                require(['app/formbuilder'], function(formbuilderObjectRef) {
                                    var modalView = new modals.ExportProtocolModalView({
                                        el : "#exportModal",
                                        model : formbuilderObjectRef.currentCollection
                                    });
                                    modalView.render();

                                });
                            },
                            allowedRoles    : ["reader"],
                            title           : 'Export as XML'
                        }),
                        'save.json': new NS.UI.NavBar.Action({
                            //  Allow to export protocol as a XML file
                            handler: function() {
                                require(['app/formbuilder'], function(formbuilderObjectRef) {
                                    var modalView = new modals.ExportJSONProtocolModalView({
                                        el : "#exportModal",
                                        model : formbuilderObjectRef.currentCollection
                                    });
                                    modalView.render();

                                });
                            },
                            allowedRoles    : ["reader"],
                            title           : 'Export as JSON'
                        })
                    }
                }),

                'import' : new NS.UI.NavBar.Action({
                    actions : {
                        'import.JSON' : new NS.UI.NavBar.Action({
                            handler : function() {
                                require(['app/formbuilder'], function(formbuilderRef) {
                                    formbuilderRef.mainView.importJSON();
                                });
                            },
                            allowedRoles: ["reader"],
                            title       : 'Importer un fichier JSON'
                        }),
                        'import.XML' : new NS.UI.NavBar.Action({
                            handler: function() {
                                require(['app/formbuilder'], function(formbuilderRef) {
                                    formbuilderRef.mainView.importXML();
                                });
                            },
                            allowedRoles: ["reader"],
                            title       : 'Importer un fichier XML'
                        }),
                        'import.load' : new NS.UI.NavBar.Action({
                            title       : 'Charger depuis le serveur',
                            allowedRoles: ["reader"],
                            handler : function () {
                                alert ('I\'m working on it !');
                            }
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
                    handler: function() {
                        $('#compareModal').modal('show')
                        .on('click', '#findSource, #findUpdate', function() {
                            $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
                        })
                        .on('change', 'input[type="file"]', function() {
                            var id = $(this).prop('id').replace('Hide', ''), split = $(this).val().split('\\');
                            $('#' + id).val(split[ split.length - 1]);
                        })
                        .on('click', '.btn-primary', function() {
                            $('#compareModal').modal('hide');
                            var source  = $('#compareModal').find('#sourceHide')[0].files[0],
                                update  = $('#compareModal').find('#updateHide')[0].files[0],
                                srcName = source['name'],
                                updName = update['name'],
                                reader  = null;


                            if (source !== null && update !== null) {
                                 if (source.type === "text/xml" && update.type === "text/xml") {
                                    reader = new FileReader();
                                    reader.readAsText(source, "UTF-8");
                                    reader.onload = function(evt) {
                                        try {
                                            if (formBuilder.XMLValidation(evt.target.result) !== true) {
                                                new NS.UI.Notification ({
                                                    title : result.error,
                                                    type : 'error',
                                                    message : 'Your XML don\'t matches with XML Schema'
                                                });
                                            } else {
                                                source = evt.target.result;
                                                reader = new FileReader();
                                                reader.readAsText(update, "UTF-8");
                                                reader.onload = function(evt) {
                                                    if (formBuilder.XMLValidation(evt.target.result) === true) {
                                                        update = evt.target.result;
                                                        $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                                            $('.dropArea').append(
                                                                formBuilder.GetXMLDiff(source, update, srcName, updName)
                                                            ).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                                            var acts = {
                                                                quit: new NS.UI.NavBar.Action({
                                                                    handler: function() {
                                                                        $('.widgetsPanel').switchClass('span0', 'span3', 250, function() {
                                                                            $('.dropArea').switchClass('span2', 'span9', 250).find('table').remove();
                                                                            navbar.setActions(actions);
                                                                            addIcon();
                                                                        });
                                                                    },
                                                                    allowedRoles: ["reader"],
                                                                    title: "Quit"
                                                                })
                                                            };
                                                            navbar.setActions(acts);
                                                        })
                                                    }
                                                };
                                            }
                                        } catch (exp) {
                                            new NS.UI.Notification({
                                                type: 'error',
                                                title: "An error occured",
                                                message: 'One of giles can\'t be read'
                                            });
                                        }
                                    };
                                    reader.onerror = function(evt) {
                                        new NS.UI.Notification({
                                            type: 'error',
                                            title: "Reading error",
                                            message: 'An error was occure during reading file'
                                        });
                                    };

                                } else {
                                    new NS.UI.Notification({
                                        type: 'error',
                                        title: "File mime type error",
                                        message: 'You must choose only XML files'
                                    });
                                }
                            } else {
                                new NS.UI.Notification({
                                    type: 'error',
                                    title: "Reading error",
                                    message: 'Error durring XML loading ! '
                                });
                            }
                        }).removeClass('hide').css('width', '700px');
                    },
                    allowedRoles: ["reader"],
                    title: '<span class="fa fa-bars" data-i18n="nav.compare" data-key="show"></span>'
                })
            };
        }
    });

    return MainView;
});