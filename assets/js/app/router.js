
define(
    ['jquery', 'underscore', 'backbone', 'app/views/mainViews', 'app/views/editViews', 'app/models/collection', 'NS.UI.Navbar'], 
    function($, _, Backbone, mainViews, editViews, collection){

    var AppRouter = Backbone.Router.extend({
        routes : {
            ""              : 'home',
            'saveprotocol'  : 'saveProtocol',
            'setting/:id'   : 'modelSetting',
            'generate'      : 'generate',
            'option/:id'    : 'simpleSetting'
        },

        initialize : function(formbuilderInstanceRef) {

            window.location.hash = '#';
            //  Keep formbuilder object references
            this.formbuilderInstanceRef = formbuilderInstanceRef;

            // Init current protocol collection
            this.formbuilderInstanceRef.currentCollection = new collection({}, { name : "My protocol" });

            //  Init main view
            this.formbuilderInstanceRef.mainView = new mainViews.MainView({
                el   : '#formBuilder',
                form : this.formbuilderInstanceRef.currentCollection
            });
            this.formbuilderInstanceRef.mainView.render();

            var user = {
                anonymous   : {roles: ['reader']},
                roger       : {nickname: 'Roger', roles: ['reader', 'writer']},
                gaston      : {nickname: 'Gaston', roles: ['reader', 'writer', 'moderator']}
            };
            var tiles= [
                {title: 'Home', tileClass: 'tile-home', url: '#', allowedRoles: ['reader']},
                {title: 'Forum', tileClass: 'tile-forum', url: '#forum', allowedRoles: ['reader']},
                {title: 'Administration', tileClass: 'tile-admin tile-double', url: '#admin', allowedRoles: ['moderator']}
            ]

            //  Init navbar
            this.formbuilderInstanceRef.navbar = new NS.UI.NavBar({
                roles       : user.gaston.roles,
                username    : user.gaston.nickname,
                title       : 'Form Builder'
            });

            this.formbuilderInstanceRef.navbar.$el.prependTo('body');
            this.formbuilderInstanceRef.navbar.render();

            i18n.init({
                resGetPath: 'ressources/locales/__lng__/__ns__.json'
            },function(t) {
                $("body").i18n();
            });
        },

        home : function() {
            this.formbuilderInstanceRef.navbar.setActions (this.formbuilderInstanceRef.mainView.getActions());
        },

        modelSetting : function(modelID) {

            if (this.formbuilderInstanceRef.currentCollection.length === 1) {
                window.location.hash = '';
            } else {
                if (this.formbuilderInstanceRef.settingView === undefined) {

                    //  Create new edit view
                    this.formbuilderInstanceRef.settingView = new editViews.BaseEditView({
                        el: '.settings',
                        model : this.formbuilderInstanceRef.currentCollection.models[modelID]
                    });
                    this.formbuilderInstanceRef.settingView.render();

                } else {

                    this.formbuilderInstanceRef.settingView.remove();
                    this.formbuilderInstanceRef.settingView.unbind();

                    $('.dropArea').after('<div class="span5 settings"></div>');

                    this.formbuilderInstanceRef.settingView = new editViews.BaseEditView({
                        el: '.settings',
                        model : this.formbuilderInstanceRef.currentCollection.models[modelID]
                    });
                    this.formbuilderInstanceRef.settingView.render();

                }

                this.formbuilderInstanceRef.navbar.setActions (this.formbuilderInstanceRef.settingView.getActions());
            }
        }
    });

    return AppRouter
});

/*var formBuilder = (function(app) {

    app.Router = Backbone.Router.extend({

        routes : {
            ""              : 'home',
            'saveprotocol'  : 'saveProtocol',
            'setting/:id'   : 'modelSetting',
            'generate'      : 'generate',
            'option/:id'    : 'simpleSetting'
        },

        initialize : function() {
            //  Init current protocol object
            app.instances.currentForm = new app.collections.Form( {}, { name: "My protocol" });
            //  Init main view
            app.instances.mainView = new app.views.MainView({
                el      : '#formBuilder',
                form    : app.instances.currentForm
            });
        },

        home : function() {
            app.instances.navbar.setActions (app.instances.mainView.getActions());
            i18n.init(function(t) {
                $("body").i18n();
            });
        },

        saveProtocol : function (options) {
        },

        simpleSetting : function(modelID) {
            if (app.instances.currentForm.length === 1) {
                window.location.hash = '';
            } else {
                if (app.instances.settingView === undefined) {

                    //  Create new edit view
                    app.instances.settingView = new app.views[app.instances.currentForm.get(modelID).constructor.type + 'FieldEditView']({
                        el: '.settings',
                        model : app.instances.currentForm.models[modelID]
                    });
                    app.instances.settingView.render();

                } else {
                    app.instances.settingView.remove();
                    app.instances.settingView.unbind();

                    $('.dropArea').after('<div class="span5 settings"></div>');

                    app.instances.settingView = new app.views[app.instances.currentForm.get(modelID).constructor.type + 'FieldEditView']({
                        el: '.settings',
                        model : app.instances.currentForm.models[modelID]
                    });
                    app.instances.settingView.render();
                }

                app.instances.navbar.setActions (app.instances.settingView.getActions());
            }
        },

        modelSetting : function(modelID) {
            if (app.instances.currentForm.length === 1) {
                window.location.hash = '';
            } else {
                if (app.instances.settingView === undefined) {
                    //  Create new edit view
                    app.instances.settingView = new app.views.BaseEditView({
                        el: '.settings',
                        model : app.instances.currentForm.models[modelID]
                    });
                    app.instances.settingView.render();
                } else {
                    app.instances.settingView.remove();
                    app.instances.settingView.unbind();

                    $('.dropArea').after('<div class="span5 settings"></div>');

                    app.instances.settingView = new app.views.BaseEditView({
                        el: '.settings',
                        model : app.instances.currentForm.models[modelID]
                    });
                    app.instances.settingView.render();
                }

                app.instances.navbar.setActions (app.instances.settingView.getActions());
            }
        }
    });

    return app;

})(formBuilder);*/