module.exports = function(grunt) {
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['gruntfile.js', 'main.js', 'js/**/*.js', 'tests/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        browserify: {
            'dist/js/App.js': ['index.js']
        },
        uglify: {
            my_target: {
                files: {
                    'dist/js/App.min.js': ['dist/js/App.js']
                }
            }
        },
        exec: {
            record: {
                cmd: function(duration, framerate, output){
                    
                    duration = (duration === undefined) ? 15 : duration;
                    framerate = (framerate === undefined) ? 30 : framerate;
                    output = (output === undefined) ? './scripts/output.mp4' : output;
                    
                    return 'phantomjs ./scripts/runner.js ' + duration + ' ' + framerate + '| ffmpeg -y -c:v png -f image2pipe -r ' + framerate + ' -t ' + duration + '  -i - -c:v libx264 -pix_fmt yuv420p -preset slow -crf 22 ' + output;
                }
            }
        },
        'http-server': {
 
            'dev': {

                // the server root directory 
                //root: <path>,

                // the server port 
                // can also be written as a function, e.g. 
                // port: function() { return 8282; } 
                port: 8282,

                // the host ip address 
                // If specified to, for example, "127.0.0.1" the server will 
                // only be available on that ip. 
                // Specify "0.0.0.0" to be available everywhere 
                host: "0.0.0.0",

                // Tell grunt task to open the browser 
                openBrowser : true

            }

        }
    });
    
    //Tasks
    grunt.registerTask('dist', ['jshint', 'browserify', 'uglify']);
    
    grunt.registerTask('serve', ['http-server']);
    
    //Generates dist folder
    
    // Load the plugins
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
};
