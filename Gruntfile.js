module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    },
    uglify: {
      options: {
        mangle: {
          except: ['msgr']
        }
      },
      main: {
        files: {
          'dist/msgr.min.js' : 'lib/msgr.js'
        }
      }
    },
    copy: {
      main: {
        src: '**/*.js',
        dest: 'dist',
        expand: true,
        cwd: 'lib'
      }
    },
    watch: {
      main: {
        files: 'lib/**/*.js',
        tasks: ['default']

      }
    },
    webdriver: {
      options: {
        desiredCapabilities: {
          browserName: 'chrome'
        }
      },
      form: {
        tests: ['test/spec/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-webdriver');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['jshint', 'uglify', 'copy']);
};