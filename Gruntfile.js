module.exports = function(grunt) {

  // Configuration de Grunt
    grunt.initConfig({
        
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
        
        concat: {
            dist: {
                src: 'js/app/*.js',
                dest: 'dist/js/formbuilder.js'
            },
            libs : {
                src : 'js/libs/**/*.js',
                dest: 'dist/js/libraries.js'
            }
        },
        
        uglify: {
            dist: {
                src: 'dist/js/formbuilder.js',
                dest: 'dist/js/formbuilder.min.js'
            },
        },
        
        cssmin : {
            dist : {
                src: 'dist/stylesheet/formbuilder.css',
                dest: 'dist/stylesheet/formbuilder.min.css'
            }
        },
        
        watch: {
            scripts: {
                files: '**/*.js', // tous les fichiers JavaScript de n'importe quel dossier
                tasks: ['concat:dist']
            },
            styles: {
                files: '**/*.less', // tous les fichiers Sass de n'importe quel dossier
                tasks: ['less:dist']
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-watch')
    
    
    // Définition des tâches Grunt
    
    //grunt.registerTask('default', ['dev', 'watch'])
    
    grunt.registerTask('dev', ['less', 'concat', 'uglify', 'cssmin'])
    //grunt.registerTask('dist', ['less:dist', 'uglify:dist'])

}