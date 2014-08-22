
function loadAllCss() {
    var links = [
        'librairies/font-awesome/font-awesome.css',
        'librairies/bootstrap/bootstrap.css',
        'librairies/jsdifflib/diffview.css',
        'librairies/nanoscroller/nanoscroller.css',
        'librairies/NS.UI.Navbar/navbar-modernui.css',
        'librairies/NS.UI.Navbar/navbar.css',
        'librairies/NS.UI.Notification/notification.css',
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
        backbone             : "../../librairies/backbone/backbone",
        blobjs               : "../../librairies/blobjs/Blob",
        bootstrap            : "../../librairies/bootstrap/bootstrap",
        fancytree            : "../../librairies/fancytree/dist/jquery.fancytree-custom.min",
        filesaver            : "../../librairies/filesaver/FileSaver",
        "font-awesome"       : "../../librairies/font-awesome/fonts/*",
        i18n                 : "../../librairies/i18n/i18next",
        jquery               : "../../librairies/jquery/jquery",
        jqueryui             : '../../librairies/jquery-ui/jquery-ui',
        nanoscroller         : "../../librairies/nanoscroller/jquery.nanoscroller",
        underscore           : "../../librairies/underscore/underscore",
        "NS.UI.Navbar"       : "../../librairies/NS.UI.Navbar/navbar",
        "NS.UI.Notification" : "../../librairies/NS.UI.Notification/notification",
        requirejs            : "../../librairies/requirejs/require",
    },

    packages : [{
        name     : 'js',
        location : '',
        main     : 'formbuilder.js'
    }],

    shim: {
        'jquery'       : { exports: '$' },
        'underscore'   : { exports: '_' },
        "jqueryui"     : { exports: "$", deps: ['jquery'] },
        "i18n"         : { exports: "$", deps: ['jquery'] },
        "nanoscroller" : { exports: "$", deps: ['jquery', 'jqueryui'] },
        "NS.UI.Navbar" : { exports: "$", deps: ['jquery', 'backbone', 'bootstrap'] },
        "bootstrap"    : { exports: "$", deps: ['jquery'] },
    }
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