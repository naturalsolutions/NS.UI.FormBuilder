define([
    "jquery", "backbone", "marionette",
    "homePageModule/layout/HomePageLayout", "editionPageModule/layout/EditionPageLayout",
    "editionPageModule/collection/FieldCollection", "homePageModule/models/FormModel",
    './Translater', "tools", "app-config"
], function($, Backbone, Marionette, HomePageLayout, EditionPageLayout,
            FieldCollection, FormModel,
            translater, tools, AppConfig) {

    var fbController = {
        init: function() {
            this.spawnContexts();
            this.firstEdit = true;

            this.linkedFieldsList = this.getLinkedFieldsList();
            this.editPageLayout.linkedFieldsList = this.linkedFieldsList;
            this.homeRegion.show(this.homePageLayout);
            this.centerPanel = this.homePageLayout.getRegion("centerPanel").currentView;
        },

        home: function(context) {
            this.editMode = false;

            if (!context || !this.contexts[context]) {
                Backbone.history.navigate('#' + this.defaultContext, {trigger: true, replace: true});
                return;
            }
            this.backHash = Backbone.history.location.hash;
            this.showLeftRegion();

            // trick with this.loading, avoid double rendering:
            // on first call because it breaks click events on forms grid for some reason.
            this.setContext(context);
        },

        edit: function(context, id) {
            this.editMode = true;

            // update window.context, cause it's used somewhere for extraProperties I think
            // todo, remove the window.context mechanics at some point
            window.context = context;
            // update field collection's context
            this.setFieldCollection(context);
            this.loadForm(id);
        },

        back: function(context, refresh) {
            var hash;
            if (this.backHash) {
                hash = this.backHash;
            } else {
                hash = "#" + this.defaultContext;
            }
            Backbone.history.navigate(hash, {
                trigger: true,
                replace: true
            });

            if (refresh === 'true') {
                Backbone.Radio.channel('grid').trigger('refresh');
            }
        },

        setContext: function(context) {
            if (this.homeContext === context) {
                return;
            }
            this.homeContext = context;

            this.$contextSwitcher.find(".selected").text(context);
            this.$contextSwitcher.find(".hide").removeClass("hide");
            this.contexts[context].addClass("hide");
            this.centerPanel.setContext(context);
        },

        setFieldCollection: function(context) {
            if (this.editContext === context) {
                return;
            }
            this.editContext = context;
            this.fieldCollection =
                new FieldCollection({}, {
                    name         : 'New form',
                    url          : AppConfig.config.options.URLOptions['formSaveURL'] + "/" + context,
                    context      : context,
                    URLOptions   : AppConfig.config.options.URLOptions
                });
            this.fieldCollection.linkedFieldsList = this.linkedFieldsList;
            this.editPageLayout.fieldCollection = this.fieldCollection;
            this.editPageLayout.formPanel.updateCollection(this.fieldCollection);
        },

        spawnContexts: function() {
            this.$contextSwitcher = $("#contextSwitcher");
            this.contexts = {};

            var addContext = _.bind(function(name) {
                name = name.toLowerCase();
                if (name != "topcontext" && !this.contexts[name]) {
                    var $el = $("<div class='context'>"+name+"</div>");
                    this.$contextSwitcher.append($el);
                    this.contexts[name] = $el;
                }
            }, this);

            this.defaultContext = "all";
            addContext(this.defaultContext);
            $.each(AppConfig.contexts, addContext);

            var nbContexts = Object.keys(this.contexts).length - 1;
            if (nbContexts == 1) {
                // replace "All" context with actual context
                var ctx = this.$contextSwitcher.find(".context").text();
                this.defaultContext = ctx;
                this.$contextSwitcher.find(".selected").text(ctx);
                Backbone.history.navigate('#' + ctx, {trigger: true});
            } else if (nbContexts > 1) {
                // enable multi-context
                this.$contextSwitcher.removeClass("single");
                var that = this;

                // Expand context switcher
                this.$contextSwitcher.click(function(e) {
                    // only allow context-switching on home page
                    if (!that.editMode) {
                        $(this).toggleClass("expand");
                    }
                });

                // Swap contexts
                this.$contextSwitcher.find(".context").click(function(e) {
                    Backbone.history.navigate('#' + $(e.delegateTarget).text(), {trigger: true});
                });
            }
        },

        getLinkedFieldsList : function() {
            var linkedFields = {};
            $.ajax({
                type: 'GET',
                url: this.URLOptions.linkedFields,
                contentType: 'application/json',
                crossDomain: true,
                async: false,
                success: _.bind(function(data) {
                    linkedFields = data;
                }, this),
                error: _.bind(function(xhr) {
                    console.error("error fetching linked fields at '",
                        this.URLOptions.linkedFields + "': " + xhr.status + " " + xhr.statusCode);
                }, this)
            });
            return linkedFields;
        },

        loadForm: function(id) {
            if (this.loadingForm) return;
            this.showSpinner();
            this.loadingForm = true;
            var loadError = _.bind(function(err) {
                this.hideSpinner();
                switch (err.status) {
                    case 404:
                        tools.swal("error", "fetchOne.notFound", "fetchOne.notFoundMsg");
                        break;
                    default:
                        tools.swal("error", "fetchOne.error", "fetchOne.errorMsg");
                        console.error("fetch error", err);
                        break;
                }
                this.loadingForm = false;
                this.back();
            }, this);

            if (id === 'new') {
                var newForm = new FormModel({
                    id: 0,
                    name: translater.getValueFromKey('modal.newForm.title')
                });
                this.displayForm(newForm.toJSON());
            } else {
                $.ajax({
                    url: AppConfig.config.options.URLOptions.forms + '/' + id,
                    dataType: 'json',
                    success: _.bind(function (data) {
                        this.displayForm(data);
                    }, this),
                    error: _.bind(function (error) {
                        loadError(error);
                    }, this)
                });
            }
        },

        displayForm: function(jsonForm) {
            this.fieldCollection.updateWithJSON(jsonForm);
            this.editPageLayout.update(this.fieldCollection);
            if (this.firstEdit) {
                this.editRegion.show(this.editPageLayout);
            } else {
                this.editPageLayout.render();
            }
            this.firstEdit = undefined;

            // notify loading is happening
            this.hideSpinner();
            this.showRightRegion();

            // wait before animation is done (& some), or the user can fuck us
            // while animation is playing. Double form loading is not cool.
            setTimeout(_.bind(function() {
                this.loadingForm = false;
                // twice is better than one :)
                this.hideSpinner();
            }, this), 1000);
        },

        showLeftRegion: function() {
            $('#leftSection').css('visibility', "visible");
            $('#mainRegion').animate({
                marginLeft : '0%'
            }, 750, _.bind(function() {
                $('#rightSection').css('visibility', "hidden");
            }, this));
            $(".headerWhiteArrow").css("width", "");
        },

        showRightRegion: function() {
            $('#rightSection').css('visibility', "visible");
            $('#mainRegion').animate({
                marginLeft : '-100%'
            }, 750, function() {
                $('#leftSection').css('visibility', "hidden");
            });
        },

        hideSpinner : function() {
            $('.spinner').removeClass("hijacked").addClass("end", 250);
        },

        showSpinner : function() {
            $('.spinner').addClass("hijacked").removeClass('end');
        }
    };

    return Marionette.AppRouter.extend({
        initialize: function(homeRegion, editRegion) {
            // init home page region & layout
            this.controller.homePageLayout = new HomePageLayout({
                URLOptions : AppConfig.config.options.URLOptions
            });
            this.controller.homeRegion = homeRegion;

            // init edition page region & layout
            this.controller.URLOptions = AppConfig.config.options.URLOptions;
            this.controller.fieldCollection = new FieldCollection({}, {
                name         : 'New form',
                url          : this.controller.URLOptions['formSaveURL'],
                context      : "all",
                URLOptions   : this.controller.URLOptions
            });
            this.controller.editPageLayout = new EditionPageLayout({
                fieldCollection: this.controller.fieldCollection,
                URLOptions: this.controller.URLOptions,
                linkedFieldsList: AppConfig.config.options.linkedFieldsList
            });
            this.controller.editRegion = editRegion;

            // init stuff on controller
            this.controller.init();
        },

        appRoutes: {
            'back(/:context/:refresh)': 'back',
            '(:context)(/:refresh)': 'home',
            'form/:context/:id': 'edit'
        },

        controller: fbController
    });
});
