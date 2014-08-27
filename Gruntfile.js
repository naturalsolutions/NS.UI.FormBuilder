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
            target: {
                rjsConfig: 'assets/js/config.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-requirejs');

    grunt.registerTask('bower-install', function() {
        var done = this.async();
        grunt.util.spawn({
            cmd: 'bower',
            args: ['install'],
            opts: {
                stdio: 'inherit'
            }
        }, function(error, result) {
            if (error) {
                grunt.fail.fatal(result.stdout);
            }
            grunt.log.writeln(result.stdout);
            done();
        });
    });

    grunt.registerTask('install', ['bower:target'])
}