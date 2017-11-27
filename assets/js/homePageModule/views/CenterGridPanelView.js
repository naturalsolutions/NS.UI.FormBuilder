define([
    'jquery',
    'lodash',
    'marionette',
    'moment',
    'text!../templates/GridView.html',
    'backgrid',
    '../../Translater',
    '../collection/FormCollection',
    '../models/FormModel',
    'backbone.radio',
    'sweetalert',
    '../../app-config',
    'tools',
    'slimScroll'
    ], function($, _, Marionette, moment, GridView, Backgrid, Translater,
                FormCollection, FormModel, Radio, sweetalert, AppConfig, tools) {

    var translater = Translater.getTranslater();

    /**
     * Main view in the homepage layout
     * This view contains backgrid element displaying collection element
     */
    var CenterGridPanelView = Backbone.Marionette.ItemView.extend({
        events : {
            'click #delete'        : 'deleteForm',
            'click #copy'          : 'duplicateForm',
            'click #edit'          : "editForm",
            'click .editForm'      : "editForm",
            'click #editRow'       : "editForm",
            'click #add'           : 'addForm',
            'click #import'        : 'importForm',
            'click #export'        : 'exportForm'
        },

        /**
         * initTemplate initialize this.template with provided html template and parameters,
         * it also stores parameters into this.tplParams for further use with this.updateTemplate
         *
         * @param template - html template (lodash)
         * @param context - "all" / "track" / ...
         * @param topContext - "reneco" / "*"
         * @param readonly - enable read-only mode (no edition of forms)
         * @param extraParams - any parameters to be injected
         */
        initTemplate: function(template, context, topContext, readonly, extraParams) {
            if (!context) context = "all";
            if (!topContext) topContext = "default";
            if (!extraParams) extraParams = {};
            if (!template) template = CenterGridPanelView;

            var params = extraParams;
            params.context = context.toLowerCase();
            params.topContext = topContext.toLowerCase();
            params.readonly = readonly;

            this.currentTemplate = {
                html: template,
                params: params
            };
            this.updateTemplate();
        },

        /**
         * currentTemplate stores template values to facilitate changing context & stuff,
         * cause it's really doable given how lodash handles template rendering.
         */
        currentTemplate: {
           html: {},
           params: {}
        },

        /**
         * updateTemplate updates this.template with currentTemplate data
         * after doing various stuff depending on context & other options.
         */
        updateTemplate: function() {
          var tpl = this.currentTemplate;
          // force lowercase on params
          for (var param in tpl.params) {
              if (typeof tpl.params[param] === 'string')
                tpl.params[param] = tpl.params[param].toLowerCase();
          }
          this.template = function(model) {
              return _.template(tpl.html)(tpl.params);
          };
        },

        /**
         * View construcotr
         * Initialize backbone radio grid channel
         *
         * @param  {object} options some options not used here
         */
        initialize : function(options, readonly) {
            _.bindAll(this, 'addFormSection', 'displayFormInformation', 'updateGridWithSearch', 'deleteForm');

            this.URLOptions = options.URLOptions;

            this.currentSelectedForm = -1;
            this.clearFooterAction();

            this.initGlobalChannel();
            this.initGridChannel();
            this.initHomePageChannel();

            this.scrollSize = options.scrollSize || '100%';
            this.importProtocolModalView = null;

            var context = $("#contextSwitcher .selected").text().toLowerCase();
            window.context = context;

            // init formCollection
            this.formCollection = new FormCollection({
                url : this.URLOptions.forms,
                context : context
            });

            // init grid & template
            this.initGrid();
            this.initTemplate(
                GridView,
                context,
                AppConfig.appMode.topcontext,
                readonly);
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

            this.homePageChannel.on('setCenterGridPanel', this.setCenterGridPanel, this);
        },

        /**
         * Init backbone radio channel for globale channel events
         */
        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');
            this.globalChannel.on('formLoaded', this.hideSpinner, this);
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
         * @param {inter} result if the form was successfully deleted
         */
        formDeleted : function(result) {

            // FIX Me
            // I don't know why but the following code doesn't display the sweet alert modal
            // But if I add a setTimeout( .. ), it works but it's ugly

            if (result) {
                tools.swal("success", "modal.deleted.title", "modal.deleted.text");
            } else {
                tools.swal("error", "modal.errorDeleted.title", "modal.errorDeleted.text");
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
            var currentForm = self.formCollection.get(self.currentSelectedForm).toJSON();

            var loadedFormWeight;

            var getLoadedFormWeight = function () {
                var toret = "";

                if (AppConfig.appMode.topcontext == "reneco")
                    toret += "<br/><br/><span id='makeObsoleteArea'>Passer le formulaire en obsolète à la place :<br/>"+
                            "<span id='doMakeObsolete'>Rendre obsolète</span></span><br/>";

                if (currentForm.context == "track")
                {
                    if (loadedFormWeight)
                        return (toret + loadedFormWeight);
                    toret += "<br/><span id='contentDeleteForm'><br /><img id='formDatasImg' src='assets/images/loader.gif' /></span>";
                }

                return (toret);
            };

            if (currentForm.context == "track")
            {
                $.ajax({
                    data: {},
                    type: 'GET',
                    url: this.URLOptions.trackFormWeight + "WFBID/" + self.currentSelectedForm,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: _.bind(function (data) {
                        data = JSON.parse(data);
                        loadedFormWeight = "<br /><br />Liste des saisies pour le formulaire selectionné :<br/>";
                        $.each(data.FormWeight, function (index, value) {
                            loadedFormWeight += "<span>" + index + " : " + value + " saisies</span><br/>";
                        });
                        if ($("#formDatasImg").length > 0) {
                            $("#contentDeleteForm").empty();
                            $("#contentDeleteForm").append(loadedFormWeight);
                        }
                    }, this),
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                    }, this)
                });
            }

            var extraSwalOpts = {
                confirmButtonColor: "#DD6B55",
                confirmButtonText: translater.getValueFromKey('modal.clear.yes'),
                cancelButtonText: translater.getValueFromKey('modal.clear.no'),
                showCancelButton: true
            };

            tools.swal("warning",
                "modal.clear.title",
                "modal.clear.text",
                extraSwalOpts,
                null,
                function() {
                    setTimeout(function () {
                        tools.swal("warning",
                            "modal.clear.title2",
                            translater.getValueFromKey('modal.clear.text2') + getLoadedFormWeight(),
                            $.extend(extraSwalOpts, {html: true}),
                            null,
                            function() {
                                // Send event to FormCollection if user chosen to remove a form
                                self.homePageChannel.trigger('deleteForm', currentForm.id);
                                self.formCollection.deleteModel(currentForm.id);
                            });
                        $("#doMakeObsolete").on("click", function() {
                            self.closeAndObsolete();
                        });
                    }, 200);
                });
        },

        closeAndObsolete : function() {
            var that = this;

            sweetalert.close();

            $.ajax({
                data: {},
                type: 'PUT',
                url: that.URLOptions.makeObsolete + "/" + that.beforeFormSelection,
                contentType: 'application/json',
                crossDomain: true,
                success: _.bind(function (data) {
                    tools.swal("success", "modal.makeObs.success", "modal.makeObs.successMsg");
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                }, this)
            });
        },

        /**
         * Add additional information after the selected row in the grid
         *
         * @param {object} el    jQuery object, clicked row on the grid
         * @param {object} model Model information to display in the grid
         */
        addFormSection : function(el, model) {
            var context = $("#contextSwitcher .selected").text();
            // TODO To Move
            if (context.toLowerCase() == "all" || context.toLowerCase() == model.get('context'))
            {
                el.after(
                    '<div class="formInformation row ">\
                        <div class="col-md-12">\
                            <label class="infos">' +
                    model.get('descriptionFr')
                    + '</label>\
                        <label class="infos">'+
                    model.get('keywordsFr').join(',')
                    + '</label>\
                        <div class="pull-right">\
                            <button class="reneco grey editForm">\
                                <label>'
                    +
                    (this.globalChannel.readonly ?
                        '<span data-i18n="form.actions.viewdetails">VOIR DETAILS</span>' :
                        '<span data-i18n="form.actions.edit">EDITER</span>')
                    +
                    '</label>\
                        <label>\
                        <span class="reneco reneco-edit"></span>\
                        </label>\
                        </button>\
                        </div>\
                        </div>\
                        </div>'
                );
                //;el.after(
                //    '<div class="formInformation"><tr >\
                //        <td colspan="2"><label id="editRow"><span class="reneco reneco-edit"></span></label><p> ' + model.get('descriptionFr') + '</p></td>\
                //        <td>' + model.get('keywordsFr').join(',') + '</td>\
                //    </tr></div>'
                //);

                $('.formInformation').after('<tr class="padding"></tr>');

                var padding = $('.formInformation').height();

                $('.formInformation').fadeIn(500);
                $('.padding').animate({
                    height : padding + 30
                });
                el.addClass('selected');
            }
        },

        /**
         * Callback for grid channel "rowClicked" event
         * Display more information for the model in parameter
         *
         * @param {object} elementAndModel contains jQuery row element and the model
         */
        displayFormInformation : function(elementAndModel) {
            var newSelctedRow = elementAndModel['model'].get('id');
            var el      = elementAndModel['el'],
                model   = elementAndModel['model'];

            // remove rowControls from grid, to avoid duplicate cloning
            $("#grid").find('#rowControls').remove();

            if (this.currentSelectedForm == newSelctedRow) {
                this.clearSelectedRow();
            } else {
                // clone controls to selected row
                $('#rowControls').clone().appendTo($(el).find("td:last-of-type"));

                if (AppConfig.appMode.topcontext == "reneco") {
                    $('tr.selected').removeClass('selected');
                    el.addClass('selected');
                } else {
                    if ($('.formInformation').length > 0) {
                        $('.formInformation').fadeOut(100, _.bind(function() {
                            $('.padding').slideUp(500);
                            $('.formInformation').remove();
                            $('tr.selected').removeClass('selected');
                            this.addFormSection(el, model);
                        }, this));
                    } else {
                        this.addFormSection(el, model);
                    }
                }

                this.beforeFormSelection = this.currentSelectedForm;
                this.currentSelectedForm = newSelctedRow;
            }
        },

        /**
         * Unselected current selected row
         */
        clearSelectedRow : function() {
            //  context !== reneco
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
            $('tr.selected').removeClass('selected');
        },

        /**
         * Return clickable row
         *
         * @returns {Backgrid.Row} custom clickable row
         */
        initClickableRow : function() {
            var that = this;
            var selectedForm = this.currentSelectedForm;
            // By default grid not fired click event
            // But we can't create a small clickable row to get the event
            return Backgrid.Row.extend({
                events: {
                    "click": "onClick",
                    "dblclick": "onDblClick"
                },

                /**
                 * Row click callback
                 * When user clicked on a row we send current element and model information with backbone radio grid channel
                 */
                onClick: function (e) {
                    // dismiss click event if srcElement is a .control (delete / edit)
                    if ($(e.originalEvent.srcElement).hasClass("control")) {
                        return;
                    }

                    this.gridChannel = Backbone.Radio.channel('grid');
                    this.gridChannel.trigger('rowClicked', {
                        model   : this.model,
                        el      : this.$el
                    });
                },
                onDblClick: function(e) {
                    if (that.currentSelectedForm == -1)
                        this.onClick(e);
                    that.editForm(this.model.get('context'));
                }
            });
        },

        /**
         * Initialize backgrid instance
         */
        initGrid : function() {
            // only once
            if (this.grid) {
                return;
            }

            this.grid = new Backgrid.Grid({
                row: this.initClickableRow(),
                collection : this.formCollection
            });
            this.resetGridColumns();
        },

        /**
         * updateRecentlyEdited inserts the recently edited forms from this.formCollection,
         * sorted by modification date.
         */
        updateRecentlyEdited: function() {
            // retreive grid rows for sorting
            var sorter = [];
            for (var id in this.formCollection.models) {
                sorter.push([id, this.formCollection.models[id]]);
            }

            // sort by modification date
            var parseModificationDate = function(model) {
                return moment(model.get("modificationDate"), "DD/MM/YYYY - hh:mm:ss");
            };
            sorter.sort(function(a, b) {
                a = parseModificationDate(a[1]);
                b = parseModificationDate(b[1]);
                return b.unix() - a.unix();
            });

            // empty recentlyEdited container
            var $cont = $(".recentlyEdited");
            $cont.empty();

            // insert 12 first elements in $cont (todo config 12 ?)
            $(sorter).slice(0, 12).each(_.bind(function(idx, row) {
                var model = row[1];
                var id = model.get("id");

                var $el = $("<div>");
                $el.addClass(model.get("editStatus"));
                $el.attr("data-id", id);
                $el.text(model.get("name"));

                $el.on("click", _.bind(function() {
                    this.editForm(model.get('context'), id);
                }, this));
                $cont.append($el);
            }, this));

            // adapt height (suggest to changes depending on .customFilters section)
            var searchH = $("#leftPanel").find(".search").outerHeight();
            var margin = $(".edited h3").outerHeight() - $(".edited h3").height();
            $cont.closest(".edited").attr("style",
                "height: calc(100% - " + (searchH + margin) + "px);");
        },

        /**
         * Do some stuff after rendering view
         *
         * @param {[type]} options options give to the view like URL for collection fetching
         */
        onRender: function(options) {
            this.formCollection.reset();

            // Fetch some countries from the url
            this.formCollection.fetch({
                reset: true,
                timeout: 15000,
                success : _.bind(function() {
                    this.hideSpinner();

                    // Insert rendered grid
                    $(this.el).find("#grid").html(this.grid.render().el);

                    // Update recently edited forms
                    this.updateRecentlyEdited();

                    //  Wait fetch end before display forms count and scrollbar got backgrid table
                    this.$el.find('#formsCount').text(  $.t("formCount.form", { count: this.formCollection.length }) );

                    $(".scroller").slimScroll({
                        height       : this.scrollSize,
                        color        : '#111',
                        railVisible  : true,
                        alwaysVisible: true
                    });

                    this.updateGridHeader();
                }, this),
                error : _.bind(function() {
                    tools.swal("error", "fetch.error", "fetch.errorMsg");
                    this.hideSpinner();
                }, this)
            });

            this.$el.i18n();
        },

        /**
         * updateGridHeader clones main grid to extract and display a fixed table header
         */
        updateGridHeader: function() {
            //  clone table for header
            $(this.el).find("#grid2").html( $(this.el).find("#grid").html() );
            // remove stuff in it
            $(this.el).find("#grid2 tbody tr").slice(1).remove();

            // bind newly created header links to real-grid's header (sorters)
            var that = this;
            $(this.el).find("#grid2 th a").on("click", function(){
                $(that.el).find("#grid th."+$(this).parent().attr('class').replace(/ /g, ".")+" a").click();
            });
        },

        /**
         * Hide spinner when loading is finished
         */
        hideSpinner : function() {
            this.$el.find('.spinner').addClass('end', 250);
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
        resetCollection : function(callback) {
            this.showSpinner();
            this.formCollection.fetch({
                reset : true,
                success : _.bind(function() {
                    this.$el.find('#formsCount').text(  $.t("formCount.form", { count: this.formCollection.length }) );
                    this.updateRecentlyEdited();
                    if (callback) {
                        callback();
                    }
                    this.hideSpinner();
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
            this.resetCollection(_.bind(function() {
                this.updateCollectionAfterSearch(searchData);
            }, this));
        },

        getDateFromString : function(stringDate, resetTime) {

            var dateWithoutTime = (stringDate.split('-')[0]).trim();
            var dateSplitted    = dateWithoutTime.split('/');
            var newDate         = new Date();

            newDate.setDate(dateSplitted[0]);
            newDate.setMonth(dateSplitted[1] - 1);
            newDate.setYear(dateSplitted[2]);

            if (resetTime) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0)
            }

            return newDate;
        },

        /**
         * Filter collection elements following user typed data
         *
         * @param {Object} searchData user typed data
         */
        updateCollectionAfterSearch: function(searchData) {
            var filteredModels = this.formCollection.filter(_.bind(function(model) {
                for (var name in searchData) {
                    if (name !== 'keywords' && model.get(name) === undefined) {
                        console.warn("ignoring undefined search term \"" + name +"\" for model.");
                        continue;
                    }

                    var searchVal = searchData[name].toLowerCase();
                    //  Special case for keywords
                    // todo better - this searches keywords.join() which is wonky
                    if (name === 'keywords') {
                        if (model.get('keywordsFr').join().toLowerCase().indexOf(searchVal) < 0 &&
                            model.get('keywordsEn').join().toLowerCase().indexOf(searchVal) < 0) {
                            return false;
                        }
                        continue;
                    }

                    var modelVal = model.get(name).toLowerCase();
                    // Special case for name search: do not require strict match
                    if (name === 'name') {
                        if (modelVal.indexOf(searchVal) < 0) {
                            return false;
                        }
                        continue;
                    }

                    // Default case: require strict match
                    if (modelVal != searchVal) {
                        return false;
                    }
                }

                return true;
            }, this));

            this.formCollection.reset(filteredModels);
            this.$el.find('#formsCount').text(
                $.t("formCount.form", { count: filteredModels.length }));
            this.hideSpinner();
        },

        /**
         * Clone current selected form model
         */
        duplicateForm : function() {
            // clone element
            this.formCollection.cloneModel(this.currentSelectedForm);

            //  Update grid ans collection count
            this.grid.render()
            this.$el.find('#formsCount').text(  $.t("formCount.form", { count: this.formCollection.length }) );

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
        editForm : function(ctx, id) {
            if (!ctx || typeof(ctx) !== 'string') {
                // get currentSelectedForm's context
                ctx = this.grid.collection.findWhere({id: this.currentSelectedForm}).get("context");
            }
            window.context = ctx;

            Backbone.Radio.channel('form').trigger('setFieldCollection', ctx);

            // if not provided use this.currentSelectedForm
            if (!id) {
                id = this.currentSelectedForm;
            }

            var formToEdit = this.formCollection.get(id);

            this.globalChannel.trigger('displayEditionPage', formToEdit.toJSON());
            this.showSpinner();
            this.hideContextList();
        },

        /**
         *
         * @param name
         * @param template
         */
        createFormModel : function(name, template) {
            this.homePageChannel.trigger('getTemplate', {name : name, template : template});
        },

        /**
         * Add new form and edit it
         */
        addForm: function() {

            $.getJSON(this.URLOptions.templateUrl, _.bind(function(data) {

                data.unshift({
                    id : 0,
                    name : 'No template'
                });

                $('body').append('<div class="modal fade" id="newFormModal"></div>');

                if (AppConfig.appMode.topcontext != "reneco")
                {
                    // todo test this - or remove probably
                    require(['homePageModule/modals/NewFormModalView'], _.bind(function(NewFormModalView) {
                        var tmpOptions = {
                            el : '#newFormModal',
                            templates : data,
                            onClose : _.bind(function(name, template) {
                                this.createFormModel(name, template);
                            }, this)
                        };

                        var newFormModalView = new NewFormModalView(tmpOptions);

                        newFormModalView.render();
                    }, this));
                }
                else
                {
                    this.createFormModel("", 0);
                }
                this.hideContextList();

            }, this));



        },

        /**
         * Import form
         */
        importForm : function() {

            if ($("body").has("#importModal").length == 0) {
                require([
                    'homePageModule/modals/ImportModalView',
                    'editionPageModule/utilities/Utilities'
                ], _.bind(function(importProtocolModal, Utilities) {

                    $('body').append('<div class="modal fade" id="importModal"></div>');
                    this.importProtocolModalView = new importProtocolModal({
                        el: "#importModal"
                    });

                    this.importProtocolModalView.render();
                    $("#importModal").i18n();

                    $('#importModal').on('hidden.bs.modal', _.bind(function () {
                        var datas = this.importProtocolModalView.getData();
                        if (!datas.closed) {
                            Utilities.ReadFile(datas['file'], _.bind(function (result) {
                                try {
                                    if (result !== false) {

                                        $.ajax({
                                            data        : result,
                                            type        : "POST",
                                            url         : this.options.URLOptions.formSaveURL,
                                            contentType : 'application/json',
                                            //  If you run the server and the back separately but on the same server you need to use crossDomain option
                                            //  The server is already configured to used it
                                            crossDomain : true,

                                            //  Trigger event with ajax result on the formView
                                            success: _.bind(function(data) {
                                                this.resetCollection();
                                                tools.swal("success", "modal.import.success", "modal.import.successMsg");
                                            }, this),
                                            error: _.bind(function(xhr, ajaxOptions, thrownError) {
                                                tools.swal("error", "modal.import.error", "modal.import.errorMsg");
                                            }, this)
                                        });

                                    } else {
                                        tools.swal("error", "modal.import.error", "modal.import.errorMsg");
                                    }
                                } catch (e) {
                                    tools.swal("error", "modal.import.error", "modal.import.errorMsg");
                                }
                            }, this));
                        }

                    }, this));

                }, this));

            }
            else
            {
                this.importProtocolModalView.closed = false;
                this.importProtocolModalView.render();
                $("#importModal").i18n();
            }
        },

        /**
         * Display sweet alter message if the form as been deleted
         */
        displayDeleteSuccessMessage : function() {
            //  I've a bug with sweet-alert
            //  I've to put this swal call in a setTimeout otherwise it doesn't appear
            //  A discussion is opened on Github : https://github.com/t4t5/sweetalert/issues/253
            setTimeout(_.bind(function() {
                this.resetCollection();
                tools.swal("success", "modal.clear.deleted", "modal.clear.formDeleted");
            }, this), 500)
        },

        /**
         * Display sweet alter message can't be deleted
         */
        displayDeleteFailMessage : function() {
            //  Same problem as previous function
            //  A discussion is opened on Github : https://github.com/t4t5/sweetalert/issues/253
            setTimeout(_.bind(function() {
                tools.swal("error", "modal.clear.deleteError", "modal.clear.formDeletedError");
            }, this), 500)
        },

        /**
         * Display a message when the export is finished or failed
         *
         * @param result if the export is right done or not
         */
        displayExportMessage : function(result) {
            if (result) {
                tools.swal("success", "modal.export.success", "");
            } else {
                tools.swal("error", "modal.export.error", "modal.export.errorMsg");
            }
        },

        /**
         * Export form
         *
         * @param e jquery event
         */
        exportForm : function(e) {
            require(['editionPageModule/modals/ExportModalView'], _.bind(function(ExportModalView) {

                var currentForm = this.formCollection.get(this.beforeFormSelection).toJSON();

                //  Add new element for modal view
                $('body').append('<div class="modal  fade" id="exportModal"></div>');

                //  Create view and render it
                var modalView = new ExportModalView({
                    el: "#exportModal",
                    URLOptions: this.URLOptions,
                    formName : currentForm.name
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
                        this.homePageChannel.trigger('export', datas['filename'], currentForm );

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
            tools.swal("error", "modal.duplicate.error", "modal.duplicate.errorMsg");
        },

        /**
         * Display an error message if an error occurred during duplication or save
         */
        displayDuplicateSuccess : function() {
            tools.swal("success", "modal.duplicate.success", "modal.duplicate.successMsg");
        },

        /**
         * addGridColumn inserts a column in this.grid
         * @param name
         * @param i18nKey
         * @param type
         */
        addGridColumn: function(name, i18nKey, type) {
            if (this.grid.columns.findWhere({name: name})) {
                return;
            }

            type = type === undefined ? "string" : type;
            this.grid.columns.add({
               name: name,
               label: translater.getValueFromKey(i18nKey) || i18nKey,
               cell: type,
               editable: false
            }, {at: -2}); // insert column at position -2, which is before the .controls row
            this.updateGridHeader();
        },

        /**
         * removeGridColumn removes column by name in this.grid
         * @param name
         */
        removeGridColumn: function(name) {
            this.grid.columns.remove(this.grid.columns.where({name: name}));
            this.updateGridHeader();
        },

        /**
         * resetGridColumns resets grid default columns.
         */
        resetGridColumns: function() {
            // sort by modification date
            var dateSorter = function(model) {
                return moment(model.get("modificationDate"), "DD/MM/YYYY - hh:mm:ss").unix();
            };
            var defaults = [{
                name  : 'name',
                label    : translater.getValueFromKey('grid.name') || 'Name',
                cell  : 'string',
                editable : false
            }, {
                name     : 'creationDateDisplay',
                label    : translater.getValueFromKey('grid.creationDate') || 'Creation Date',
                cell     : "string",
                editable : false,
                sortValue: dateSorter
            }, {
                name     : 'modificationDateDisplay',
                label    : translater.getValueFromKey('grid.modificationDate') || 'Modification date',
                cell     : 'string',
                editable : false,
                sortValue: dateSorter
            }, {
                name     : 'context',
                label    : translater.getValueFromKey('grid.formContext') || 'Form Context',
                cell     : 'string',
                editable : false
            }, {
                name     : 'controls',
                label    : '',
                cell     : 'string',
                editable : false,
                sortable : false
            }];

            this.grid.columns.set(defaults);
            this.updateGridHeader();
        },

        /**
         * setContext updates relevant parts depending on context value.
         * @param context
         */
        setContext: function(context) {
            context = context.toLowerCase();
            window.context = context;
            this.currentTemplate.params.context = context;
            this.updateTemplate();

            this.formCollection.update({
                url: this.URLOptions.forms,
                context: context
            });

            // update custom columns
            this.resetGridColumns();
            if (context !== "all") {
                this.removeGridColumn('context');
            }
            switch(context) {
                case "track":
                    this.addGridColumn('activite', 'form.activite');
                    break;
            }

            // retreive and populate custom search inputs
            this.gridChannel.trigger('contextChanged', context);
        },

        /**
         * setCenterGridPanel
         * @param context
         * @param avoidRendering
         */
        setCenterGridPanel : function(context, avoidRendering)
        {
            this.setContext(context);
            this.currentSelectedForm = -1;
            this.clearFooterAction();

            if (!avoidRendering) {
                this.render();
            }
        },

        /**
         * hideContextList hides context list (!)
         */
        hideContextList : function() {
            $("#contextSwitcher").removeClass("expand");
        },
    });

    return CenterGridPanelView;

});
