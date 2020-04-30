
require.config({

    paths: {
        backbone                            : "../../node_modules/backbone/backbone",
        blobjs                              : "../../node_modules/blobjs/Blob.min",
        bootstrap                           : "../../node_modules/bootstrap/dist/js/bootstrap.min",
        fancytree                           : "../../node_modules/jquery.fancytree/dist/modules/jquery.fancytree",
        "jquery.fancytree.ui-deps"          : "../../node_modules/jquery.fancytree/dist/modules/jquery.fancytree.ui-deps",
        filesaver                           : "../../node_modules/file-saver/FileSaver.min",
        i18n                                : "../../node_modules/i18next/i18next.min",
        "i18n-xhr"                          : "../../node_modules/i18next-xhr-backend/i18nextXHRBackend.min",
        "i18n-jquery"                       : "../../node_modules/jquery-i18next/dist/umd/jquery-i18next.min",
        jquery                              : "../../node_modules/jquery/dist/jquery.min",
        "jquery-ui"                         : "../../node_modules/jquery-ui-dist/jquery-ui.min",
        requirejs                           : "../../node_modules/requirejs/require",
        "backbone-forms"                    : "../../node_modules/backbone-forms/distribution.amd/backbone-forms.min",
        "backbone.radio"                    : "../../node_modules/backbone.radio/build/backbone.radio.min",
        sweetalert                          : "../../node_modules/sweetalert/dist/sweetalert.min",
        marionette                          : '../../node_modules/backbone.marionette/lib/backbone.marionette.min',
        backgrid                            : '../../node_modules/backgrid/lib/backgrid.min',
        moment                              : '../../node_modules/moment/moment',
        slimScroll                          : '../../node_modules/jquery-slimScroll/jquery.slimscroll.min',
        'lodash'                            : '../../node_modules/lodash/index',
        'text'                              : '../../node_modules/text/text',
        'tools'                             : './tools',
        'vue'                               : '../../node_modules/vue/dist/vue',
        'oauth2'                            : './oauth2',
    },

    map: {
        "*": {
            "underscore": "lodash"
        }
    }
});

define([
    'jquery', 'lodash', 'backbone', 'Translater', 'app-config'
], function($, _, Backbone, Translater, AppConfig) {

    require(['jquery', 'Translater', 'formbuilder', 'moment', 'lodash'], function($, Translater, formbuilder) {
        formbuilder.start(AppConfig.config.options);
    });
});
