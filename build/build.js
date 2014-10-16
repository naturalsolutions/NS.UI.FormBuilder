({
	paths: {
        backbone              : "../../libs/backbone/backbone",
        blobjs                : "../../libs/blobjs/Blob",
        bootstrap             : "../../libs/bootstrap/dist/js/bootstrap",
        fancytree             : "../../libs/fancytree/dist/jquery.fancytree-all.min",
        filesaver             : "../../libs/filesaver/FileSaver",
        i18n                  : "../../libs/i18n/i18next",
        jquery                : "../../libs/jquery/dist/jquery",
        jqueryui              : "../../libs/jquery-ui/jquery-ui.min",
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
        fuelux                : "../../libs/fuelux/dist/js/fuelux"
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

    optimize: 'uglify2',
    uglify2: {
      output: {
        beautify: true,
      },
      beautify: {
        semicolons: false
      }
    },
	baseUrl                 : '../assets/js/',
	mainConfigFile          : '../assets/js/config.js',
	name                    : 'formbuilder',
	out                     : 'formbuilder.min.js',
    output : {
        beautify: true
    },
	preserveLicenseComments : false,

    include : ['requirejs', 'backbone']

})