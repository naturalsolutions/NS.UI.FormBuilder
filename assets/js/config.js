/**
 * @fileOverview config.js
 *
 * RequireJS configuration file
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

function loadAllCss() {
    var links = [
        'libs/font-awesome/css/font-awesome.min.css',
        'libs/fancytree/dist/skin-bootstrap/ui.fancytree.min.css',
        'libs/bootstrap/dist/css/bootstrap-theme.min.css',
        'libs/bootstrap/dist/css/bootstrap.min.css',
        'libs/jsdifflib/diffview.css',
        'libs/nanoscroller/dist/css/nanoscroller.css',
        'libs/NS.UI.Navbar/themes/navbar.bootstrap3.css',
        'libs/NS.UI.Notification/notification.css',
        'compressed/formbuilder.min.css',
        'libs/fancytree/dist/skin-win7/ui.fancytree.min.css',
        'libs/backbone-forms/distribution/templates/bootstrap3.css',
        'libs/fuelux/dist/css/fuelux.min.css'
    ];
    for (var l in links) {
        var link  = document.createElement("link");
        link.type = "text/css";
        link.rel  = "stylesheet";
        link.href = links[l];
        document.getElementsByTagName("head")[0].appendChild(link);
    }
}

require.config({
    paths: {
        backbone              : "../../libs/backbone/backbone",
        blobjs                : "../../libs/blobjs/Blob",
        bootstrap             : "../../libs/bootstrap/dist/js/bootstrap",
        fancytree             : "../../libs/fancytree/dist/jquery.fancytree-all.min",
        filesaver             : "../../libs/filesaver/FileSaver",
        i18n                  : "../../libs/i18n/i18next",
        jquery                : "../../libs/jquery/dist/jquery",
        jqueryui              : "../../libs/jquery-ui/jquery-ui",
        "jquery-ui"           : "../../libs/jquery-ui/jquery-ui",
        underscore            : "../../libs/underscore/underscore",
        "NS.UI.Navbar"        : "../../libs/NS.UI.Navbar/navbar",
        "NS.UI.NavbarTheme"   : "../../libs/NS.UI.Navbar/themes/navbar.bootstrap3",
        "NS.UI.Notification"  : "../../libs/NS.UI.Notification/notification",
        requirejs             : "../../libs/requirejs/require",
        "font-awesome"        : "../../libs/font-awesome/fonts/*",
        "backbone-forms"      : "../../libs/backbone-forms/distribution.amd/backbone-forms",
        "backbone-forms-list" : "../../libs/backbone-forms//distribution.amd/editors/list.min",
        modalAdapter          : "../../libs/bootstrapAdapter/src/backbone.bootstrap-modal",
        bootstrapTemplate     : "../../libs/backbone-forms/distribution/templates/bootstrap3",
        template              : "../../libs/backbone-forms/distribution/templates/bootstrap",
        xmljs                 : "../../libs/xmljs/xmllint",
        bootstrapAdapter      : "../../libs/bootstrapAdapter/index",
        nanoscroller          : "../../libs/nanoscroller/dist/javascripts/jquery.nanoscroller",
        typeahead             : "../../libs/typeahead/bootstrap3-typeahead",
        "backbone.radio"      : "../../libs/backbone.radio/build/backbone.radio",
        fuelux                : "../../libs/fuelux/dist/js/fuelux",
        'difflib'             : '../../libs/jsdifflib/difflib',
        'diffview'             : '../../libs/jsdifflib/diffview'
    },
    shim: {
        difflib : {
            exports : 'difflib'
        },
        diffview : {
            exports : 'diffview'
        },
        jquery: {
            exports: "$"
        },
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: [
                "underscore",
                "jquery"
            ],
            exports: "Backbone"
        },
        "backbone-forms": {
            deps: [
                "backbone"
            ],
            exports: "Backbone"
        },
        "backbone.radio": {
            deps: [
                "backbone"
            ],
            exports: "Backbone"
        },
        bootstrapTemplate: {
            deps: [
                "backbone-forms"
            ],
            exports: "Form"
        },
        jqueryui: {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        "jquery-ui": {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        fancytree: {
            exports: "$",
            deps: [
                "jquery-ui"
            ]
        },
        i18n: {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        "NS.UI.Navbar": {
            exports: "$",
            deps: [
                "jquery",
                "backbone",
                "bootstrap"
            ]
        },
        "NS.UI.NavbarTheme": {
            deps: [
                "NS.UI.Navbar"
            ],
            exports: "NS"
        },
        "NS.UI.Notification": {
            exports: "$",
            deps: [
                "jquery",
                "backbone",
                "bootstrap"
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
        nanoscroller: {
            exports: "$",
            deps: [
                "jquery"
            ]
        }
    },
    packages: [

    ]
});

require(['formbuilder'], function(formbuilder) {
    loadAllCss();

    var options = {
        // Specify URL for formBuilder configuration
        // Replace this URL with your own
        URLOptions : {
            autocompleteURL      : 'ressources/autocomplete/',
            translationURL       : 'ressources/locales/',
            keywordAutocomplete  : 'ressources/autocomplete/keywords.json',
            protocolAutocomplete : 'ressources/autocomplete/protocols.json',
            unitURL              : 'ressources/autocomplete/units.json',
        },
        el : '#formBuilder'
    }

    formbuilder.initialize(options);
});