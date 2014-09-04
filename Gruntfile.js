module.exports = function(grunt) {

    grunt.initConfig({

        //  LESS file compilation
        less: {
            dist: {
                options: {
                    paths: ["stylesheet"],
                    cleancss: true,
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
            }
        },

        //  Bower : install bower components and create requireJS configuration file
        bower: {
            install: {
                options: {
                    cleanBowerDir : true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
}