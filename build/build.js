({
	paths: {
        backbone             : "../../libs/backbone/backbone",
        blobjs               : "../../libs/blobjs/Blob",
        bootstrap            : "../../libs/bootstrap/dist/js/bootstrap.min",
        fancytree            : "../../libs/fancytree/jquery.fancytree-custom.min",
        filesaver            : "../../libs/filesaver/FileSaver",
        i18n                 : "../../libs/i18n/i18next",
        jquery               : "../../libs/jquery/dist/jquery.min",
        jqueryui             : '../../libs/jquery-ui/jquery-ui',
        nanoscroller         : "../../libs/nanoscroller/dist/javascripts/jquery.nanoscroller.min",
        underscore           : "../../libs/underscore/underscore",
        "NS.UI.Navbar"       : "../../libs/NS.UI.Navbar/navbar",
        "NS.UI.Notification" : "../../libs/NS.UI.Notification/notification",
        requirejs            : "../../libs/requirejs/require"
    },

    shim: {
        'jquery'       : { exports: '$' },
        'underscore'   : { exports: '_' },
        'backbone'     : { deps : ['underscore', 'jquery'], exports : "Backbone"},
        "jqueryui"     : { exports: "$", deps: ['jquery'] },
        "i18n"         : { exports: "$", deps: ['jquery'] },
        "nanoscroller" : { exports: "$", deps: ['jquery', 'jqueryui'] },
        "NS.UI.Navbar" : { exports: "$", deps: ['jquery', 'backbone', 'bootstrap'] },
        "bootstrap"    : { exports: "$", deps: ['jquery'] },
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
	

    include : ['requirejs', 'backbone'],
})
