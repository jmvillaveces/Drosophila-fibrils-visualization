var json2csv = require('json2csv');

var d3 = require('d3');
var _ = require('underscore');
var params = require('../params.json');

var steps = 300;

var x = d3.scale.linear()
    .domain([0, params.width])
    .range([-params.width/2, params.width/2]);

var stats = [];



function simulate(charge){
    
    var data = poisson(params.width, params.width, x(params.eDistance));
    
    var force = d3.layout.force()
        .gravity(0)
        .charge(charge)
        .size([params.width, params.width])
        .nodes(data.nodes);
    
    var stat = {charge: charge};
    stat.li = [],
    stat.lf = [];
    
    
    _.each(data.links, function(l){
        stat.li.push(getDistance(data.nodes[l.source], data.nodes[l.target]));
    });
    
    force.start();
    for (var i = steps; i > 0; --i) force.tick();
    force.stop();
    
    _.each(data.links, function(l){
        stat.lf.push(getDistance(data.nodes[l.source], data.nodes[l.target]));
    });
    
    return stat;
}

function getDistance(source, target){
    return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
}


var fields = ['field1', 'field2', 'field3'];