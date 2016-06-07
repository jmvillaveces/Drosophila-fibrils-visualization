var page = require('webpage').create();

var animationTime = 14,
    framesPerSeccond = 30, //Some people use 24
    frames = animationTime * framesPerSeccond,
    time = 1000 / framesPerSeccond;


console.log(time, frames);

page.open('http://127.0.0.1:8282/dist/', function() {
    
    // Initial frame
    var frame = 1;
    
    setInterval(function() {
        // Render an image with the frame name
        page.render('frames/' + (frame++) + '.png', { format: 'png' });
        
            // Exit after 50 images
            if(frame > frames) {
                phantom.exit();
            }
    }, time);
});