module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "bower-install-simple" : {
        options: {
            forceLatest: true,
        },
		"prod": {
            options: {
                production: true
            }
        },
        "dev": {
            options: {
                production: false
            }
        }
    },
    copy : {
      main: {
        files: [
          //Copy jQuery to vendor directory
          {
            expand: true,
			flatten: true,
            cwd:'bower_components/',
            src: [
              'jquery/jquery.min.js',
              'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
              'proj4/dist/proj4-src.js',
              'ol3-layerswitcher/src/ol3-layerswitcher.js',
              'ol3-popup/src/ol3-popup.js',
              'jquery-bbq-deparam/jquery-deparam.js'
            ],
            dest: 'js/vendor/'
		  },
		  {
            expand:true,
			flatten:true,
            cwd:'bower_components/',
            src:[
              "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css",
			  "malihu-custom-scrollbar-plugin/mCSB_buttons.png",
			  "ol3-layerswitcher/src/ol3-layerswitcher.css"
            ],
            dest:'css/vendor/'
          }
        ]
      }
    }
  });

//grunt.loadNpmTasks('grunt-contrib-less');
//grunt.loadNpmTasks('grunt-contrib-cssmin');
//grunt.loadNpmTasks('grunt-contrib-concat');
//grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks("grunt-bower-install-simple");

grunt.registerTask('default', ['bower-install-simple:dev','copy:main']);
};
