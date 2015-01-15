module.exports = function(grunt) {

    grunt.initConfig({
        //  LESS file compilation
        //  This instruction is launched with grunt watch
        less: {
            dist: {
                options: {
                    paths: ["stylesheet"],
                    cleancss: false,
                    sourceMap: false,
                    sourceMapFilename: 'compressed/formbuilder.css.map',
                    sourceMapRootpath: ''
                },
                files: {
                    "compressed/formbuilder.min.css": "assets/stylesheet/all.less"
                }
            }
        },

        // Watch less file changes for compile
        watch: {
            stylesheet: {
                files: ['assets/stylesheet/**/*.less'],
                tasks: ['less:dist', 'autoprefixer:single_file']
            }
        },

        autoprefixer: {
            single_file: {
                src: "compressed/formbuilder.min.css",
                dest: "compressed/prefixedformbuilder.min.css"
            },
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');

}