function d3Pie(dataSet, element) {
  var w = 350, h = 350,   outerRadius = 120,  color = d3.scale.category20(); 

  var svg = d3.select(element)
  .append("svg:svg") 
  .data([dataSet]) 
  .attr("width", w) 
  .attr("height", h) 
  .append("svg:g") 
  .attr("transform", "translate(" + 1.5*outerRadius + "," + 1.5*outerRadius + ")");

  var arc = d3.svg.arc().outerRadius(outerRadius);

  var pie = d3.layout.pie() 
  .value(function(d) { return d.magnitude }) 
  .sort( function(d) { return null; } );

  var arcs = svg.selectAll("g.slice")
  .data(pie)
  .enter()
  .append("svg:g")
  .attr("class", "slice");

  arcs.append("svg:path")
  .attr("fill", function(d, i) { return color(i); } ).attr("d", arc);

  arcs.append("svg:text")
  .attr("transform", function(d) {
  d.outerRadius = outerRadius + 50; 
  d.innerRadius = outerRadius + 45; 
  return "translate(" + arc.centroid(d) + ")";
  })
  .attr("text-anchor", "middle") 
  .style("fill", "Purple")
  .style("font", "bold 12px Arial")
  .text(function(d, i) { return dataSet[i].legendLabel; });

  arcs.filter(function(d) { return d.endAngle - d.startAngle > .0; }).append("svg:text")
  .attr("dy", "1em")
  .attr("text-anchor", "middle")
  .attr("transform", function(d) { 
  d.outerRadius = outerRadius; 
  d.innerRadius = outerRadius/2; 
  return "translate(" + arc.centroid(d) + ")";
  })
  .style("fill", "Black")
  .style("font", "bold 12px Arial")
  .text(function(d) { return d.data.magnitude; });

  // Computes the angle of an arc, converting from radians to degrees.
  function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
  }
}

function d3Bar(data) {
  var additional = data.length * 5;
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
  w = 960 - margin.left - margin.right + additional,
  h = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, w], .1);

  var y = d3.scale.linear()
      .range([h, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");

  var svg = d3.select("#barAts").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.key; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("# of games");

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.key); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return h - y(d.value); });

  function type(d) {
    d.value = +d.value;
    return d;
  }
}