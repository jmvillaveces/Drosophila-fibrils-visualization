// Run this from the commandline:
// phantomjs runner.js | ffmpeg -y -c:v png -f image2pipe -r 30 -t 25  -i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4

var page = require('webpage').create(),
    args = require('system').args,
    address = 'http://127.0.0.1:8282/dist/',
    duration = isUndefined(args[1]) ? 25 : args[1], // duration of the video, in seconds
    framerate = isUndefined(args[2]) ? 30 : args[2], // number of frames per second. 24 is a good value.
    counter = 0,
    width = 500,
    height = 500;

page.viewportSize = { width: width, height: height };

page.open(address, function(status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        
        console.log('Started with duration ' + duration + ' and framerate ' + framerate);
        
        window.setTimeout(function () {
            //page.clipRect = { top: 0, left: 0, width: width, height: height };

            window.setInterval(function () {
                counter++;
                page.render('/dev/stdout', { format: 'png' });
                if (counter > duration * framerate) {
                    phantom.exit();
                }
            }, 1/framerate);
        }, 200);
    }
});

function isUndefined(obj){
    return obj === void 0;
}