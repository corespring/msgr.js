module.exports = function(grunt) {


  function startExpress() {
    var express = require('express');
    var app = express();
    app.use(express.static(__dirname));
    app.listen(5000);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        reporterOutput: ""
      },
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
      local: {
        tests: ['test/regression/spec/**/*-spec.js']
      },
      sauceLabs: {
        tests: ['test/regression/spec/**/*.js'],
        options: {
          host: 'ondemand.saucelabs.com',
          port: 80,
          user: process.env.SAUCE_USERNAME,
          key: process.env.SAUCE_ACCESS_KEY,
          desiredCapabilities: {
            browserName: 'internet explorer',
            platform: 'Windows XP',
            version : '8',
            'tunnel-identifier': 'my-tunnel'
          }
        }
      }
    },
    jasmine: {
      main: {
        src: 'src/**/*.js',
        options: {
          keepRunner: true,
          specs: 'test/unit/**/*spec.js',
          vendor: [
            "lib/*.js"
          ]
        }
      }
    },
    bump: {
      options: {
        files: ['bower.json', 'package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-webdriver');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('start-express', startExpress);
  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('regression', ['start-express', 'webdriver:local']);
  grunt.registerTask('default', ['jshint', 'uglify', 'copy']);
};
