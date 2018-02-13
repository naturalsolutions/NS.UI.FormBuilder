define([
    'jquery',
    'lodash',
    'backbone',
    'marionette',
    'moment',
    'text!../templates/GridView.html',
    'text!../templates/RowControls.html',
    'backgrid',
    '../../Translater',
    '../models/FormModel',
    'backbone.radio',
    'sweetalert',
    'app-config',
    'tools',
    'slimScroll'
    ], function($, _, Backbone, Marionette, moment, GridView, RowControls, Backgrid, translater,
                FormModel, Radio, sweetalert, AppConfig, tools) {

    /**
     * Main view in the homepage layout
     * This view contains backgrid element displaying collection element
     */
    var CenterGridPanelView = Backbone.Marionette.View.extend({
        events : {
            'click #add': 'addForm'
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
          this.template = function() {
              return _.template(tpl.html)(tpl.params);
          };
        },

        initialize : function(options, readonly) {
            _.bindAll(this, 'updateGridWithSearch', 'deleteForm', 'deleteFormPopup');
            this.URLOptions = options.URLOptions;
            this.initGridChannel();
            var context = $("#contextSwitcher .selected").text().toLowerCase();
            this.context = context;

            // init formCollection
            this.formCollection = new Backbone.Collection(null, {
                model: FormModel
            });
            this.formCollection.url = this.URLOptions.forms + '/' + this.context;

            // init grid & template
            this.initGrid();
            this.initTemplate(
                GridView,
                context,
                AppConfig.topcontext,
                readonly);
        },

        initGridChannel : function() {
            this.gridChannel = Backbone.Radio.channel('grid');

            //  This event is send form the leftPanelView (see leftPanelView.js in views folder) when a user want to filter the grid via a form
            //  When the event is received we update grid data correspondig to the search
            this.gridChannel.on('search', this.updateGridWithSearch);

            //  Event send from LeftPanelView when user cleared search form
            //  We reset tje collection and update forms count
            this.gridChannel.on('resetCollection', this.resetCollection, this);
        },

        deleteFormPopup : function(form) {
            var currentForm = form.toJSON();

            // todo restore this feature (form weight)
            var weight;
            if (currentForm.context == "track")
            {
                $.ajax({
                    data: {},
                    type: 'GET',
                    url: this.URLOptions.trackFormWeight + "WFBID/" + currentForm.id,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: _.bind(function (data) {
                        weight = JSON.parse(data);
                    }, this),
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                    }, this)
                });
            }

            var swalOpts = {
                buttons: {
                    cancel: translater.getValueFromKey('modal.clear.no'),
                    obsolete: {
                        text: translater.getValueFromKey('modal.clear.obsolete'),
                        value: "obsolete"
                    },
                    confirm: {
                        text: translater.getValueFromKey('modal.clear.yes'),
                        value: true,
                        className: "danger"
                    }
                }
            };

            tools.swal("warning",
                "modal.clear.title",
                "modal.clear.text",
                swalOpts,
                null,
                _.bind(function(confirm) {
                    if (confirm === 'obsolete') {
                        this.makeObsolete(currentForm);
                    } else if (confirm) {
                        this.deleteForm(currentForm);
                    }
                }, this)
            );
        },

        deleteForm: function(form) {
            this.showSpinner();
            $.ajax({
                type: 'DELETE',
                url: this.URLOptions.forms + "/" + form.id,
                success: _.bind(function () {
                    // refresh forms list for childForm
                    tools.loadForms(form.context, false, true);

                    tools.swal("success", "modal.clear.deleted", "modal.clear.formDeleted");
                    this.hideSpinner();
                    this.resetCollection();
                }, this),
                error: _.bind(function (err) {
                    console.error(err);
                    tools.swal("error", "modal.clear.deleteError", "modal.clear.formDeletedError");
                    this.hideSpinner();
                    this.resetCollection();
                }, this)
            });
        },

        makeObsolete : function(form) {
            this.showSpinner();
            $.ajax({
                data: {},
                type: 'PUT',
                url: this.URLOptions.makeObsolete + "/" + form.id,
                contentType: 'application/json',
                crossDomain: true,
                success: _.bind(function (data) {
                    this.hideSpinner();
                    tools.swal("success", "modal.makeObs.success", "modal.makeObs.successMsg");
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    this.hideSpinner();
                    console.log("Ajax Error: " + xhr, ajaxOptions, thrownError);
                }, this)
            });
        },

        initGrid : function() {
            // only once
            if (this.grid) {
                return;
            }

            var that = this;
            this.grid = new Backgrid.Grid({
                collection : this.formCollection,
                row: Backgrid.Row.extend({
                    events: {
                        "click": "editForm"
                    },
                    editForm: function(e) {
                        that.editForm(this.model.get('context'), this.model.get('id'));
                    }
                })
            });
            this.resetGridColumns();
        },

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

        onRender: function() {
            // insert grid
            $(this.el).find("#grid").html(this.grid.render().el);

            // translate stuff
            this.$el.i18n();
        },

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

        hideSpinner : function() {
            var $spinner = this.$el.find('.spinner');
            if (!$spinner.hasClass("hijacked")) {
                this.$el.find('.spinner').addClass('end', 250);
            }
        },

        showSpinner : function() {
            var $spinner = this.$el.find('.spinner');
            if (!$spinner.hasClass("hijacked")) {
                this.$el.find('.spinner').removeClass('end');
            }
        },

        resetCollection : function(callback) {
            this.showSpinner();
            this.formCollection.reset();
            this.formCollection.fetch({
                reset : true,
                success : _.bind(function() {
                    this.$el.find('#formsCount').text(  $.t("formCount.form", { count: this.formCollection.length }) );
                    this.updateRecentlyEdited();
                    if (callback) {
                        callback();
                    }
                    this.hideSpinner();

                    // re-init slimScroll
                    $(".scroller")
                        .slimScroll({destroy: true})
                        .slimScroll({
                            height: '100%',
                            color: '#111',
                            railVisible: true,
                            alwaysVisible: true
                        });
                }, this),
                error: _.bind(function() {
                    tools.swal("error", "fetch.error", "fetch.errorMsg");
                    this.hideSpinner();
                }, this)
            });
        },

        updateGridWithSearch : function(searchData) {
            this.showSpinner();
            this.resetCollection(_.bind(function() {
                this.updateCollectionAfterSearch(searchData);
            }, this));
        },

        updateCollectionAfterSearch: function(searchData) {
            var filteredModels = this.formCollection.filter(_.bind(function(model) {
                for (var name in searchData) {
                    if (name !== 'keywords' && typeof(model.get(name)) !== 'string') {
                        console.warn("ignoring undefined search term \"" + name +"\" for model.");
                        continue;
                    }

                    var searchVal = searchData[name].toLowerCase();

                    //  Special case for keywords: no strict match on all translations
                    if (name === 'keywords') {
                        var translations = model.get('translations');
                        var found = false;
                        for (var i in translations) {
                            var t = translations[i];
                            if (t && t.Keywords && t.Keywords.toLowerCase().indexOf(searchVal) >= 0) {
                                found = true;
                                break;
                            }
                        }

                        if (found) {
                            continue;
                        }
                        return false;
                    }

                    var modelVal = model.get(name).toLowerCase();
                    // Special case for name search: do not require strict match
                    if (name === 'name') {
                        if (modelVal.indexOf(searchVal) >= 0) {
                            continue;
                        }
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

        addForm: function() {
            this.editForm(this.context, 'new');
        },

        editForm : function(ctx, id) {
            this.hideContextList();
            Backbone.history.navigate('#form/' + ctx + "/" + id, {trigger: true});
        },

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

        removeGridColumn: function(name) {
            this.grid.columns.remove(this.grid.columns.where({name: name}));
            this.updateGridHeader();
        },

        resetGridColumns: function() {
            // sort by modification date
            var dateSorter = function(model) {
                return moment(model.get("modificationDate"), "DD/MM/YYYY - hh:mm:ss").unix();
            };
            var that = this;
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
                editable : false,
                sortable : false,
                cell: Backgrid.Cell.extend({
                    className: 'controls',
                    render: function () {
                        this.$el.html(RowControls);
                        this.$el.find(".btnTrash").on("click", _.bind(function(e) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            that.deleteFormPopup(this.model);
                        }, this));
                        return this;
                    }
                })
            }];

            this.grid.columns.set(defaults);
        },

        setContext: function(context) {
            context = context.toLowerCase();
            window.context = context;
            this.context = context;
            this.currentTemplate.params.context = context;
            this.updateTemplate();
            this.$el.html(this.template());

            this.formCollection.url = this.URLOptions.forms + '/' + this.context;

            // retreive and populate custom search inputs
            this.gridChannel.trigger('contextChanged', context);

            // run search & update grid display
            this.resetCollection(_.bind(function() {
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

                // re-render grid
                $(this.el).find("#grid").html(this.grid.render().el);
                this.updateGridHeader();
            }, this));
        },

        hideContextList : function() {
            $("#contextSwitcher").removeClass("expand");
        }
    });

    return CenterGridPanelView;

});
