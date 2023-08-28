console = d3.window(svg.node()).console;


function setup_simulation() {
  simulation = d3.forceSimulation(nodes)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-5))
    .force("link", d3.forceLink(links))
}

function make_scales(order) {
  return {
    fill: d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(d3.schemeCategory10),
    centrality: d3.scaleLinear()
      .domain([0, 1120])
      .range([0, 5])
  }
}

function initialize_graph(nodes, links) {
  svg.select("#nodes")
    .selectAll("circle")
    .data(nodes).enter()
    .append("circle")
  
  svg.select("#links")
    .selectAll("line")
    .data(links).enter()
    .append("line")
}

function ticked() {
  let centrality_range = data[1];
  if (centrality_range === null) {
    centrality_range = [-Math.Infinity, Math.Infinity]
  }
  
  svg.select("#nodes")
  .selectAll("circle")
  .attrs({
    cx: d => d.x,
    cy: d => d.y,
    fill: d => scales.fill(d.group)
  })
  
  svg.select("#links")
  .selectAll("line")
  .attrs({
    x1: d => d.source.x,
    y1: d => d.source.y,
    x2: d => d.target.x,
    y2: d => d.target.y,
    "stroke-width": d => scales.centrality(d.centrality),
    "stroke-opacity": d => d.centrality > centrality_range[0] ? 1 : 0.2
  })
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function drag_start(simulation, event) {
  simulation.alphaTarget(0.3).restart();
}

function drag_end(simulation, event) {
  simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}


function visualize(data) {
  if (typeof initialized === "undefined") {
    nodes = data[0]["nodes"],
    links = data[0]["links"];
    setup_simulation();
    svg.append("g").attr("id", "links")
    svg.append("g").attr("id", "nodes")
    initialized = true; 
  }
  
  initialize_graph(nodes, links);
  simulation.on("tick", ticked)
  
  let drag = d3.drag()
    .on("start", (e) => drag_start(simulation, e))
    .on("drag", dragged)
    .on("end", (e) => drag_end(simulation, e))
  svg.select("#nodes")
    .selectAll("circle")
    .call(drag)
}

let scales = make_scales()
visualize(data)