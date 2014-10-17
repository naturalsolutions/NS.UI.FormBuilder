module.exports = function(grunt) {

    grunt.initConfig({
        //  LESS file compilation
        //  This instruction is launched with grunt watch
        less: {
            dist: {
                options: {
                    paths: ["stylesheet"],
                    cleancss: true,
                    sourceMap: true,
                    sourceMapFilename: 'compressed/formbuilder.css.map',
                    sourceMapRootpath: ''
                },
                files: {
                    "compressed/formbuilder.min.css": "assets/stylesheet/styles.less"
                }
            }
        },

        // Watch less file changes for compile
        watch: {
            stylesheet: {
                files: ['assets/stylesheet/*.less'],
                tasks: ['less:dist']
                /*options: {
                  livereload: true,
                },*/
            },
            bower : {
                files : ['bower.json'],
                tasks : ['bower:target']
            }
        },

        //  Bower : install bower components and create requireJS configuration file
        bower: {
            target: {
                rjsConfig: 'assets/js/config.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-requirejs');

}