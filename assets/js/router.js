/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'models/collection', 'backbone.radio', 'NS.UI.Navbar', 'NS.UI.NavbarTheme'],
    function($, _, Backbone, MainView, collection, Radio) {

        var AppRouter = Backbone.Router.extend({

            routes: {
                ""             : 'home',
                'saveprotocol' : 'saveProtocol',
                'setting/:id'  : 'modelSetting',
                'save'         : 'saveOnRepo',
                'export'       : 'export',
                'import'       : 'import',
                'load'         : 'load',
                'clear'        : 'clear',
                'show'         : 'show'
            },

            initialize: function(options) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

                window.location.hash = '#';

                this.URLOptions = options['URLOptions'];
                this.el = options['el'];

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
                this.navbar = new NS.UI.NavBar({
                    roles    : user.gaston.roles,
                    username : user.gaston.nickname,
                    title    : 'Form Builder'
                });

                this.navbar.$el.prependTo('body');
                this.navbar.render();

                $("body").i18n();
                this.mainChannel = Backbone.Radio.channel('global');
            },

            home: function() {
                this.navbar.setActions({
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
                })
            },

            modelSetting: function(modelID) {
                this.mainChannel.on('getModel:return', _.bind(function(field) {
                    require(['backbone-forms', "backbone-forms-list", 'modalAdapter'], _.bind(function() {
                        var form = new Backbone.Form({
                            model: field,
                        }).render();
                        $('.settings').append(form.el)

                        $('.dropArea').switchClass('col-md-9', 'col-md-7', 500);
                        $('.widgetsPanel').switchClass('col-md-3', 'hide', 500);

                        this.navbar.setActions({
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

                }, this));
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

            export: function() {
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

                        this.mainChannel.trigger('export', datas);

                    }, this));  //  Modal view is closed

                }, this));

            },

            clear : function() {
                this.mainChannel.trigger('clear');
                window.location.hash = '#';
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
                $(this.el).append('<div class="modal  fade" id="compareModal" ></div>');
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