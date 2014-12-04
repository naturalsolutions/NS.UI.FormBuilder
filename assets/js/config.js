/**
 * @fileOverview config.js
 *
 * RequireJS configuration file
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

require.config({
    paths: {
        backbone               : "../../libs/backbone/backbone",
        blobjs                 : "../../libs/blobjs/Blob",
        bootstrap              : "../../libs/bootstrap/dist/js/bootstrap",
        fancytree              : "../../libs/fancytree/dist/jquery.fancytree-all.min",
        filesaver              : "../../libs/filesaver/FileSaver",
        i18n                   : "../../libs/i18n/i18next",
        jquery                 : "../../libs/jquery/dist/jquery",
        "jquery-ui"            : "../../libs/jquery-ui/jquery-ui",
        underscore             : "../../libs/underscore/underscore",
        requirejs              : "../../libs/requirejs/require",
        "backbone-forms"       : "../../libs/backbone-forms/distribution.amd/backbone-forms",
        modalAdapter           : "../../libs/bootstrapAdapter/src/backbone.bootstrap-modal",
        "backbone-forms-list"  : "../../libs/backbone-forms/distribution.amd/editors/list.min",
        bootstrapTemplate      : "../../libs/backbone-forms/distribution/templates/bootstrap3",
        bootstrapAdapter       : "../../libs/bootstrapAdapter/index",
        typeahead              : "../../libs/typeahead/bootstrap3-typeahead",
        "backbone.radio"       : "../../libs/backbone.radio/build/backbone.radio",
        fuelux                 : "../../libs/fuelux/dist/js/fuelux",
        difflib                : "../../libs/jsdifflib/difflib",
        diffview               : "../../libs/jsdifflib/diffview",
        autocompleteTreeView   : "../../libs/autocompleteTreeview/Scripts/jquery.autocompTree",
        "jquery-simple-slider" : "../../libs/jquery-simple-slider/js/simple-slider",
        "perfect-scrollbar"    : "../../libs/perfect-scrollbar/src/perfect-scrollbar",
        rangeslider            : "../../libs/rangeslider.js/dist/rangeslider",
        "bootstrap-select"     : "../../libs/bootstrap-select/dist/js/bootstrap-select",
        sweetalert             : "../../libs/sweetalert/lib/sweet-alert",
    },
    shim: {
        blobjs: {
            exports: "Blob"
        },
        filesaver: {
            exports: "Filesaver"
        },
        difflib: {
            exports: "difflib"
        },
        diffview: {
            exports: "diffview"
        },
        jquery: {
            exports: "$"
        },
        underscore: {
            exports: "_"
        },
        backbone: {
            exports: "Backbone",
            deps: [
                "underscore",
                "jquery"
            ]
        },
        "backbone.radio": {
            deps: [
                "backbone"
            ],
            exports: "Backbone"
        },
        "jquery-ui": {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        fancytree: {
            deps: [
                "jquery-ui"
            ],
            exports: "$"
        },
        i18n: {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        bootstrap: {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        typeahead: {
            exports: "$",
            deps: [
                "jquery",
                "bootstrap"
            ]
        },
        autocompleteTreeView: {
            deps: [
                "jquery",
                "jquery-ui",
                "fancytree"
            ],
            exports: "$"
        },
        "jquery-simple-slider": {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        "perfect-scrollbar": {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        "bootstrap-select": {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        sweetalert: {
            exports: "$",
            deps: [
                "jquery"
            ]
        }
    }
});

require(['formbuilder'], function(formbuilder) {
    var options = {
        // Specify URL for formBuilder configuration
        // Replace this URL with your own
        URLOptions : {
            autocompleteURL       : 'ressources/autocomplete/',
            translationURL        : 'ressources/locales/',
            keywordAutocomplete   : 'ressources/autocomplete/keywords.json',
            protocolAutocomplete  : 'ressources/autocomplete/protocols.json',
            unitURL               : 'ressources/autocomplete/units.json',
            preConfiguredField    : 'ressources/fieldConfiguration/preConfiguredField.json',
            fieldConfigurationURL : 'configurationSaved'
        },
        el : '#formBuilder'
    }

    formbuilder.initialize(options);
});