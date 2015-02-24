define([
    'jquery',
    'underscore',
    'marionette',
    'text!../templates/CenterGridPanelView.html',
    'backgrid',
    '../collection/FormCollection',
    'backbone.radio',
    'slimScroll'
    ], function($, _, Marionette, CenterGridPanelViewTemplate, Backgrid, FormCollection, Radio) {

    /**
     * Main view in the homepage layout
     * This view contains backgrid element displaying collection element
     */
    var CenterGridPanelView = Backbone.Marionette.ItemView.extend({

        events : {
            'click #delete' : 'deleteForm',
            'click #copy'   : 'duplicateForm',
            'click #edit'   : "editForm",
            'click #import' : 'importForm'
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
        },

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
                    $.t('modal.deleted.title') || 'Formulaire supprimé !',
                    $.t('modal.deleted.text') || 'Votre formulaire a été supprimé avec succès',
                    "success"
                );
            } else {
                swal(
                    $.t('modal.errorDeleted.title') || 'Formulaire n\'a pas pu êtresupprimé !',
                    $.t('modal.errorDeleted.text') || 'Une erreur est survenue lors de la suppression du formulaire',
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

            swal({
                title              : $.t('modal.clear.title') || "Etes vous sûr ?",
                text               : $.t('modal.clear.text') || "Le formulaire sera définitivement perdu !",
                type               : "warning",
                showCancelButton   : true,
                confirmButtonColor : "#DD6B55",
                confirmButtonText  : $.t('modal.clear.yes') || "Oui, supprimer",
                cancelButtonText   : $.t('modal.clear.no') || "Annuler",
                closeOnCancel      : true
            }, function(isConfirm) {
                if (isConfirm){
                    // Send event to HomePageControll if user choosed to remove a form
                    self.homePageChannel.trigger('deleteForm', self.currentSelectedForm)
                }
            });
        },

        /**
         * Add additional information after the selected row in the grid
         *
         * @param {object} el    jQuery object, clicked row on the grid
         * @param {object} model Model information to display in the grid
         */
        addFormSection : function(el, model) {
            el.after(
                '<tr class="formInformation">\
                    <td colspan="2"><p>' + model.get('descriptionFr') + '</p></td>\
                    <td>' + model.get('keywordsFr').join(',') + '</td>\
                </tr>'
            );
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
                        $('.formInformation').remove()
                        $('tr.selected').removeClass('selected');
                        this.addFormSection(el, model);
                    }, this));
                } else {
                    this.addFormSection(el, model);
                }

                this.currentSelectedForm = newSelctedRow;
            }

        },

        /**
         * Unselected current selected row
         */
        clearSelectedRow : function() {
            //  User clicked on the same row
            $('.formInformation').fadeOut(100, _.bind(function() {
                $('.formInformation').remove()
                $('tr.selected').removeClass('selected');
            }, this));

            this.currentSelectedForm = -1;

            this.clearFooterAction();
        },

        /**
         * Remove footer action except new and import action
         */
        clearFooterAction : function() {
            this.$el.find('footer div.pull-left').fadeOut(200)
            $('#add, #import').switchClass('grey', 'red', 1);
        },

        /**
         * Display common action form the current selected form like delete, clone, etc ...
         */
        updateFooterAction : function() {
            this.$el.find('footer div.pull-left').fadeIn(500)
            $('#add, #import').switchClass('red', 'grey', 1);
        },

        /**
         * Do some stuff after rendering view
         *
         * @param {[type]} options options give to the view like URL for collection fetching
         */
        onRender: function(options) {

            //  Create the form collection with an URL
            this.formCollection = new FormCollection({
                url : options.collectionURL
            });

            // By default grid not fired click event
            // But we can't create a small clickable row to get the event
            var ClickableRow = Backgrid.Row.extend({
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

            //  Create grid
            this.grid = new Backgrid.Grid({

                row: ClickableRow,
                columns    : [{
                        name  : 'name',
                        label : 'Name',
                        cell  : 'string',
                        editable : false
                    }, {
                        name     : 'creationDateDisplay',
                        label    : 'Creation date',
                        cell     : "string",
                        editable : false
                    }, {
                        name     : 'modificationDateDisplay',
                        label    : 'Modification date',
                        cell     : 'string',
                        editable : false
                    }],
                collection : this.formCollection
            });

            // Render the grid and attach the root to your HTML document
            $(this.el).find("#grid").html(this.grid.render().el);

            // Fetch some countries from the url
            this.formCollection.fetch({
                reset: true,
                success : _.bind(function() {

                    //  Wait fetch end before display forms count and scrollbar got backgrid table
                    this.$el.find('#formsCount').text(this.formCollection.length)
                    $("#scrollSection").slimScroll({
                        height : '90%',
                        color: '#111',
                    });

                    //  Clone table
                    $(this.el).find("#grid2").html( $(this.el).find("#grid").html() );
                    //  Keep only one table row to lighten table
                    $(this.el).find("#grid2 tbody tr").slice(1).remove();
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
            this.formCollection.fetch({
                reset: true,
                success : _.bind(function() {
                    this.updateCollectionAfterSearch(searchData);
                }, this)
            });
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
                correspondingCondition = correspondingCondition && (searchData.name ? model.get('name').indexOf(searchData.name.toLowerCase()) >= 0 : true);

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
        },

        /**
         * Clone current selected form model
         */
        duplicateForm : function() {
            // clone element
            this.formCollection.cloneModel(this.currentSelectedForm)

            //  Update grid ans collection count
            this.grid.render()
            this.$el.find('#formsCount').text(this.formCollection.length)

            $('tr.selected').removeClass('selected');

            //  Scroll to the end
            $("#scrollSection").scrollTop( $( "#scrollSection" ).prop( "scrollHeight" ) );
            $("#scrollSection").perfectScrollbar('update');

            //  Notify the new model
            $('#grid table tr:last-child').addClass('clone', 1000, function() {
                $(this).removeClass('clone', 1000)
            });
        },

        /**
         * User wants to edit a form of the list
         */
        editForm : function() {
            //  Send an event to the formbuilder
            //  Two modules never speak directly, all communication pass htrough formbuilder App

            var formToEdit = this.formCollection.get(this.currentSelectedForm);

            //  /!\ AT this point, normally i've to get form fieldset and schema
            //  But wanting to keep an indenpendant client side mode, for the moment we send only form description

            this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());
        },

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

                    Utilities.ReadFile(datas['file'], _.bind(function(result) {
                        //try {
                            if (result !== false) {

                                this.globalChannel.trigger('formImported', $.parseJSON(result));

                            } else {
                                swal(
                                    $.t('modal.import.error') || "Une erreur est survenu !",
                                    $.t('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                    "error"
                                );
                            }
                        /*} catch (e) {
                            console.log (e)
                            swal(
                                $.t('modal.import.error') || "Une erreur est survenu !",
                                $.t('modal.import.errorMsg') || "Votre formulaire n'a pas pu être importé",
                                "error"
                            );
                        }*/
                    }, this));

                }, this));

            }, this));
        }

    });

    return CenterGridPanelView;

});
