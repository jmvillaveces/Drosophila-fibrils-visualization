var d3 = require('d3');
var params = require('./params.json');
var poisson = require('./js/poissonDiscSampler.js');

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

//Group
var g = svg.append('g')
        .attr('transform', 'translate(' + params.width/2 + ',' + params.width/2 + ')');

var sample = poisson(params.width, params.width, params.eDistance),
    format = d3.format('.4f'),
    points = [],
    fibrils,
    circles;

while(true){
    var s = sample();
    if (!s) break;
    points.push(s);
}

fibrils = points.map(function(p){
    return {
        x:p[0],
        y:p[1]
    };
});

circles = g.selectAll('circle')
    .data(fibrils)
    .enter()
    .append('circle')
    .attr('cx', function(d){ return x(d.x);})
    .attr('cy', function(d){ return x(d.y);})
    .attr('r', scale(params.timepoints[0].d/2))
    .attr('fill', '#e74c3c');

function endall(transition, callback) { 
    var n = 0; 
    transition
        .each(function() { ++n; }) 
        .each('end', function() { if (!--n) callback.apply(this, arguments); });
}

function getDeltaTime(i){
   return (i > 0) ? params.timepoints[i].time - params.timepoints[i-1].time : params.timepoints[i].time; 
}

function getDelay(i){
   return (i > 0) ? getDeltaTime(i)  : 0; 
}

var i = 0,
    x1 = params.width,
    delay = 0;

function transition(){
    
    if( i >= params.timepoints.length) return;
    
    var e = params.timepoints[i],
        r = scale(e.d/2),
        t = timeScale(getDeltaTime(i));
        
    x1 += Math.sqrt(circles.size()) * r;
        
    
    console.log(t);
    
    var d = Date.now();
    
    circles
        .transition()
        .duration(t)
        .attr('r',  r)
        /*.attr('cx', function(d){
        
            var x = +this.getAttribute('cx');
            return  x * (x1/params.width);
        })
        .attr('cy', function(d){
            
            var y = +this.getAttribute('cy');
            return  y * (x1/params.width);
        })*/
        .each('end', transition);
    
    delay = t;
    //console.log(Date.now() - d, timeScale(t));
    
    i++;
}

transition(i);

/*var i = 1,
    x1 = params.width,
    tr = circles
        .transition()
        .duration(params.transition);
*/
        




/*while(i < params.timepoints.length){
    
    var r = getRadius(i);
    x1 += Math.sqrt(circles.size()) * r;
    
    tr.attr('r', r);
        .attr('cx', function(d){
        
            var x = +this.getAttribute('cx');
        
            return  x * (x1/params.width);
        })
        .attr('cy', function(d){
            
            var y = +this.getAttribute('cy');
        
            return  y * (x1/params.width);
        });
    
    i++;
}*/