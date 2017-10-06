module.exports = function(grunt) {

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
                    "compressed/formbuilder.min.css": "assets/stylesheet/all.less"
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
                    "compressed/formbuilder.min.css": "assets/stylesheet/all.less"
                }
            }
        },

        // Watch less file changes for compile
        watch: {
            stylesheet: {
                files: ['assets/stylesheet/**/*.less'],
                tasks: ['less:dev', 'autoprefixer:single_file']
            }
        },

        autoprefixer: {
            single_file: {
                src: "compressed/formbuilder.min.css",
                dest: "compressed/prefixedformbuilder.min.css"
            }
        }
    });

    grunt.registerTask('default', ['less:dev', 'autoprefixer']);
    grunt.registerTask('dev', ['less:dev', 'autoprefixer']);
    grunt.registerTask('prod', ['less:dist', 'autoprefixer']);
	grunt.registerTask('build', 'prod');

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-bower-clean');

}