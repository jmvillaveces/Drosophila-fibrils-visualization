var d3 = require('d3');
var _ = require('underscore');
var params = require('./params.json');
var poisson = require('./js/poissonDiscSamplerNodesLinks.js');

var force = null,
    nodes = null,
    links = null,
    animationStep = 400;

var x = d3.scale.linear()
    .domain([0, params.width])
    .range([-params.width/2, params.width/2]);

var scale = d3.scale.linear()
    .domain([0, params.window])
    .range([0, params.width]);

var timeScale = d3.scale.linear()
    .domain([ 0, d3.sum(params.timepoints, function(d){ return d.time; }) ])
    .range([ 0, params.transition ]);

var svg = d3.select('body')
            .append('svg')
            .attr('width', params.width)
            .attr('height', params.width);

//Background
svg.append('rect')
    .attr('fill', '#c0392b')
    .attr('width', '100%')
    .attr('height', '100%');

initForce();

function getDistance(source, target){
    return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
}

// According to linear regretion, 
// returns the charge for a given diameter 
function getChargefunction(d){
    return (d * - 3.3734) + 14.256;
}

function initForce() {
    
    var data = poisson(params.width, params.width, params.eDistance);
    
    force = d3.layout.force()
        .gravity(0)
        .charge(-5)
        .size([params.width, params.width])
        .nodes(data.nodes);
    
    nodes = svg.selectAll('.node')
        .data(data.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', scale(params.timepoints[0].d/2))
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr('fill', '#e74c3c');
    
    _.each(data.links, function(l){
        l.d0 = getDistance(data.nodes[l.source], data.nodes[l.target]);
    });
    
    runLayout(300, stepForce);
    
    var avg = 0;
    _.each(data.links, function(l){
        var dis = getDistance(data.nodes[l.source], data.nodes[l.target]);
        avg += dis - l.d0;
        console.log(l.d0, dis, dis - l.d0);
    });
    console.log(avg/data.links.length);
    
}

function runLayout(steps, callback){
    force.start();
    for (var i = steps; i > 0; --i) force.tick();
    force.stop();
    
    callback();
}

function stepForce(){
    
    nodes.transition().ease('linear').duration(animationStep)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
}


