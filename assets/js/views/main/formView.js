define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/main/formView.html',
    'autocompleteTreeView',
    'backbone.radio',
    'i18n',
    'jquery-ui',
    'perfect-scrollbar',
    'bootstrap'
], function($, _, Backbone, formViewTemplate, autocompTree, Radio) {

    var FormView = Backbone.View.extend({

        /**
         * Form view event
         * @type {Object}
         */
        events: {
            'click h1>span'   : 'protocolSettings',
            'click #export'   : 'export',
            'click #import'   : 'import',
            'click #clearAll' : 'clear',
            'click #save'     : 'save'
        },

        /**
         * Form view constructor
         *
         * @param  {Object} options Initialization option like URL for autococomplete
         */
        initialize: function(options) {
            this.template = _.template(formViewTemplate);
            _.bindAll(this, 'render',
                            'addElement',
                            'updateView',
                            'getModel',
                            "getSubView",
                            'protocolSettings',
                            'export',
                            'import',
                            'clear',
                            'initRadioChannel',
                            'removeElement',
                            'updateFormName',
                            'displayExportMessage',
                            'displaySaveMessage'
                    );
            this.collection.bind('newElement', this.addElement);
            this._view = [];

            this.URLOptions = options.URLOptions;

            //  Backbone radio configuration
            this.initRadioChannel();
            this._viewCount = 0;
        },

        /**
         * Init form radio channel and listen some venets
         */
        initRadioChannel : function() {

            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');

            //  This event is send when form properties are changed (name, description, keywords ...)
            //  This view display only the form name, so the form name is passed in the callback
            this.formChannel.on('edition', _.bind(function(formValues) {
                this.$el.find('h1').html( formValues.name + '<span class="reneco settings pull-right"></span>');
            }, this));

            //  This event is send from the router with the ajax request result
            //  And we display message with sweet alert
            this.formChannel.on('save:return',      this.displaySaveMessage);

            //  Eevent send from formbuilder.js when export is finished (success or not)
            this.formChannel.on('exportFinished',   this.displayExportMessage);

            this.formChannel.on('remove',           this.removeElement)

            //  Event send when update is done
            this.formChannel.on('updateFinished',   this.updateFormName)
        },

        /**
         * Send an event to the setting view (settingView.js) to display properties form
         * Channel send on the form channel
         */
        protocolSettings : function() {
            this.formChannel.trigger('displaySettings', this.collection);
        },

        /**
         * Display modal view when user wants to export him form
         * When modal view is hidden we send an event on the form channel to send data (filename), see formbuilder.js
         */
        export : function() {
            require(['views/modals/exportProtocol'], _.bind(function(exportProtocolJSON) {
                $('body').append('<div class="modal  fade" id="exportModal"></div>');
                var modalView = new exportProtocolJSON({
                    el: "#exportModal",
                    URLOptions: this.URLOptions
                });
                modalView.render();
                $("#exportModal").i18n();

                $('#exportModal').on('hidden.bs.modal', _.bind(function () {
                    var datas = modalView.getData();
                    if( datas['response'])
                        this.formChannel.trigger('export', modalView.getData());
                }, this));

            }, this));
        },

        /**
         * Display modal view when user wants to import him form
         * When modal view is hidden we send an event on the form channel to send data (filename), see formbuilder.js
         */
        import : function() {
            require(['views/modals/importProtocol', 'utilities/utilities'], _.bind(function(importProtocolModal, Utilities) {
                $('body').append('<div class="modal fade" id="importModal"></div>');
                var modalView = new importProtocolModal({
                    el: "#importModal"
                });
                modalView.render();
                $("#importModal").i18n();

                $('#importModal').on('hidden.bs.modal', _.bind(function () {
                    var datas = modalView.getData();

                    Utilities.ReadFile(datas['file'], _.bind(function(result) {
                        try {
                            if (result !== false) {

                                var jsonParsed = $.parseJSON(result);

                                this.formChannel.trigger('JSONUpdate', jsonParsed);

                            } else {
                                swal(
                                    $.t('modal.import.error') || "Une erreur est survenu !",
                                    $.t('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                    "error"
                                );
                            }
                        } catch (e) {
                            swal(
                                $.t('modal.import.error') || "Une erreur est survenu !",
                                $.t('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                "error"
                            );
                        }
                    }, this));

                }, this));

            }, this));
        },

        /**
         * Display a sweet alert and ask the classic "Are you sur ?"
         * And clear the current form if the user agrees
         */
        clear : function() {
            var self = this;

            swal({
                title              : $.t('modal.clear.title') || "Etes vous sûr ?",
                text               : $.t('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : $.t('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : $.t('modal.clear.no') || "Annuler",
                closeOnConfirm     : false,
                closeOnCancel      : true
            }, function(isConfirm) {
                if (isConfirm) {
                    swal(
                        $.t('modal.clear.deleted') || "Supprimé !",
                        $.t('modal.clear.formDeleted') || "Votre formulaire a été supprimé !",
                        "success"
                    );
                    self.collection.clearAll();
                }
            });

        },

        /**
         * Run when user wants to save current form on the server
         * Trigger an event for the router on the form channel
         */
        save : function() {
            this.formChannel.trigger('save', this.collection.getJSON());
        },


        getSubView : function(subViewID) {
            return this._view[subViewID];
        },

        updateView : function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).find('#protocolName').val(this.collection.name);
        },

        addElement: function (newModel) {

            var viewClassName = newModel.constructor.type + "FieldView";

            if (newModel.constructor.type === "Numeric") {
                newModel.on('change:decimal', function(e) {
                    e.baseSchema['precision']['fieldClass'] = e.get('decimal') ? "advanced" : "";
                })
            }

            require(['views/fieldViews/' + viewClassName], _.bind(function(fieldView) {

                //  View file successfully loaded
                var id = "dropField" + newModel['id'];

                $('.drop').append('<div class="dropField " id="' + id  + '" ></div>');

                var vue = new fieldView({
                    el      : '#' + id,
                    model   : newModel,
                    collection : this.collection
               });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;

                    $("#scrollSection").scrollTop($("#scrollSection").height());
                    $("#scrollSection").perfectScrollbar('update');
                }

                $(".actions").i18n();

                this._viewCount++;
                $('#count').find('.first').text(this._viewCount)

            }, this), function(err) {
                swal(
                    $.t('modal.field.error')    || "Echec de l'ajout!",
                    $.t('modal.field.errorMsg') || "Une erreur est survenue lors de l'ajout du champ !",
                    "error"
                );
            });
        },

        /**
         * Render form view
         *
         * @return {object} returns form view object
         */
        render: function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            var _vues = this._view;

            $("#scrollSection").perfectScrollbar({
                suppressScrollX : true
            });

            $(".drop").sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".dropField",
                handle      : '.fa-arrows',
                hoverClass : 'hovered',
                containement: '.dropArea',
                stop: function(event, ui) {
                    for (var v in _vues) {
                        _vues[v].updateIndex( $('#' + v).index() );
                    }
                }
            });

            return this;
        },

        getModel : function() {
            return this.collection.length;
        },

        /**
         * eturn current form as a JSON object
         *
         * @return {object} current form as a JSON object
         */
        getJSON : function() {
            return this.collection.getJSON();
        },

        /**
         * Update vurrent form with JSON data from user import
         *
         * @param  {object} JSONImport JSON object imported
         */
        importJSON : function(JSONImport)  {
            this.collection.updateWithJSON(JSONImport);
        },

        removeElement : function() {
            this._viewCount--;
            $('#count').find('span.first').text(this._viewCount)
        },

        updateFormName : function() {
            this.$el.find('h1 label').text( this.collection.name);
        },

        displayExportMessage : function(result) {
            if (result) {
                swal(
                    $.t('modal.export.success') || "Export réussi !",
                    "",
                    "success"
                )
            } else {
                swal(
                    $.t('modal.export.error') || "Echec de l'export !",
                    $.t('modal.export.errorMsg') || "Une erreur est survenue lors de l'export",
                    "error"
                )
            }
        },

        displaySaveMessage : function(result) {
            if (result) {
                swal(
                    $.t('modal.save.success') || "Sauvé !",
                    $.t('modal.save.successMsg') || "Votre formulaire a été enregistré sur le serveur !",
                    "success"
                );
            } else {
                swal(
                    $.t('modal.save.error') || "Une erreur est survenu !",
                    $.t('modal.save.errorMsg') || "Votre formulaire n'a pas été enregistré !\nPensez à faire un export",
                    "error"
                );
            }
        }

    });

    return FormView;

});