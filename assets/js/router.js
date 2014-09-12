/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'views/editViews', 'models/collection', 'NS.UI.Navbar'], 
    function($, _, Backbone, MainView, editViews, collection){

    var AppRouter = Backbone.Router.extend({

        routes : {
            ""              : 'home',
            'saveprotocol'  : 'saveProtocol',
            'setting/:id'   : 'modelSetting',
        },

        initialize : function(formbuilderInstanceRef) {

            window.location.hash = '#';
            //  Keep formbuilder object references
            this.formbuilderInstanceRef = formbuilderInstanceRef;

            // Init current protocol collection
            this.formbuilderInstanceRef.currentCollection = new collection({}, { name : "My protocol" });

            //  Init main view

            this.formbuilderInstanceRef.mainView = new MainView({
                el   : '#formBuilder',
                form : this.formbuilderInstanceRef.currentCollection,
                URLOptions :  formbuilderInstanceRef.URLOptions
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

            require(['backbone-forms', "backbone-forms-list", 'modalAdapter'], _.bind(function() {

                var field = this.formbuilderInstanceRef.currentCollection.models[modelID];

                var form = new Backbone.Form({
                    model : field,
                }).render();
                $('.settings').append(form.el)

                $('.dropArea').switchClass('span9', 'span7', 500);
                $('.widgetsPanel').switchClass('span3', 'span0', 500);

                this.formbuilderInstanceRef.navbar.setActions ({
                    save : new NS.UI.NavBar.Action({
                        title        : 'Save changes',
                        allowedRoles : ["reader"],
                        handler      : _.bind(function() {

                            $('.dropArea').switchClass('span7', 'span9', 500);
                            $('.widgetsPanel').switchClass('span0', 'span3', 500);
                            window.location.hash = "#";

                            field.set(form.getValue())
                            form.remove();
                        }, this)
                    })
                });

            }, this));
        }

    });

    return AppRouter;
});