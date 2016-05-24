var fs = require('fs');
var json2csv = require('json2csv');

var d3 = require('d3');
var _ = require('underscore');
var params = JSON.parse(fs.readFileSync('../params.json', 'utf8'));

var poisson = require('../js/poissonDiscSamplerNodesLinks.js');

var steps = 300;

var scale = d3.scale.linear()
    .domain([0, params.window])
    .range([0, params.width]);

var stats = [],
    fields = ['charge', 'l0', 'l1'];;


var i = -30;
while(i <= 30){
    simulate(i);
    i += 2;
}


json2csv({ data: stats, fields: fields }, function(err, csv) {
    
    if (err) console.log(err);
    
    fs.writeFile('chargeStats.csv', csv, function(err) {
        if(err) return console.log(err);
    });
});

function simulate(charge){
    
    var l0 = [];

    var data = poisson(params.width, params.width, scale(params.eDistance));
    
    var force = d3.layout.force()
        .gravity(0)
        .charge(charge)
        .size([params.width, params.width])
        .nodes(data.nodes);
    
    
    _.each(data.links, function(l){
        l0.push(getDistance(data.nodes[l.source], data.nodes[l.target]));
    });
    
    force.start();
    for (var i = steps; i > 0; --i) force.tick();
    force.stop();
    
    _.each(data.links, function(l, i){
        
        var l1 = getDistance(data.nodes[l.source], data.nodes[l.target]);
        stats.push({charge: charge, l0: l0[i], l1:l1});
    });
}

function getDistance(source, target){
    return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
}