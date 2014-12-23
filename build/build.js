({
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
            deps: [
                "jquery"
            ],
            exports: "$"
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

    include : [
        'requirejs',
        'backbone',
        'views/fieldViews/TextFieldView',
        'views/fieldViews/AutocompleteFieldView',
        'views/fieldViews/BaseView',
        'views/fieldViews/CheckBoxFieldView',
        'views/fieldViews/DateFieldView',
        'views/fieldViews/FileFieldView',
        'views/fieldViews/HiddenFieldView',
        'views/fieldViews/HorizontalLineFieldView',
        'views/fieldViews/TextAreaFieldView',
        'views/fieldViews/NumberFieldView',
        'views/fieldViews/PatternFieldView',
        'views/fieldViews/RadioFieldView',
        'views/fieldViews/SelectFieldView',
        'views/fieldViews/SubFormFieldView',
        'views/fieldViews/TreeViewFieldView',
        'views/modals/exportProtocol',
        'views/modals/importProtocol',
        'views/modals/saveProtocol',
        'views/fieldViews/ThesaurusFieldView',
        'views/fieldViews/AutocompleteTreeViewFieldView'
    ]

})