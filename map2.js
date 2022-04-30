/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.7,
 margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
* init() but need access to in draw().
* All these variables are empty before we assign something to them.*/
let svg;

/**
* APPLICATION STATE
* */
let state = {
 geojson: null,
 ProvertyData: null,

 ProvertyData: null,
 hover: {
  screenPosition: null, // will be array of [x,y] once mouse is hovered on something
  mapPosition: null, // will be array of [long, lat] once mouse is hovered on something

  State_Name: null,
   Proverty_Rate: null,

 }
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
 d3.json("../Data/usState.json"),
  d3.csv("../Data/EducationandProvertyRate.csv", d3.autoType),
]).then(([geojson, PovertyRate]) => {
 // + SET STATE WITH DATA
 state.geojson = geojson
 state.ProvertyData= PovertyRate
 console.log("state: ", state);
 init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 // long/lat => x/y
 const projection = d3.geoAlbersUsa()
   .fitSize([width, height], state.geojson)

 const colorScale = d3.scaleSequential(d3.interpolateBlues)
   .domain(d3.extent(state.geojson.features, d=> d.properties.PovertyRate))

 const path = d3.geoPath(projection)


 // create an svg element in our main `d3-container` element
 svg = d3
   .select("#d3-container")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

   // base layer of states
 const states = svg.selectAll("path.states")
   .data(state.geojson.features)
   .join("path")
   .attr("stroke", "black")
   .attr("fill", d => {
     return colorScale(d.properties.PovertyRate)
   })
   .attr("d", path) 
  //  .attr("transform", d=>{
  //   console.log(d)
  //   const point = projection([d.longitude, d.latitude])
  //   return `translate(${point[0]}, ${point[1]})`
  // } )
  
  // )

  states
  .on("mousemove", event => {
    // 1. get mouse x/y position
    const {clientX, clientY} = event

    // 2. invert the projection to go from x/y => lat/long
    // ref: https://github.com/d3/d3-geo#projection_invert
    const [long, lat] = projection.invert([clientX, clientY])
    state.hover=  {
      screenPosition: [clientX, clientY], // will be array of [x,y] once mouse is hovered on something
      mapPosition: [long, lat], // will be array of [long, lat] once mouse is hovered on something
      // State_Name: d.State,
      // Proverty_Rate: d.PovertyRate,
      
      visible: true
    }
    draw();
  }).on("mouseout", event=>{
    // hide tooltip when not moused over a state
    state.hover.visible = false
    draw(); // redraw
  })

 draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this everytime there is an update to the data/state
* */
function draw() {
// add div to HTML and re-populate content every time `state.hover` updates
d3.select("#d3-container") // want to add
.selectAll('div.hover-content')
.data([state.hover])
.join("div")
.attr("class", 'hover-content')
.classed("visible", d=> d.visible)
.style("position", 'absolute')
.style("transform", d=> {
  // only move if we have a value for screenPosition
  if (d.screenPosition)
  return `translate(${d.screenPosition[0]}px, ${d.screenPosition[1]}px)`
})
.html(d=> {
  return `
  <div></div>
  <div>
  Hovered Location: ${d.mapPosition}
  </div>
  <div> State Name: ${d.State_Name}</div>
  <div> ProvertyRate: ${d3.format(",")(d.ProvertyData)}<div>`
    
})

}