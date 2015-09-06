module.exports = function(grunt) {

  var reloadPort = 35729;


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        files: {
          'www/css/style.css': 'www/css/style.scss'
        }
      }
    },

    watch: {
      options: {
        nospawn: true,
      },
      css: {
        files: [
          'www/css/*.scss'
        ],
        tasks: ['sass']
      },
    },
  });

  // load all tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');


  // Default task(s).
  grunt.registerTask('default', [
    'sass',
    'watch'
  ]);

};
