/**
 * @fileOverview formBuilder.js
 * Implemente main formbuilder object
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
var formBuilder = (function(app) {

    app = {
        views       : {},
        models      : {},
        collections : {},
        instances   : {
            user : {
                anonymous   : {roles: ['reader']},
                roger       : {nickname: 'Roger', roles: ['reader', 'writer']},
                gaston      : {nickname: 'Gaston', roles: ['reader', 'writer', 'moderator']}
            },
            tiles: [
                {title: 'Home', tileClass: 'tile-home', url: '#', allowedRoles: ['reader']},
                {title: 'Forum', tileClass: 'tile-forum', url: '#forum', allowedRoles: ['reader']},
                {title: 'Administration', tileClass: 'tile-admin tile-double', url: '#admin', allowedRoles: ['moderator']}
            ]
        },
        utilities   : {},

        init : function(options) {

            app.instances.autocompleteURL = options.autocompleteURL || 'autocomplete/';
            app.instances.translationURL  = options.translationURL  || 'locales/';

            app.instances.keywordAutocomplete  = options.keywordAutocomplete  || 'autocomplete/keywords.json';
            app.instances.protocolAutocomplete = options.protocolAutocomplete || 'autocomplete/protocols.json';

            app.instances.unitURL = options.unitURL || 'autocomplete/units.json';

            app.instances.router = new app.Router();

            app.instances.navbar = new NS.UI.NavBar({
                roles       : app.instances.user.gaston.roles,
                username    : app.instances.user.gaston.nickname,
                title       : 'Form Builder'
            });

            app.instances.navbar.$el.prependTo('body');
            app.instances.navbar.render();

            Backbone.history.start();
        }
    };

    return app;

})(formBuilder);