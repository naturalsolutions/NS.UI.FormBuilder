define([
    'jquery', 'lodash', 'marionette', 'auth', 'i18n', 'i18n-jquery', 'i18n-xhr'
], function($, _, Marionette, auth, i18n, i18njQuery, i18nXhr) {

    var Translater = Marionette.Object.extend({
        loaded: false,
        initialize: function() {
            var lang = auth.userlanguage ||navigator.language ||
                navigator.userLanguagenavigator.language ||
                navigator.userLanguage || 'en';

            i18n.use(i18nXhr);
            i18n.init({
                lng : lang,
                fallbackLng: 'en',
                async: false,
                getAsync: false,
                backend: {
                    loadPath: 'ressources/locales/{{lng}}/{{ns}}.json'
                }
            }, _.bind(function() {
                i18njQuery.init(i18n, $, {
                    tName: 't',
                    handleName: 'i18n',
                    selector: 'data-i18n'
                });
                this.loaded = true;
            }, this));
        },

        getValueFromKey : function(key) {
            return $.t(key);
        }
    });

    var translater = new Translater();

    return {
        getTranslater: function () { return translater; }
    };

});
