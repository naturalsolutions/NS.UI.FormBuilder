define([
    'jquery', 'lodash', 'marionette', 'auth', 'i18n'
], function($, _, Marionette, auth) {

    var Translater = Marionette.Object.extend({

        initialize: function() {
            this.url = 'ressources/locales/__lng__/__ns__.json';
            var lang = auth.userlanguage ||navigator.language ||
                navigator.userLanguagenavigator.language ||
                navigator.userLanguage || 'en';
            i18n.init({ resGetPath: this.url, getAsync : false, lng : lang});
        },

        getValueFromKey : function(key) {
            return $.t(key);
        }
    });

    var translater = new Translater();

    return {
        getTranslater: function (options) { return translater; }
    };

});
