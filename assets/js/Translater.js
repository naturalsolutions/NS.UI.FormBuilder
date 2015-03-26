define([
    'jquery', 'underscore', 'marionette', 'i18n'
], function($, _, Marionette, Radio) {

    var Translater = Marionette.Object.extend({

        initialize: function(options) {
            this.url = 'ressources/locales/__lng__/__ns__.json';
            this.initi18n();
        },

        initi18n : function() {
            i18n.init({ resGetPath: this.url, getAsync : false, lng : 'fr'});
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
