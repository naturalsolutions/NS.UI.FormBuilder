define([
    'jquery', 'lodash', 'marionette', 'auth', 'i18n'
], function($, _, Marionette, auth) {

    var Translater = Marionette.Object.extend({

        initialize: function(options) {
            this.url = 'ressources/locales/__lng__/__ns__.json';
            this.initi18n();
        },

        initi18n : function() {
            i18n.init({ resGetPath: this.url, getAsync : false, lng : navigator.language || navigator.userLanguagenavigator.language || navigator.userLanguage});
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
