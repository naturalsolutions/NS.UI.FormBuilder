/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'views/editViews', 'models/collection', 'NS.UI.Navbar', 'NS.UI.NavbarTheme'],
    function($, _, Backbone, MainView, editViews, collection) {

        var AppRouter = Backbone.Router.extend({

            routes: {
                ""             : 'home',
                'saveprotocol' : 'saveProtocol',
                'setting/:id': 'modelSetting',
                'save'   : 'saveOnRepo',
                'export' : 'export',
                'import' : 'import',
                'load'   : 'load',
                'clear'  : 'clear',
                'show'   : 'show'
            },

            initialize: function(formbuilderInstanceRef) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false});

                window.location.hash = '#';
                //  Keep formbuilder object references
                this.formbuilderInstanceRef = formbuilderInstanceRef;

                // Init current protocol collection
                this.formbuilderInstanceRef.currentCollection = new collection({}, {
                    name: "My protocol"
                });

                //  Init main view
                this.formbuilderInstanceRef.mainView = new MainView({
                    el         : '#formBuilder',
                    form       : this.formbuilderInstanceRef.currentCollection,
                    URLOptions : formbuilderInstanceRef.URLOptions
                });
                this.formbuilderInstanceRef.mainView.render();

                var user = {
                    anonymous: {
                        roles: ['reader']
                    },
                    roger: {
                        nickname: 'Roger',
                        roles: ['reader', 'writer']
                    },
                    gaston: {
                        nickname: 'Gaston',
                        roles: ['reader', 'writer', 'moderator']
                    }
                };

                var tiles = [{
                    title: 'Home',
                    tileClass: 'tile-home',
                    url: '#',
                    allowedRoles: ['reader']
                }, {
                    title: 'Forum',
                    tileClass: 'tile-forum',
                    url: '#forum',
                    allowedRoles: ['reader']
                }, {
                    title: 'Administration',
                    tileClass: 'tile-admin tile-double',
                    url: '#admin',
                    allowedRoles: ['moderator']
                }]

                //  Init navbar
                this.formbuilderInstanceRef.navbar = new NS.UI.NavBar({
                    roles    : user.gaston.roles,
                    username : user.gaston.nickname,
                    title    : 'Form Builder'
                });

                this.formbuilderInstanceRef.navbar.$el.prependTo('body');
                this.formbuilderInstanceRef.navbar.render();

                $("body").i18n();
            },

            home: function() {
                this.formbuilderInstanceRef.navbar.setActions(this.formbuilderInstanceRef.mainView.getActions());
            },

            modelSetting: function(modelID) {
                require(['backbone-forms', "backbone-forms-list", 'modalAdapter'], _.bind(function() {

                    var field = this.formbuilderInstanceRef.currentCollection.models[modelID];

                    var form = new Backbone.Form({
                        model: field,
                    }).render();
                    $('.settings').append(form.el)

                    $('.dropArea').switchClass('col-md-9', 'col-md-7', 500);
                    $('.widgetsPanel').switchClass('col-md-3', 'hide', 500);

                    this.formbuilderInstanceRef.navbar.setActions({
                        save: new NS.UI.NavBar.Action({
                            title: 'Save changes',
                            allowedRoles: ["reader"],
                            handler: _.bind(function() {

                                $('.dropArea').switchClass('col-md-7', 'col-md-9', 500);
                                $('.widgetsPanel').switchClass('hide', 'col-md-3', 500);
                                window.location.hash = "#";

                                field.set(form.getValue())
                                form.remove();
                            }, this)
                        })
                    });

                }, this));
            },

            saveOnRepo: function() {
                require(['views/modals/saveProtocol'], _.bind(function(SaveProtocolModalView) {
                    var modalView = new SaveProtocolModalView({
                        el                   : '#saveModal',
                        protocolAutocomplete : this.formbuilderInstanceRef.URLOptions.protocolAutocomplete,
                        keywordAutocomplete  : this.formbuilderInstanceRef.URLOptions.keywordAutocomplete
                    });
                    modalView.render();
                    $('#saveModal').i18n();

                    $('#saveModal').on('hidden.bs.modal', _.bind(function () {

                        var datas = modalView.getData();
                        datas['content'] = this.formbuilderInstanceRef.currentCollection.getJSON();

                        $.ajax({
                            data: datas,
                            type: 'POST',
                            url: '/protocols',
                            contentType: 'application/json',
                            success: function(res) {
                                $('#saveModal').modal('hide').removeData();
                                new NS.UI.Notification({
                                    type: 'success',
                                    title: 'Protocol saved : ',
                                    message: 'your protocol has been saved correctly !'
                                });
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                $('#saveModal').modal('hide').removeData();
                                new NS.UI.Notification({
                                    delay: 15,
                                    type: 'error',
                                    message: jqXHR.responseText,
                                    title: 'An error occured :'
                                });
                            }
                        });

                    }, this));
                }, this));
            },

            export: function() {
                require(['views/modals/exportProtocol'], _.bind(function(exportProtocolJSON) {

                    var modalView = new exportProtocolJSON({
                        el: "#exportModal",
                        model: this.formbuilderInstanceRef.currentCollection
                    });
                    modalView.render();
                    $("#exportModal").i18n();

                    $('#exportModal').on('hidden.bs.modal', _.bind(function () {

                        var datas= modalView.getData();

                        this.formbuilderInstanceRef.currentCollection['description'] = datas['description'];
                        this.formbuilderInstanceRef.currentCollection['keywords']    = datas['keywords'];
                        this.formbuilderInstanceRef.currentCollection['name']        = datas['name'];
                        this.formbuilderInstanceRef.currentCollection['comments']    = datas['comments'];

                        require(['blobjs', 'filesaver'], _.bind(function() {

                            try {

                                if (datas['mode'] === 'json') {

                                    var json = this.formbuilderInstanceRef.currentCollection.getJSON();
                                    var isFileSaverSupported = !!new Blob();
                                    var blob = new Blob([JSON.stringify(json, null, 2)], {
                                        type: "application/json;charset=utf-8"
                                    });
                                    saveAs(blob, $('#exportProtocolFileName').val() + '.json');

                                } else if (datas['mode'] === 'xml') {

                                    var isFileSaverSupported = !!new Blob();
                                    var blob = new Blob(
                                            [this.formbuilderInstanceRef.currentCollection.getXML()],
                                            {type: "application/xml;charset=utf-8"}
                                    );
                                    saveAs(blob, $('#exportProtocolFileName').val() + '.xml');
                                }

                                $('#exportModal').modal('hide').removeData();
                                new NS.UI.Notification({
                                    type    : 'success',
                                    title   : 'Protocol export :',
                                    message : "XML file correctly created"
                                });
                            } catch (e) {
                                $('#exportModal').modal('hide').removeData();
                                new NS.UI.Notification({
                                    type    : 'error',
                                    title   : 'An error occured :',
                                    message : "Can't create your JSON file"
                                });
                            }

                            window.location.hash = '#';

                        }, this));  //  End require

                    }, this));  //  Modal view is closed

                }, this));

            },

            clear : function() {
                this.formbuilderInstanceRef.mainView.clear();
                window.location.hash = '#';
            },

            importJSON: function() {
                require(['app/formbuilder'], function(formbuilderRef) {
                    formbuilderRef.mainView.importJSON();
                });
            },

            importXML: function() {
                require(['app/formbuilder'], function(formbuilderRef) {
                    formbuilderRef.mainView.importXML();
                });
            },

            load: function() {
                alert("I'm working on it !");
            },

            show: function() {
                $('#compareModal').modal('show')
                    .on('click', '#findSource, #findUpdate', function() {
                        $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
                    })
                    .on('change', 'input[type="file"]', function() {
                        var id = $(this).prop('id').replace('Hide', ''),
                            split = $(this).val().split('\\');
                        $('#' + id).val(split[split.length - 1]);
                    })
                    .on('click', '.btn-primary', function() {
                        $('#compareModal').modal('hide');
                        var source = $('#compareModal').find('#sourceHide')[0].files[0],
                            update = $('#compareModal').find('#updateHide')[0].files[0],
                            srcName = source['name'],
                            updName = update['name'],
                            reader = null;


                        if (source !== null && update !== null) {
                            if (source.type === "text/xml" && update.type === "text/xml") {
                                reader = new FileReader();
                                reader.readAsText(source, "UTF-8");
                                reader.onload = function(evt) {
                                    try {
                                        if (formBuilder.XMLValidation(evt.target.result) !== true) {
                                            new NS.UI.Notification({
                                                title: result.error,
                                                type: 'error',
                                                message: 'Your XML don\'t matches with XML Schema'
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
            }
        });

        return AppRouter;
    });