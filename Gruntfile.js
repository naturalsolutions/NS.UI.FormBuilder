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
            }
        },

        shell: {
            copyFancytree: {
                command: 'cp -r bower_components/fancytree/dist/skin-win7 lib/fancytree'
            },
            copyBootstrap : {
                command : 'cp bower_components/bootstrap/docs/assets/css/bootstrap-responsive.css lib/bootstrap/bootstrap-responsive.css',
            },
            setFontAwesome : {
                command : [
                    'cd lib/font-awesome',
                    'mkdir fonts',
                    'mkdir css',
                    'mv font-awesome.css css/font-awesome.css',
                    'find . -name "*webfont*" -exec mv "{}" ./fonts \;'
                ].join(' && ')
            },
            moveUselessFile : {
                command : [
                    'cd lib',
                    'find . -name "*.md" -exec rm "{}" \;',
                    'rm -r jquery.ui',
                    'rm -r xmljs/libxml2-2.7.8'
                ].join(' && ')
            },
            cleanBowerDir : {
                command : 'rm -rf bower_components/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('install', ['bower:install', 'shell']);
}