define([
    "jquery", "backbone", "marionette",
    "homePageModule/layout/HomePageLayout", "editionPageModule/layout/EditionPageLayout",
    "editionPageModule/collection/FieldCollection", "homePageModule/models/FormModel",
    './Translater', "tools", "app-config"
], function($, Backbone, Marionette, HomePageLayout, EditionPageLayout,
            FieldCollection, FormModel,
            Translater, tools, AppConfig) {

    var translater = Translater.getTranslater();

    var Controller = Marionette.Controller.extend({
        init: function() {
            this.spawnContexts();
            this.firstHome = true;
            this.firstEdit = true;

            this.linkedFieldsList = this.getLinkedFieldsList();
            this.editPageLayout.linkedFieldsList = this.linkedFieldsList;
            this.homeRegion.show(this.homePageLayout);
            this.centerPanel = this.homePageLayout.centerPanel.currentView;
        },

        home: function(context) {
            if (!context || !this.contexts[context]) {
                Backbone.history.navigate('#' + this.defaultContext, {trigger: true});
                return;
            }
            this.backHash = Backbone.history.location.hash;
            this.showLeftRegion();

            // trick with this.loading, avoid double rendering:
            // on first call because it breaks click events on forms grid for some reason.
            this.setContext(context, this.firstHome);
            this.firstHome = undefined;
        },

        edit: function(context, id) {
            // update field collection's context
            this.setFieldCollection(context);
            this.loadForm(id);
        },

        back: function(context, refresh) {
            var hash;
            if (this.backHash) {
                hash = this.backHash;
            } else if (context) {
                hash = "#" + context;
            } else {
                hash = "#" + this.defaultContext;
            }
            Backbone.history.navigate(hash, {trigger: true});

            if (refresh === 'true') {
                Backbone.Radio.channel('grid').trigger('refresh');
            }
        },

        setContext: function(context, skipRender) {
            if (this.homeContext === context) {
                return;
            }
            this.homeContext = context;

            this.$contextSwitcher.find(".selected").text(context);
            this.$contextSwitcher.find(".hide").removeClass("hide");
            this.contexts[context].addClass("hide");
            this.centerPanel.setContext(context, skipRender);
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

                // Expand context switcher
                this.$contextSwitcher.click(function(e) {
                    // disable context-switching in edition page
                    if (window.location.hash.indexOf('#edit') == 0) {
                        return;
                    }
                    $(this).toggleClass("expand");
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
                tools.swal("error", "fetchOne.error", "fetchOne.errorMsg");
                console.error("fetch error", err);
                this.loadingForm = false;
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
                        // it so happens that backend is happy with non-existing id
                        // and sends us an empty data stuff, so this workaround says fuck
                        // to user anyway. todo fix backend
                        if (!data || !data['form']) {
                            loadError("backend shoulda tell me there's a problem :/ it did not");
                            return;
                        }

                        this.displayForm(data['form']);
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
                $('#navbarContext').text($.t('navbar.context.home'));
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
    });

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

        controller: new Controller()
    });
});
