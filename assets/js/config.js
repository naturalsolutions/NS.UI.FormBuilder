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
        'lib/font-awesome/font-awesome.css',
        'lib/fancytree/ui.fancytree.min.css',
        'lib/bootstrap/bootstrap.css',
        'librairies/bootstrap/docs/assets/css/bootstrap-responsive.css',
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
        backbone             : "../../lib/backbone/backbone",
        blobjs               : "../../lib/blobjs/Blob",
        bootstrap            : "../../lib/bootstrap/bootstrap",
        fancytree            : "../../lib/fancytree/jquery.fancytree-custom.min",
        filesaver            : "../../lib/filesaver/FileSaver",
        i18n                 : "../../lib/i18n/i18next",
        jquery               : "../../lib/jquery/jquery",
        jqueryui             : "../../lib/jquery-ui/jquery-ui",
        nanoscroller         : "../../lib/nanoscroller/jquery.nanoscroller",
        underscore           : "../../lib/underscore/underscore",
        "NS.UI.Navbar"       : "../../lib/NS.UI.Navbar/navbar",
        "NS.UI.Notification" : "../../lib/NS.UI.Notification/notification",
        requirejs            : "../../lib/requirejs/require",
        "font-awesome"       : "../../lib/font-awesome/*"
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

require(['app/formbuilder'], function(formbuilder) {
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