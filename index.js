var d3 = require('d3'),
    _ = require('underscore'),
    params = require('./params.json'),
    poisson = require('./js/algorithms/poissonDiscSamplerNodesLinks.js');

var x = d3.scale.linear()
    .domain([0, params.width])
    .range([-params.width/2, params.width/2]);

var scale = d3.scale.linear()
    .domain([0, params.window])
    .range([0, params.width]);

var timeScale = d3.scale.linear()
    .domain([params.timepoints[0].time, params.timepoints[params.timepoints.length -1 ].time])
    .range([ 0, params.transition ]);

var lineScale = d3.scale.linear()
    .domain([params.timepoints[0].time, params.timepoints[params.timepoints.length -1 ].time])
    .range([20, params.width - 20]);

var svg = d3.select('body')
            .append('svg')
            .attr('width', params.width)
            .attr('height', params.width + 60);

//Background
svg.append('rect')
    .attr('fill', '#c0392b')
    .attr('width', params.width)
    .attr('height', params.width);

var data = poisson(params.width, params.width, params.eDistance);
console.log('showing ' + data.nodes.length + ' nodes');
    
var force = d3.layout.force()
        .gravity(0)
        .charge(0)
        .size([params.width, params.width])
        .nodes(data.nodes);
    
var nodes = svg.selectAll('.node')
        .data(data.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', scale(params.timepoints[0].d/2))
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr('fill', '#e74c3c')
        .attr('stroke', '#cc2b19')
        .attr('stroke-width', 1);

formatNodes(data.nodes, params.timepoints);

initTimeLine();
showScale(5, 'µm');
animate();

function showScale(w, units){

    var width = scale(w),
        top = 30,
        right = params.width - width - 30;
    
    svg.append('line')
        .attr('x1', right)
        .attr('y1', top)
        .attr('x2', width + right)
        .attr('y2', top)
        .attr('stroke-width', 4) 
        .attr('stroke', '#000');
    
    svg.append('text')
        .attr('x', width/2 + right)
        .attr('y', top + 20)
        .attr('font-size', '15')
        .attr('font-family', 'verdana')
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .text( w + units);
}

function initTimeLine(){
    
    //Background
    svg.append('rect')
        .attr('fill', '#ffffff')
        .attr('width', params.width)
        .attr('height', 60)
        .attr('x', 0)
        .attr('y', params.width);
    
    svg.append('line')
        .attr('x1', 20)
        .attr('y1', params.width + 25)
        .attr('x2', params.width - 20)
        .attr('y2', params.width + 25)
        .attr('stroke-width', 4) 
        .attr('stroke', '#ecf0f1');
    
    svg.selectAll('.linenode')
        .data(params.timepoints)
        .enter().append('circle')
        .attr('class', 'linenode')
        .attr('r', function(t){ return scale(t.d/2); })
        .attr('cx', function(t) { return lineScale(t.time); })
        .attr('cy', params.width + 25)
        .attr('fill', '#ecf0f1');
    
    
    svg.append('circle')
        .attr('class', 'handle')
        .attr('r', scale(params.timepoints[0].d/2))
        .attr('cx', 20)
        .attr('cy', params.width + 25)
        .attr('fill', '#e74c3c')
        .attr('stroke', '#cc2b19')
        .attr('stroke-width', 1);
    
    svg.selectAll('.linelabel')
        .data(params.timepoints)
        .enter().append('text')
        .attr('class', 'linelabel')
        .attr('x', function(t) { return lineScale(t.time); })
        .attr('y', params.width + 53)
        .attr('font-size', '12')
        .attr('font-family', 'verdana')
        .attr('text-anchor', 'middle')
        .attr('fill', '#2c3e50')
        .text(function(d){return d.name});
}

function simulate(e){
    force.charge(getCharge(scale(e.d)));
}

function getDistance(source, target){
    return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
}

// According to polinomial fit, 
// returns the charge for a given diameter 
function getCharge(d){
    
    // y = 8E-11x5 - 4E-08x4 + 7E-06x3 - 0.0014x2 - 0.0317x - 0.0399
    return ( - 8e-11 * Math.pow( d, 5 ) ) - ( 4e-8 * Math.pow( d, 4 ) ) - ( 7e-6 * Math.pow( d,  3 ) ) - ( 0.0014 * Math.pow( d, 2 ) ) - ( 0.0317 * d) + 0.0399;
}

function runLayout(d, steps, callback){
    
    force.charge(getCharge(scale(d)));
    force.start();
    for (var i = steps; i > 0; --i) force.tick();
    force.stop();
    
    callback();
}

function animate(){
    
    function animationStep(i){
    
        var tp = params.timepoints[i];
        
        if(_.isUndefined(tp)) return;
        
        var tr = svg.transition(),
            r = scale(tp.d/2),
            linePos = lineScale(tp.time);

         tr            
            .duration(tp.duration)
            .ease('linear')
            .selectAll('.node')
                .attr('cx', function(d) { return d.positions[i][0]; })
                .attr('cy', function(d) { return d.positions[i][1]; })
                .attr('r', r);
        
        tr
            .duration(tp.duration)
            .ease('linear')
            .selectAll('.handle')
            .attr('cx', linePos)
            .attr('r', r)
            .each('end', function(){ i++; animationStep(i); });
    }
    
    animationStep(1);
}

function formatNodes(nodes, timePoints){

    _.each(nodes, function(n){
        n.positions = [[n.x, n.y]];
    });
    
    var delay = 0;
    
    _.chain(timePoints)
        .filter(function(t, i){
            return i !== 0;
        })
        .each(function(t){
            runLayout(t.d, 300, addPositions);
        
            t.duration = timeScale(t.time) - delay;
            delay =  timeScale(t.time);
        });
    
    function addPositions(){
        _.each(nodes, function(n){
            n.positions.push([n.x ,n.y]);
        });
    }
}


