/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'models/collection', 'backbone.radio', 'fancytree', 'NS.UI.Navbar', 'NS.UI.NavbarTheme'],
    function($, _, Backbone, MainView, collection, Radio, fancytree) {

        var AppRouter = Backbone.Router.extend({

            mainActions : {
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
                            url          : "#import"
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
            },

            routes: {
                ""             : 'home',
                'saveprotocol' : 'saveProtocol',
                'setting/:id'  : 'modelSetting',
                'save'         : 'saveOnRepo',
                //'export'       : 'export',
                'import'       : 'import',
                'load'         : 'load',
                //'clear'        : 'clear',
                'show'         : 'show',
                "copy/:id"     : "copy"
            },

            initialize: function(options) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

                window.location.hash = '#';

                this.URLOptions = options['URLOptions'];
                this.el = options['el'];

                /*var user = {
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
                }]*/

                //  Init navbar
                /*this.navbar = new NS.UI.NavBar({
                    roles    : user.gaston.roles,
                    username : user.gaston.nickname,
                    title    : 'Form Builder'
                });*/

                /*this.navbar.$el.prependTo('body');
                this.navbar.render();*/

                $("body").i18n();
                this.mainChannel = Backbone.Radio.channel('global');

                this.mainChannel.on('export:return', _.bind(function(collectionExport) {

                    require(['blobjs', 'filesaver'], _.bind(function() {

                        try {

                            var isFileSaverSupported = !!new Blob();
                            var blob = new Blob([JSON.stringify(collectionExport, null, 2)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, $('#exportProtocolFileName').val() + '.json');

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

                }, this));

                this.mainChannel.on('formCreated', _.bind(function(field) {

                    $('.dropArea').switchClass('col-md-9', 'col-md-7', 500);
                    $('.widgetsPanel').switchClass('col-md-3', 'hide', 500);

                    this.navbar.setActions({
                        save: new NS.UI.NavBar.Action({
                            title: 'Save changes',
                            allowedRoles: ["reader"],
                            handler: _.bind(function() {
                                this.mainChannel.trigger('saveForm');
                            }, this)
                        }),
                        saveConfiguration :new NS.UI.NavBar.Action({
                            title: 'Save settings',
                            allowedRoles: ["reader"],
                            handler: _.bind(function() {
                                this.mainChannel.trigger('saveConfiguration');
                            }, this)
                        })
                    });

                }, this));

                this.mainChannel.on('formCommit', _.bind(function(isValid) {
                    if (isValid) {
                        $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                        $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                        window.location.hash = "#";
                    }
                }, this))

                this.mainChannel.on('formCancel', _.bind(function() {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                    window.location.hash = "#";
                }, this))

                this.mainChannel.on('fieldConfiguration', _.bind(function(configuration) {
                    $('.dropArea').switchClass('col-md-7', 'col-md-9', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-3', 500);
                    window.location.hash = "#";
                }, this))
            },

            home: function() {
                /*this.navbar.setActions(this.mainActions)*/
            },

            copy : function(modelID) {
                this.mainChannel.trigger('copy', modelID);
                window.location.hash = '#';
            },

            modelSetting: function(modelID) {
                this.mainChannel.trigger('getModel', modelID);
            },

            saveOnRepo: function() {
                require(['views/modals/saveProtocol'], _.bind(function(SaveProtocolModalView) {
                    $(this.el).append('<div class="modal  fade" id="saveModal"></div>');
                    var modalView = new SaveProtocolModalView({
                        el                   : '#saveModal',
                        protocolAutocomplete : this.URLOptions['protocolAutocomplete'],
                        keywordAutocomplete  : this.URLOptions['keywordAutocomplete']
                    });
                    modalView.render();
                    $('#saveModal').i18n();

                    $('#saveModal').on('hidden.bs.modal', _.bind(function () {

                        this.mainChannel.on('getJSON:return', _.bind(function(JSON) {
                            var datas = modalView.getData();
                            datas['content'] = JSON;

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
                        this.mainChannel.on('getJSON');

                    }, this));
                }, this));
            },

            import : function() {
                require(['views/modals/importProtocol', 'utilities/utilities'], _.bind(function(importProtocolModal, Utilities) {
                    $(this.el).append('<div class="modal fade" id="importModal"></div>');
                    var modalView = new importProtocolModal({
                        el: "#importModal"
                    });
                    modalView.render();
                    $("#importModal").i18n();

                    $('#importModal').on('hidden.bs.modal', _.bind(function () {
                        var datas = modalView.getData();

                        Utilities.ReadFile(datas['file'], _.bind(function(result) {
                            if (result !== false) {

                                var jsonParsed = $.parseJSON(result);
                                this.mainChannel.trigger('JSONUpdate', jsonParsed);
                                window.location.hash = '#';

                            } else {
                                // display error
                                console.log (result)
                            }
                        }, this));

                    }, this));

                }, this));
            },

            load: function() {
                alert("I'm working on it !");
            },

            show: function() {
                require(['views/modals/diffProtocol', 'utilities/utilities'], _.bind(function(diffModal, Utilities) {
                    $(this.el).append('<div class="modal  fade" id="compareModal" ></div>');
                    var modal = new diffModal({
                        el : '#compareModal'
                    });
                    modal.render();

                    $('#compareModal').on('hidden.bs.modal', _.bind(function () {
                        var datas = modal.getData();

                        Utilities.ReadFile(datas['source'], _.bind(function(result) {
                            if (result !== false) {
                                var source = result;

                                Utilities.ReadFile(datas['update'], _.bind(function(resultUpdate) {
                                    if (resultUpdate !== false) {
                                        var update = resultUpdate;

                                        //  Now we have all we need !
                                        $('.widgetsPanel').switchClass('col-md-3', 'hide', 250, _.bind(function() {
                                            console.log ("diff : ", Utilities.GetXMLDiff(source, update, datas['srcName'], datas['updName']))
                                            $('.dropArea').append(
                                                Utilities.GetXMLDiff(source, update, datas['srcName'], datas['updName'])
                                            ).switchClass('col-md-9', 'col-md-12', 250).find('.diff').addClass('col-md-10 col-md-offset-1');
                                            var acts = {
                                                quit: new NS.UI.NavBar.Action({
                                                    handler: _.bind(function() {
                                                        $('.widgetsPanel').switchClass('hide', 'col-md-3', 250, _.bind(function() {
                                                            $('.dropArea').switchClass('col-md-12', 'col-md-9', 250).find('table').remove();
                                                            window.location.hash = "#";
                                                            this.navbar.setActions(this.mainActions)
                                                        }, this));
                                                    }, this),
                                                    allowedRoles: ["reader"],
                                                    title: "Quit"
                                                })
                                            };
                                            this.navbar.setActions(acts);
                                        }, this))

                                    } else {
                                        console.log (resultUpdate);
                                    }
                                }, this));

                            } else {
                                console.log (result);
                            }
                        }, this));
                    }, this));

                }, this));
            }
        });

        return AppRouter;
    });