/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'models/collection', 'backbone.radio', 'fancytree', 'sweetalert'],
    function($, _, Backbone, MainView, collection, Radio, fancytree) {

        var AppRouter = Backbone.Router.extend({

            /**
             * Router routes
             *
             * @type {Object}
             */
            routes: {
                ""             : 'home',
                'saveprotocol' : 'saveProtocol',
                'setting/:id'  : 'modelSetting',
                'import'       : 'import',
                'show'         : 'show',
                "copy/:id"     : "copy"
            },

            /**
             * Router constructor
             *
             * @param  {object} options Initialization options
             */
            initialize: function(options) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

                window.location.hash = '#';

                this.URLOptions = options['URLOptions'];
                this.el = options['el'];

                $("body").i18n();


                this.initFormChannel();
                this.initMainChannel();
            },

            /**
             * Initialize a radio channel for "form" channel and create all callbacks for each events
             * This channel is form functionnalities like save and export
             */
            initFormChannel : function() {
                this.formChannel = Backbone.Radio.channel('form');

                //  This event is sent from the main view when export modal view is closed
                //  and where the model view data are corrects, event sent with the collection
                this.formChannel.on('export:return', this.createFileForExport, this);

                //  Event sent from setting view vhen form properties are changed
                //  see settingView.js
                this.formChannel.on('edition', this.closeSettingPanel, this);
            },

            /**
             * Initialize a radio channel for "main" channel and create all callbacks for each events
             */
            initMainChannel : function() {

                this.mainChannel = Backbone.Radio.channel('global');

                //  Event sent from setting view when backbone forms generation is finished
                //  Run an nimation for hide panel view and display setting view, I love jQuery !
                this.mainChannel.on('formCreated', this.openSettingPanel);

                //  Event sent from setting view when field changed are saved
                //  and the data are correct
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCommit', this.closeSettingPanelAndResetURL, this)

                //  Event sent from setting view when modifications are cancelled
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCancel', this.closeSettingPanelAndResetURL, this)

            },

            /**
             * Initiale router
             */
            home: function() {
                //  Awesome function !!!
            },

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

            /**
             * Export current form to JSON file
             * @param  {Object} collectionAndFilename Form as JSON data objects and new file name
             */
            createFileForExport : function(collectionAndFilename) {
                require(['blobjs', 'filesaver'], _.bind(function(Blob, Filesaver) {
                    try {

                        var isFileSaverSupported = !!new Blob();
                        var blob = new Blob([JSON.stringify(collectionAndFilename['collection'], null, 2)], {
                            type: "application/json;charset=utf-8"
                        });

                        var fs = new Filesaver(blob, collectionAndFilename['filename'] + '.json');


                        $('#exportModal').modal('hide').removeData();
                        this.formChannel.trigger('exportFinished', true)
                    } catch (e) {
                        $('#exportModal').modal('hide').removeData();
                        this.formChannel.trigger('exportFinished', false)
                    }

                    window.location.hash = '#';

                }, this));  //  End require
            },

            /**
             * Close setting panel
             */
            closeSettingPanel : function() {
                if ($('.widgetsPanel').hasClass('col-md-1')) {
                    $('.dropArea').switchClass('col-md-7 col-md-pull-1', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('col-md-1', 'col-md-4', 500);

                    $('.widgetsPanel #features').fadeIn(200);
            $('#toggle span').switchClass('closed', 'open');
                } else {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').animate({
                        marginLeft : 0
                    }, 500)
                }
            },

            /**
             * Open settings panel
             */
            openSettingPanel : function() {
                if ($('.widgetsPanel').hasClass('col-md-1')) {
                    $('.dropArea').switchClass('col-md-11', 'col-md-7 col-md-pull-1', 500);
                } else {
                    $('.dropArea').switchClass('col-md-8', 'col-md-7', 500);
                    $('.widgetsPanel').animate({
                        marginLeft : '-33.33333333%'
                    }, 500)
                }
            },

            /**
             * Close setting panel and reset URL to #
             */
            closeSettingPanelAndResetURL : function() {
                this.closeSettingPanel();
                window.location.hash = "#";
            }

        });

        return AppRouter;
    });