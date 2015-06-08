define([
    'jquery',
    'underscore',
    'marionette',
    'text!../templates/CenterGridPanelView.html',
    'backgrid',
    '../../Translater',
    '../collection/FormCollection',
    '../models/FormModel',
    'backbone.radio',
    'sweetalert',
    'slimScroll'
    ], function($, _, Marionette, CenterGridPanelViewTemplate, Backgrid, Translater, FormCollection, FormModel, Radio, swal) {

    var translater = Translater.getTranslater();

    /**
     * Main view in the homepage layout
     * This view contains backgrid element displaying collection element
     */
    var CenterGridPanelView = Backbone.Marionette.ItemView.extend({

        /**
         * View events
         */
        events : {
            'click #delete'    : 'deleteForm',
            'click #copy'      : 'duplicateForm',
            'click #edit'      : "editForm",
            'click #editRow'   : "editForm",
            'click #add'       : 'addForm',
            'click #import'    : 'importForm',
            'click #export'    : 'exportForm'
        },

        /**
         * Custom template from HTML file
         * We prefer use HTML file for each view instead script tag in one file for example
         */
        template: CenterGridPanelViewTemplate,

        /**
         * View construcotr
         * Initialize backbone radio grid channel
         *
         * @param  {object} options some options not used here
         */
        initialize : function(options) {
            _.bindAll(this, 'addFormSection', 'displayFormInformation', 'updateGridWithSearch', 'deleteForm')

            this.URLOptions = options.URLOptions;

            this.currentSelectedForm = 0;

            this.initGlobalChannel();
            this.initGridChannel();
            this.initHomePageChannel();
        },

        /**
         * Init backbone radio channel for home page module communication
         */
        initHomePageChannel : function() {
            this.homePageChannel = Backbone.Radio.channel('homepage');

            //  Event send by HomePageController when the form was deleted
            //  Depend of deleteForm event, see deleteForm method in this class
            this.homePageChannel.on('formDeleted', this.formDeleted, this);

            this.homePageChannel.on('destroy:success', this.displayDeleteSuccessMessage, this);
            this.homePageChannel.on('destroy:error', this.displayDeleteFailMessage, this);

            //  Event send from Formbuilder.js when export is finished (success or not)
            this.homePageChannel.on('exportFinished',   this.displayExportMessage, this);

            //  Duplicate event
            this.homePageChannel.on('duplicate:error', this.displayDuplicateFail, this);
            this.homePageChannel.on('duplicate:success', this.displayDuplicateSuccess, this);
        },

        /**
         * Init backbone radio channel for globale channel events
         */
        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');
        },

        /**
         * Initialize radio channel
         * The grid channel allows communication between views ONLY in the homepage layout
         */
        initGridChannel : function() {
            this.gridChannel = Backbone.Radio.channel('grid');

            // This event is receive when an user click on a grid's row
            // When the event is received, the view displays some additionnal information for the selected element in the grid
            //
            // this event is send from this view in a grid callback
            this.gridChannel.on('rowClicked', this.displayFormInformation);

            //  This event is send form the leftPanelView (see leftPanelView.js in views folder) when a user want to filter the grid via a form
            //  When the event is received we update grid data correspondig to the search
            this.gridChannel.on('search', this.updateGridWithSearch)

            //  Event send from LeftPanelView when user cleared search form
            //  We reset tje collection and update forms count
            this.gridChannel.on('resetCollection', this.resetCollection, this);
        },

        /**
         * form deleted event callback
         * Event send form controller
         * @param  {inter} result if the form was successfully deleted
         */
        formDeleted : function(result) {

            // FIX Me
            // I don't know why but the following code doesn't display the sweet alert modal
            // But if I add a setTimeout( .. ), it works but it's ugly

            if (result) {
                swal(
                    translater.getValueFromKey('modal.deleted.title') || 'Formulaire supprimé !',
                    translater.getValueFromKey('modal.deleted.text') || 'Votre formulaire a été supprimé avec succès',
                    "success"
                );
            } else {
                swal(
                    translater.getValueFromKey('modal.errorDeleted.title') || 'Formulaire n\'a pas pu êtresupprimé !',
                    translater.getValueFromKey('modal.errorDeleted.text') || 'Une erreur est survenue lors de la suppression du formulaire',
                    "error"
                )
            }
        },

        /**
         * Remove form from collection
         *
         * @param {object} evt jQuery event
         */
        deleteForm : function(evt) {

            // Usually i user _.bind function but with sweet alert library that do a bug
            // So old school style
            var self = this;

            var formToRemove = self.currentSelectedForm;

            swal({
                title              : translater.getValueFromKey('modal.clear.title') || "Etes vous sûr ?",
                text               : translater.getValueFromKey('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : translater.getValueFromKey('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : translater.getValueFromKey('modal.clear.no') || "Annuler",
                closeOnCancel      : true
            }, function(isConfirm) {
                if (isConfirm){
                    // Send event to FormCollection if user chosen to remove a form
                    //self.homePageChannel.trigger('deleteForm', formToRemove)
                    self.formCollection.deleteModel(formToRemove);
                }
            });
        },

        /**
         * Add additional information after the selected row in the grie
         *
         * @param {object} el    jQuery object, clicked row on the grid
         * @param {object} model Model information to display in the grid
         */
        addFormSection : function(el, model) {

            el.after(
                '<div class="formInformation"><tr >\
                    <td colspan="2"><label id="editRow"><span class="reneco reneco-edit"></span></label><p> ' + model.get('descriptionFr') + '</p></td>\
                    <td>' + model.get('keywordsFr').join(',') + '</td>\
                </tr></div>'
            );

            $('.formInformation').after('<tr class="padding"></tr>');

            var padding = $('.formInformation').height();

            $('.formInformation').fadeIn(500);
            $('.padding').animate({
                height : padding + 30
            });
            el.addClass('selected');
        },

        /**
         * Callback for grid channel "rowClicked" event
         * Display additionnal information for the model in parameter
         *
         * @param {object} elementAndModel contains jQuery row element and the model
         */
        displayFormInformation : function(elementAndModel) {

            var newSelctedRow = elementAndModel['model'].get('id');

            if (this.currentSelectedForm == newSelctedRow) {

                this.clearSelectedRow();

            } else {

                //  User clicked on another row
                this.updateFooterAction();

                var el      = elementAndModel['el'],
                    model   = elementAndModel['model'];

                if ($('.formInformation').length > 0) {
                    $('.formInformation').fadeOut(100, _.bind(function() {
                        $('.padding').slideUp(500);
                        $('.formInformation').remove()
                        $('tr.selected').removeClass('selected');
                        this.addFormSection(el, model);
                    }, this));
                } else {
                    this.addFormSection(el, model);
                }

                this.beforeFormSelection = this.currentSelectedForm;
                this.currentSelectedForm = newSelctedRow;
            }

        },

        /**
         * Unselected current selected row
         */
        clearSelectedRow : function() {
            //  User clicked on the same row
            $('.formInformation').fadeOut(100, _.bind(function() {
                $('.padding').slideUp(500);
                $('.formInformation').remove()
                $('tr.selected').removeClass('selected');
            }, this));

            this.beforeFormSelection = this.currentSelectedForm;
            this.currentSelectedForm = -1;

            this.clearFooterAction();
        },

        /**
         * Remove footer action except new and import action
         */
        clearFooterAction : function() {
            this.$el.find('footer').animate({
                bottom : '-80px'
            }, 500);
            $('#add, #import').switchClass('grey', 'red', 1);
        },

        /**
         * Display common action form the current selected form like delete, clone, etc ...
         */
        updateFooterAction : function() {
            this.$el.find('footer').animate({
                bottom : '0'
            }, 500);
            $('#add, #import').switchClass('red', 'grey', 1);
        },

        /**
         * Return clickable row
         *
         * @returns {Backgrid.Row} custom clickable row
         */
        initClickableRow : function() {

            // By default grid not fired click event
            // But we can't create a small clickable row to get the event
            return Backgrid.Row.extend({
                events: {
                    "click": "onClick"
                },

                /**
                 * Row click callback
                 * When user clicked on a row we send current element and model information with backbone radio grid channel
                 */
                onClick: function () {
                    this.gridChannel = Backbone.Radio.channel('grid');
                    this.gridChannel.trigger('rowClicked', {
                        model   : this.model,
                        el      : this.$el
                    });
                }
            });
        },

        /**
         * Initialize backgrid instance
         */
        initGrid : function() {
            this.grid = new Backgrid.Grid({

                row: this.initClickableRow(),
                columns    : [{
                    name  : 'name',
                    label    : translater.getValueFromKey('grid.name') || 'Name',
                    cell  : 'string',
                    editable : false
                }, {
                    name     : 'creationDateDisplay',
                    label    : translater.getValueFromKey('grid.creationDate') || 'Creation Date',
                    cell     : "string",
                    editable : false
                }, {
                    name     : 'modificationDateDisplay',
                    label    : translater.getValueFromKey('grid.modificationDate') || 'Modification date',
                    cell     : 'string',
                    editable : false
                }],
                collection : this.formCollection
            });
        },

        /**
         * Do some stuff after rendering view
         *
         * @param {[type]} options options give to the view like URL for collection fetching
         */
        onRender: function(options) {

            //  Create the form collection with an URL
            this.formCollection = new FormCollection({
                url : this.URLOptions.forms
            });

            this.formCollection.reset();

            //  Create grid
            this.initGrid();

            // Render the grid and attach the root to your HTML document
            $(this.el).find("#grid").html(this.grid.render().el);

            // Fetch some countries from the url
            this.formCollection.fetch({
                reset: true,
                timeout:5000,
                success : _.bind(function() {
                    this.hideSpinner();

                    //  Wait fetch end before display forms count and scrollbar got backgrid table
                    this.$el.find('#formsCount').text(this.formCollection.length)
                    $("#scrollSection").slimScroll({
                        height : '90%',
                        color: '#111'
                    });

                    //  Clone table
                    $(this.el).find("#grid2").html( $(this.el).find("#grid").html() );
                    //  Keep only one table row to lighten table
                    $(this.el).find("#grid2 tbody tr").slice(1).remove();
                }, this),
                error : _.bind(function() {
                    this.displayFetchError();
                }, this)
            });

            this.$el.i18n();
        },

        /**
         * Display error when the front is unable to fetch form list from the server
         */
        displayFetchError : function() {
            swal(
                translater.getValueFromKey('fetch.error') || "Erreur de récupération des formulaires !",
                translater.getValueFromKey('fetch.errorMsg') || "Impossible de récupérer la liste des formulaires depuis le serveur",
                "error"
            );
            this.hideSpinner();
        },

        /**
         * Hide spinner when loading is finished
         */
        hideSpinner : function(duration) {
            setTimeout(_.bind(function() {
                this.$el.find('.spinner').addClass('end', 500);
            }, this), duration || 500);
        },

        /**
         * Display spinner
         */
        showSpinner : function() {
            this.$el.find('.spinner').removeClass('end');
        },

        /**
         * Backbone radio event callback
         * Reset collection and update forms count
         */
        resetCollection : function() {
            this.formCollection.fetch({
                reset : true,
                success : _.bind(function() {
                    this.$el.find('#formsCount').text(this.formCollection.length)
                }, this)
            });
        },

        /**
         * Search grid channel callback
         * Update grid with user typed data
         *
         * @param {Object} searchData user typed data
         */
        updateGridWithSearch : function(searchData) {
            this.showSpinner();
            this.updateCollectionAfterSearch(searchData);
        },

        /**
         * Filter collection elements following user typed data
         *
         * @param {Object} searchData user typed data
         */
        updateCollectionAfterSearch: function(searchData) {

            var foundedModels = this.formCollection.filter(function(model) {
                var correspondingCondition = true;

                //  Check if models name contains typed name
                correspondingCondition = correspondingCondition &&((model.get('name').toLowerCase()).indexOf(searchData.name.toLowerCase()) >=0 );

                //  Check if typed keywords is present in french keywords list or english keywords list
                if (searchData.keywords != undefined) {
                    correspondingCondition = correspondingCondition && (
                        model.get('keywordsFr').join().indexOf(searchData.keywords.toLowerCase()) > 0
                        ||
                        model.get('keywordsEn').join().indexOf(searchData.keywords.toLowerCase()) > 0
                    )
                }


                if (searchData.dateFrom != undefined) {
                    //  Date comparaison
                    var creationDate = model.get('creationDate');
                    creationDate.setHours(0);
                    creationDate.setMinutes(0);
                    creationDate.setSeconds(0);

                    var dateFrom = new Date(searchData.dateFrom);
                    dateFrom.setHours(0);

                    correspondingCondition = correspondingCondition && (dateFrom - creationDate < 0);
                }

                if (searchData.dateTo != undefined) {
                    //  Date comparaison
                    var creationDate = model.get('creationDate');
                    creationDate.setHours(0);
                    creationDate.setMinutes(0);
                    creationDate.setSeconds(0);

                    var dateTo = new Date(searchData.dateTo);
                    dateTo.setHours(0);

                    correspondingCondition = correspondingCondition && (dateTo - creationDate > 0);
                }

                return correspondingCondition;
            });

            this.formCollection.reset(foundedModels);
            this.$el.find('#formsCount').text(foundedModels.length)
            this.hideSpinner(500);
        },

        /**
         * Clone current selected form model
         */
        duplicateForm : function() {
            // clone element
            this.formCollection.cloneModel(this.currentSelectedForm);

            //  Update grid ans collection count
            this.grid.render()
            this.$el.find('#formsCount').text(this.formCollection.length);

            $('tr.selected').removeClass('selected');


            //  Scroll to the end
            $("#scrollSection").scrollTop( $( "#scrollSection" ).prop( "scrollHeight" ) );
            $("#scrollSection").slimScroll('update');

            //  Notify the new model
            $('#grid table tr:last-child').addClass('clone', 1000, function() {
                $(this).removeClass('clone', 1000)
            });
        },

        /**
         * User wants to edit a form of the list
         */
        editForm : function() {
            var formToEdit = this.formCollection.get(this.currentSelectedForm);

            //  Send an event to the formbuilder
            //  Two modules never speak directly, all communication pass htrough formbuilder App
            this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());
        },

        askNewFormName : function() {
            var self = this;

            swal({
                title                       : translater.getValueFromKey('modal.newForm.title') || "Nouveau formulaire",
                text                        : translater.getValueFromKey('modal.newForm.text') || "Saisir le nom du nouveau formulaire",
                cancelButtonText            : translater.getValueFromKey('modal.newForm.cancelButtonText') || "Annuler",
                type                        : "input",
                showCancelButton            : true,
                closeOnConfirm              : false,
                animation                   : "slide-from-top",
                inputPlaceholder            : translater.getValueFromKey('modal.newForm.inputPlaceholder') || "Nom du nouveau formulaire"
            }, function (inputValue) {
                if (inputValue === false) return false;
                if (inputValue === "") {
                    swal.showInputError(translater.getValueFromKey('modal.newForm.error') || "Le nom ne peut pas être vide");
                    return false
                }

                var formToEdit = new FormModel({
                    name : inputValue
                });

                swal.close();

                self.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());

            });
        },

        /**
         * Add new form and edit it
         */
        addForm : function() {


            this.askNewFormName();


        },

        /**
         * Import form
         */
        importForm : function() {
            require([
                'homePageModule/modals/ImportModalView',
                'editionPageModule/utilities/Utilities'
            ], _.bind(function(importProtocolModal, Utilities) {
                $('body').append('<div class="modal fade" id="importModal"></div>');
                var modalView = new importProtocolModal({
                    el: "#importModal"
                });
                modalView.render();
                $("#importModal").i18n();

                $('#importModal').on('hidden.bs.modal', _.bind(function () {
                    var datas = modalView.getData();

                    if (!datas.closed) {
                        Utilities.ReadFile(datas['file'], _.bind(function (result) {
                            try {
                                if (result !== false) {

                                    this.globalChannel.trigger('formImported', $.parseJSON(result));

                                } else {
                                    swal(
                                        translater.getValueFromKey('modal.import.error') || "Une erreur est survenu !",
                                        translater.getValueFromKey('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                        "error"
                                    );
                                }
                            } catch (e) {
                                console.log(e)
                                swal(
                                    translater.getValueFromKey('modal.import.error') || "Une erreur est survenu !",
                                    translater.getValueFromKey('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                    "error"
                                );
                            }
                        }, this));
                    }

                }, this));

            }, this));
        },

        /**
         * Display sweet alter message if the form as been deleted
         */
        displayDeleteSuccessMessage : function() {
            //  I've a bug with sweet-alert
            //  I've to put this swal call in a setTimeout otherwise it doesn't appear
            //  A discussion is opened on Github : https://github.com/t4t5/sweetalert/issues/253
            setTimeout(_.bind(function() {
                swal(
                    translater.getValueFromKey('modal.clear.deleted') || "Supprimé !",
                    translater.getValueFromKey('modal.clear.formDeleted') || "Votre formulaire a été supprimé !",
                    "success"
                );
            }, this), 500)
        },

        /**
         * Display sweet alter message can't be deleted
         */
        displayDeleteFailMessage : function() {
            //  Same problem as previous function
            //  A discussion is opened on Github : https://github.com/t4t5/sweetalert/issues/253
            setTimeout(_.bind(function() {
                swal(
                    translater.getValueFromKey('modal.clear.deleteError') || "Non supprimé !",
                    translater.getValueFromKey('modal.clear.formDeletedError') || "Votre formulaire n'a pas pu être supprimé !",
                    "error"
                );
            }, this), 500)
        },

        /**
         * Display a message when the export is finished or failed
         *
         * @param result if the export is right done or not
         */
        displayExportMessage : function(result) {
            if (result) {
                swal(
                    translater.getValueFromKey('modal.export.success') || "Export réussi !",
                    "",
                    "success"
                )
            } else {
                swal(
                    translater.getValueFromKey('modal.export.error') || "Echec de l'export !",
                    translater.getValueFromKey('modal.export.errorMsg') || "Une erreur est survenue lors de l'export",
                    "error"
                )
            }
        },

        /**
         * Export form
         *
         * @param e jquery event
         */
        exportForm : function(e) {
            require(['editionPageModule/modals/ExportModalView'], _.bind(function(ExportModalView) {

                //  Add new element for modal view
                $('body').append('<div class="modal  fade" id="exportModal"></div>');

                //  Create view and render it
                var modalView = new ExportModalView({
                    el: "#exportModal",
                    URLOptions: this.URLOptions
                });
                $('#exportModal').append( modalView.render() );
                $("#exportModal").i18n();

                //  Listen to view close event
                //  When modal is closed we get typed data user
                $('#exportModal').on('hidden.bs.modal', _.bind(function () {
                    var datas = modalView.getData();
                    if( datas['response']) {

                        //  Send event to edition page controller for export form in JSON file
                        //  We send the filename typed by the user
                        this.homePageChannel.trigger('export', datas['filename'], this.formCollection.get(this.beforeFormSelection).toJSON() );

                        $('#exportModal').modal('hide').removeData();
                        $('#exportModal').html('').remove();
                    }
                }, this));

            }, this));
        },

        /**
         * Display a message if the form has been duplicated and saved
         */
        displayDuplicateFail : function() {
            swal(
                translater.getValueFromKey('modal.duplicate.error') || "Une erreur est survenue !",
                translater.getValueFromKey('modal.duplicate.errorMsg') || "Votre formulaire n'a pas pas être dupliqué !",
                "error"
            );
        },

        /**
         * Display an error message if an error occurred during duplication or save
         */
        displayDuplicateSuccess : function() {
            swal(
                translater.getValueFromKey('modal.duplicate.success') || "Dupliqué !",
                translater.getValueFromKey('modal.duplicate.successMsg') || "Votre formulaire a été dupliqué et enregistré sur le serveur !",
                "success"
            );
        }
    });

    return CenterGridPanelView;

});
