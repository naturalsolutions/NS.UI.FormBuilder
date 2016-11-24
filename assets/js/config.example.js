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
        backbone                            : "../../libs/backbone/backbone",
        blobjs                              : "../../libs/blobjs/Blob",
        bootstrap                           : "../../libs/bootstrap/dist/js/bootstrap.min",
        fancytree                           : "../../libs/fancytree/dist/jquery.fancytree-all.min",
        filesaver                           : "../../libs/filesaver/FileSaver.min",
        i18n                                : "../../libs/i18n/i18next.min",
        jquery                              : "../../libs/jquery/dist/jquery.min",
        "jquery-ui"                         : "../../libs/jquery-ui/jquery-ui",
        underscore                          : "../../libs/underscore/underscore-min",
        requirejs                           : "../../libs/requirejs/require",
        "backbone-forms"                    : "../../libs/backbone-forms/distribution.amd/backbone-forms",
        modalAdapter                        : "../../libs/bootstrapAdapter/src/backbone.bootstrap-modal",
        "backbone-forms-list"               : "../../libs/backbone-forms/distribution.amd/editors/list",
        bootstrapTemplate                   : "../../libs/backbone-forms/distribution/templates/bootstrap3",
        bootstrapAdapter                    : "../../libs/bootstrapAdapter/index",
        "backbone.radio"                    : "../../libs/backbone.radio/build/backbone.radio",
        autocompleteTreeView                : "../../libs/autocompleteTreeview/Scripts/jquery.autocompTree",
        "jquery-simple-slider"              : "../../libs/jquery-simple-slider/js/simple-slider",
        "bootstrap-select"                  : "../../libs/bootstrap-select/dist/js/bootstrap-select",
        sweetalert                          : "../../libs/sweetalert/dist/sweetalert.min",
        marionette                          : '../../libs/marionette/lib/backbone.marionette.min',
        backgrid                            : '../../libs/backgrid/lib/backgrid',
        moment                              : '../../libs/moment/moment',
        slimScroll                          : '../../libs/slimScroll/jquery.slimscroll.min',
        "eonasdan-bootstrap-datetimepicker" : "../../libs/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min",
        async                               : '../../libs/requirejs-plugins/src/async',
        'pillbox-editor' 					: "../../libs/pillbox-editor/dist/pillbox-editor.amd",
        'pillbox' 							: '../../libs/jquery.pillbox.js/js/jquery.pillbox',
        'jcanvas' 							: '../../libs/jcanvas/jcanvas.min'
    },

    shim: {
        "backbone-forms-list" : {
            deps : ["modalAdapter"]
        },
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
        "eonasdan-bootstrap-datetimepicker": {
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
        },
        'pillbox' : {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        jcanvas: {
            exports: "$",
            deps: [
                "jquery"
            ]
        }
    }
});

define([
    'jquery', 'underscore', 'backbone', 'Translater', 'app-config'
], function($, _, Backbone, Translater, AppConfig) {

	require(['jquery', 'Translater', 'formbuilder'], function($, Translater, formbuilder) {

		formbuilder.start(AppConfig.config.options);
	});

});