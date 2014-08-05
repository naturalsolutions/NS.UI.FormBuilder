module.exports = function(grunt) {

    grunt.initConfig({
        //  --------------------------------------------
        //  Compile LESS files
        //  --------------------------------------------
        less: {
            dist: {
                options: {
                    paths: ["stylesheet"]
                },
                files: {
                     "dist/stylesheet/formbuilder.css": "stylesheet/styles.less"
                }
            }
        },

        //  --------------------------------------------
        //  Concat all js files (not librairies files)
        //  FIX Me : outputed file not works !
        //  --------------------------------------------
        concat: {
            dist: {
                src: [
                    'js/formBuilder.js',
                    'js/utilities.js',
                    'js/model.js',
                    'js/collection.js',
                    'js/views.js',
                    'js/router.js',
                    'js/brain.js',
                ],
                dest: 'dist/js/formbuilder.js'
            }
        },

        //  --------------------------------------------
        //  Minify concated js file
        //  --------------------------------------------
        uglify: {
            dist: {
                src: 'dist/js/formbuilder.js',
                dest: 'dist/js/formbuilder.min.js'
            },
        },

        //  --------------------------------------------
        //  Minify CSS file
        //  --------------------------------------------
        cssmin : {
            dist : {
                src: 'dist/stylesheet/formbuilder.css',
                dest: 'dist/stylesheet/formbuilder.min.css'
            }
        },

        //  --------------------------------------------
        //  Watch file event and run task
        //  --------------------------------------------
        watch: {
            stylesheet : {
                files : ['stylesheet/*.less'],
                tasks : ['less:dist', 'cssmin:dist']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dev', ['less', 'concat', 'uglify', 'cssmin']);
}