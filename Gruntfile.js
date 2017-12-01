module.exports = function(grunt) {
    var cssLibs = [
        "node_modules/autocompTree/Scripts/skin-win7/ui.fancytree.min.css",
        "node_modules/bootstrap/dist/css/bootstrap-theme.css",
        "node_modules/bootstrap/dist/css/bootstrap.css",
        "node_modules/backbone-forms/distribution/templates/bootstrap3.css",
        "node_modules/@naturalsolutions/renecofonts/style.css",
        "assets/stylesheet/sweetalert.css"
    ];

    var cssMain = [
        "assets/stylesheet/all.less"
    ];

    var renecoFontsDir = "node_modules/@naturalsolutions/renecofonts/fonts/";

    grunt.initConfig({
        //  LESS file compilation
        //  This instruction is launched with grunt watch
        less: {
            dev: {
                options: {
                    paths: ["stylesheet"],
                    cleancss: false,
                    sourceMap: false,
                    compress : false,
                    dumpLineNumbers: "all",
                    sourceMapFilename: 'compressed/formbuilder.css.map',
                    sourceMapRootpath: ''
                },
                files: {
                    "compressed/libs.min.css": cssLibs,
                    "compressed/formbuilder.min.css": cssMain
                }
            },
            dist: {
                options: {
                    paths: ["stylesheet"],
                    cleancss: true,
                    sourceMap: false,
                    compress : true,
                    sourceMapFilename: 'compressed/formbuilder.css.map',
                    sourceMapRootpath: ''
                },
                files: {
                    "compressed/libs.min.css": cssLibs,
                    "compressed/formbuilder.min.css": cssMain
                }
            }
        },

        copy: {
            fonts: {
                files: [
                    {
                        src: '**',
                        cwd: renecoFontsDir,
                        dest: 'compressed/fonts/',
                        expand: true,
                        flatten: true
                    }
                ]
            }
        },

        // Watch less file changes for compile
        watch: {
            stylesheet: {
                files: ['assets/stylesheet/**/*.less'],
                tasks: ['less:dev', 'autoprefixer:single_file']
            }
        }
    });

    grunt.registerTask('default', 'dev');
    grunt.registerTask('dev', ['less:dev', 'copy']);
    grunt.registerTask('prod', ['less:dist', 'copy']);
	grunt.registerTask('build', 'prod');

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
}
