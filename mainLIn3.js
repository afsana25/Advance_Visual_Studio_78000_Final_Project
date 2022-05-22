// Global variable declaration of regression line equation
var regression;

var margin = {top: 30, right: 50, bottom: 30, left: 50},
    width = innerWidth-100,
    height = innerHeight - 300;
    var result;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("EducationandProvertyRate.csv", function(error, data) {
  if (error) throw error;
result=data;

  data.forEach(function(d) {
    d.educationScore = +d.educationScore;
    d.PerCapita = +d.PerCapita;
    d.PerCapita=+d.PerCapita;
  });

  //for tool tip 
  d3.select("body").append("div").attr("class","tooltip");



  x.domain(d3.extent(data, function(d) { return d.PerCapita; })).nice();
  y.domain(d3.extent(data, function(d) { return d.educationScore; })).nice();



var XaxisData = data.map(function(d) { return d.PerCapita; });
var YaxisData = data.map(function(d) { return d.educationScore; });
regression=leastSquaresequation(XaxisData,YaxisData);




var line = d3.svg.line()
    .x(function(d) { return x(d.PerCapita); })
    .y(function(d) { return y(regression(d.PerCapita)); });


  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("PerCapita");


      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -300)
      .style("text-anchor", "end")
      .text("y = 0.0013x - 23.713;  R² = 0.6167 ");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("educationScore")

     
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      // .attr("opacity",0.5)
      .attr("r", function(d){return Math.sqrt((d.PerCapita)*0.001)})
      .attr("cx", function(d) { return x(d.PerCapita); })
      .attr("cy", function(d) { return y(d.educationScore); })
      .style("fill", function(d) { return color(d.Criteria)}).
      style("stroke"," lightgrey" ).style("stroke-width","1px");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .on("mousemove",function(){
        d3.select(".tooltip").style("left",function(d){return (d3.event.pageX+10)+"px"}).style("top",function(d){ return (d3.event.pageY-50)+"px"});
        d3.select(".tooltip").style("visibility","visible");
        CompEducationScore=parseFloat(regression(x.invert(d3.event.pageX-svg.node().getBoundingClientRect().left-margin.left))).toFixed(3);
        d3.select(".tooltip").text("Computed Education Score is "+CompEducationScore)
        
      })
      .on("mouseout",function(){
          d3.select(".tooltip").style("visibility","hidden");

      });

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});




function leastSquaresequation(XaxisData, Yaxisdata) {
    var ReduceAddition = function(prev, cur) { return prev + cur; };
    
    // finding the mean of Xaxis and Yaxis data
    var xBar = XaxisData.reduce(ReduceAddition) * 1.0 / XaxisData.length;
    var yBar = Yaxisdata.reduce(ReduceAddition) * 1.0 / Yaxisdata.length;

    var SquareXX = XaxisData.map(function(d) { return Math.pow(d - xBar, 2); })
      .reduce(ReduceAddition);
    
    var ssYY = Yaxisdata.map(function(d) { return Math.pow(d - yBar, 2); })
      .reduce(ReduceAddition);
      
    var MeanDiffXY = XaxisData.map(function(d, i) { return (d - xBar) * (Yaxisdata[i] - yBar); })
      .reduce(ReduceAddition);
      
    var slope = MeanDiffXY / SquareXX;
    var intercept = yBar - (xBar * slope);
    
// returning regression function
    return function(x){
      return x*slope+intercept
    }

  }