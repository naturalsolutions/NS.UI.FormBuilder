/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'models/collection', 'backbone.radio', 'fancytree', 'NS.UI.Navbar', 'NS.UI.NavbarTheme', 'sweetalert'],
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
                'import'       : 'import',
                'load'         : 'load',
                'show'         : 'show',
                "copy/:id"     : "copy"
            },

            initialize: function(options) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

                window.location.hash = '#';

                this.URLOptions = options['URLOptions'];
                this.el = options['el'];

                $("body").i18n();


                //  ----------------------------------------------------------
                //  Backbone radio configuration

                this.mainChannel = Backbone.Radio.channel('global');

                //  This event is sent from the main view when export modal view is closed
                //  and where the model view data are corrects, event sent with the collection
                this.mainChannel.on('export:return', _.bind(function(collectionExport) {

                    require(['blobjs', 'filesaver'], _.bind(function() {

                        try {

                            var isFileSaverSupported = !!new Blob();
                            var blob = new Blob([JSON.stringify(collectionExport, null, 2)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, $('#exportProtocolFileName').val() + '.json');

                            $('#exportModal').modal('hide').removeData();
                            swal("Export réussi !", "", "success")
                        } catch (e) {
                            $('#exportModal').modal('hide').removeData();
                            swal("Echec de l'export !", "Une erreur est survenue lors de l'export", "error")
                        }

                        window.location.hash = '#';

                    }, this));  //  End require

                }, this));

                //  Event sent from setting view when backbone forms generation is finished
                //  Run an nimation for hide panel view and display setting view, I love jQuery !
                this.mainChannel.on('formCreated', _.bind(function() {

                    $('.dropArea').switchClass('col-md-9', 'col-md-7', 500);
                    $('.widgetsPanel').switchClass('col-md-3', 'hide', 500);

                }, this));

                //  Event sent from setting view when field changed are saved
                //  and the data are correct
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCommit', _.bind(function(isValid) {
                    if (isValid) {
                        $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                        $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                        window.location.hash = "#";
                    }
                }, this))

                //  Event sent from setting view when modifications are cancelled
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCancel', _.bind(function() {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                    window.location.hash = "#";
                }, this))

                /*this.mainChannel.on('fieldConfiguration', _.bind(function(configuration) {
                    $('.dropArea').switchClass('col-md-7', 'col-md-9', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-3', 500);
                    window.location.hash = "#";
                }, this))*/
            },

            home: function() {},

            /**
             * This function is run when user wants to duplicate a field
             * Trigger an event with the field ID to the formbuilder object (see formbuilder.js)
             *
             * @param  {integer} ID of the field to duplicate
             */
            copy : function(modelID) {
                this.mainChannel.trigger('copy', modelID);
                window.location.hash = '#';
            },

            /**
             * This function is run when user wants to configure a field
             * Trigger an event with field ID to the formbuilder object (see formbuilder.js)
             *
             * @param  {integer} ID of the field to duplicate
             */
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

                                    swal("Sauvé !", "Votre formulaire a été enregistré sur le serveur !", "success");
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    $('#saveModal').modal('hide').removeData();
                                    swal("Une erreur est survenu !", "Votre formulaire n'a pas été enregistré !<br /> Pensez à faire un export", "error");
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