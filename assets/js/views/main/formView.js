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

        events: {
            'click h1>span' : 'protocolSettings',
            'click #export'   : 'export',
            'click #import'   : 'import',
            'click #clearAll' : 'clear',
            'click #save'     : 'save'
        },

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
                            'clear'
                    );
            this.collection.bind('newElement', this.addElement);
            this._view = [];

            this.URLOptions = options.URLOptions;


            //  -------------------------------------------------------------
            //  Backbone radio configuration


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
            this.formChannel.on('save:return', _.bind(function(saveResult) {
                if (saveResult) {
                    swal("Sauvé !", "Votre formulaire a été enregistré sur le serveur !", "success");
                } else {
                    swal("Une erreur est survenu !", "Votre formulaire n'a pas été enregistré !\nPensez à faire un export", "error");
                }
            }, this));

        },

        protocolSettings : function() {
            //  Send an event to the setting view (settingView.js) to display properties form
            this.formChannel.trigger('displaySettings', this.collection);
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
                    if( datas['response'])
                        this.formChannel.trigger('export', modalView.getData());
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
                            this.formChannel.trigger('JSONUpdate', jsonParsed);

                        } else {
                            // display error
                            console.log (result)
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
                title              : "Etes vous sûr?",
                text               : "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : "Oui, supprimer",
                cancelButtonText   : "Annuler",
                closeOnConfirm     : false,
                closeOnCancel      : true
            }, function(isConfirm) {
                if (isConfirm) {
                    swal("Supprimé !", "Votre formulaire a été supprimé !", "success");
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

            }, this), function(err) {
                swal("Echec de l'ajout!", "Une erreur est survenue lors de l'ajout du champ!", "error");
            });
        },

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
                        _vues[v].updateIndex($('#' + v).index());
                    }
                }
            });

            return this;
        },

        getModel : function() {
            return this.collection.length;
        },

        getJSON : function() {
            return this.collection.getJSON();
        },

        importJSON : function(JSONImport)  {
            this.collection.updateWithJSON(JSONImport);
        }
    });

    return FormView;

});