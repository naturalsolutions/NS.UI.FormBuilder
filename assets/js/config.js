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
        'lib/font-awesome/css/font-awesome.css',
        'lib/fancytree/skin-win7/ui.fancytree.min.css',
        'lib/bootstrap/bootstrap.css',
        'lib/bootstrap/bootstrap-responsive.css',
        'lib/jsdifflib/diffview.css',
        'lib/nanoscroller/nanoscroller.css',
        'lib/NS.UI.Navbar/navbar-modernui.css',
        'lib/NS.UI.Navbar/navbar.css',
        'lib/NS.UI.Notification/notification.css',
        'compressed/formbuilder.min.css'
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
        fancytree             : "../../libs/fancytree/dist/jquery.fancytree-custom.min",
        filesaver             : "../../libs/filesaver/FileSaver",
        i18n                  : "../../libs/i18n/i18next",
        jquery                : "../../libs/jquery/dist/jquery.min",
        jqueryui              : "../../libs/jquery-ui/jquery-ui.min",
        nanoscroller          : "../../libs/nanoscroller/bin/javascripts/jquery.nanoscroller.min",
        underscore            : "../../libs/underscore/underscore",
        "NS.UI.Navbar"        : "../../libs/NS.UI.Navbar/navbar",
        "NS.UI.Notification"  : "../../libs/NS.UI.Notification/notification",
        requirejs             : "../../libs/requirejs/require",
        "font-awesome"        : "../../libs/font-awesome/fonts/*",
        "backbone-forms"      : "../../libs/backbone-forms/distribution.amd/backbone-forms",
        "backbone-forms-list" : "../../lib/backbone-forms//distribution.amd/editors/list.min",
        modalAdapter          : "../../lib/bootstrapAdapter/src/backbone.bootstrap-modal",
        template              : "../../lib/backbone-forms/distribution/templates/bootstrap",
        xmljs                 : "../../lib/xmljs/xmllint",
        bootstrapAdapter      : "../../libs/bootstrapAdapter/index"
    },
    shim: {
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
        jqueryui: {
            exports: "$",
            deps: [
                "jquery"
            ]
        },
        fancytree: {
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
        nanoscroller: {
            exports: "$",
            deps: [
                "jquery",
                "jqueryui"
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
        bootstrap: {
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
        autocompleteURL      : 'ressources/autocomplete/',
        translationURL       : 'ressources/locales/',
        keywordAutocomplete  : 'ressources/autocomplete/keywords.json',
        protocolAutocomplete : 'ressources/autocomplete/protocols.json',
        unitURL              : 'ressources/autocomplete/units.json'
    }

    formbuilder.initialize(options);
});