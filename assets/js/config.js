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
        bootstrap              : "../../libs/bootstrap/dist/js/bootstrap.min",
        fancytree              : "../../libs/fancytree/dist/jquery.fancytree-all.min",
        filesaver              : "../../libs/filesaver/FileSaver.min",
        i18n                   : "../../libs/i18n/i18next.min",
        jquery                 : "../../libs/jquery/jquery.min",
        "jquery-ui"            : "../../libs/jquery-ui/jquery-ui",
        underscore             : "../../libs/underscore/underscore-min",
        requirejs              : "../../libs/requirejs/require",
        "backbone-forms"       : "../../libs/backbone-forms/distribution.amd/backbone-forms",
        modalAdapter           : "../../libs/bootstrapAdapter/src/backbone.bootstrap-modal",
        "backbone-forms-list"  : "../../libs/backbone-forms/distribution.amd/editors/list.min",
        bootstrapTemplate      : "../../libs/backbone-forms/distribution/templates/bootstrap3",
        bootstrapAdapter       : "../../libs/bootstrapAdapter/index",
        "backbone.radio"       : "../../libs/backbone.radio/build/backbone.radio",
        fuelux                 : "../../libs/fuelux/dist/js/fuelux",
        difflib                : "../../libs/jsdifflib/difflib",
        diffview               : "../../libs/jsdifflib/diffview",
        autocompleteTreeView   : "../../libs/autocompleteTreeview/Scripts/jquery.autocompTree",
        "jquery-simple-slider" : "../../libs/jquery-simple-slider/js/simple-slider",
        "bootstrap-select"     : "../../libs/bootstrap-select/dist/js/bootstrap-select",
        sweetalert             : "../../libs/sweetalert/lib/sweet-alert",
        marionette             : '../../libs/marionette/lib/backbone.marionette.min',
        backgrid               : '../../libs/backgrid/lib/backgrid',
        moment                 : '../../libs/moment/moment',
        slimScroll             : '../../libs/slimScroll/jquery.slimscroll.min'
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
        slimScroll: {
            exports: "$",
            deps: [
                "jquery"
            ]
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
        },
        marionette: {
            deps: ["backbone"],
            exports: "Marionette"
        },
        'backgrid': {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'Backgrid'
        }
    }
});

require(['formbuilder'], function(formbuilder) {

    var options = {

        // Specify URL for formBuilder configuration
        // Replace this URL with your own

        URLOptions : {
            //  Allow to get some topic for autocomplete functionnalities
            autocompleteURL       : 'ressources/autocomplete/',

            //  Allows to get translation ressources (use i18nnext : http://i18next.com/ )
            translationURL        : 'ressources/locales/',

            //  Get form keywords autocomplete values
            keywordAutocomplete   : 'ressources/autocomplete/keywords.json',

            //  Get all form name for autocomplete
            protocolAutocomplete  : 'ressources/autocomplete/protocols.json',

            //  Get all unities for autocomplete
            unitURL               : 'ressources/autocomplete/units.json',

            //  Returns all pre-configurated field
            //  A configurated field is a field saved by use for a future use
            //  For example user create a firstName field because it will be present in many forms
            preConfiguredField    : 'ressources/fieldConfiguration/preConfiguredField.json',

            //  Allow to send a pre-configurated field to the server
            //  Send a POST request, so in client side it won't work, you need to install the back-end : https://github.com/NaturalSolutions/NS.Server.FormBuilder
            fieldConfigurationURL : 'configurationSaved',

            //  Allow to get linked fields list
            linkedFields : 'ressources/linkedFields/linkedFields.json'
        },

        //  Wich parent HTML element for the application
        el : '#formBuilder'
    }

    formbuilder.start(options);
});