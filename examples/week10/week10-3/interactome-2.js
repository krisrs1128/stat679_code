
function setup_simulation(nodes, links) {
  simulation = d3.forceSimulation(nodes)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("link", d3.forceLink(links_sub))
}

function make_scales(order) {
  return {
    fill: d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(d3.schemeCategory10),
    centrality: d3.scaleLinear()
      .domain([0, 1120])
      .range([0, 5]),
    x: d3.scaleBand()
      .domain(d3.range(100))
      .range([0.85 * width, width]),
    y: d3.scaleLinear()
      .domain([0, 100])
      .range([0, 0.2 * height])
  }
}

function initialize_graph(nodes, links) {
  svg.select("#nodes")
    .selectAll("circle")
    .data(nodes).enter()
    .append("circle")

  svg.select("#links")
    .selectAll("line")
    .data(links_sub).enter()
    .append("line")
}

function initialize_histogram(centralities) {
  let brush = d3.brushX()
    .extent([[scales.x.range()[0] + 2, scales.y.range()[0]], [scales.x.range()[1] - 10, scales.y.range()[1]]])
    .on('brush', (e) => brushed(e, centralities))

  d3.select("#background")
    .append("rect")
    .attrs({
      id: "background",
      x: scales.x.range()[0],
      y: scales.y.range()[0],
      fill: "white",
      width: scales.x.range()[1] - scales.x.range()[0],
      height: scales.y.range()[1] - scales.y.range()[0]
    })
  svg.call(brush)
  svg.select("#bars")
     .selectAll("rect")
     .data(centralities).enter()
     .append("rect")
     .attrs({
       x: d => scales.x(d.bin_ix),
       y: d => scales.y.range()[1] - scales.y(d.n),
       height: d => scales.y(d.n),
       width: scales.x.bandwidth()
     })
}

function ticked() {
  if (typeof centrality_range === "undefined") {
    centrality_range = [-Math.Infinity, Math.Infinity]
  }

  svg.select("#nodes")
  .selectAll("circle")
  .attrs({
    cx: d => d.x,
    cy: d => d.y,
    fill: d => scales.fill(d.group)
  })

  let sel = svg.select("#links")
    .selectAll("line")
    .data(links_sub, d => d.index)

  simulation.force("link").links(links_sub)
  sel.enter().append("line")
  sel.exit().remove()

  svg.select("#links")
    .selectAll("line")
    .attrs({
      x1: d => d.source.x,
      y1: d => d.source.y,
      x2: d => d.target.x,
      y2: d => d.target.y,
      "stroke-width": d => scales.centrality(d.centrality),
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

function brushed(event, centralities) {
  simulation.alphaTarget(0.3).restart();
  let bin_ix = event.selection.map(d => Math.floor((d - scales.x.range()[0]) / scales.x.step()))
  centrality_range = [
    centralities.filter(d => d.bin_ix == bin_ix[0])[0].bin_start,
    centralities.filter(d => d.bin_ix == bin_ix[1] + 1)[0].bin_start
  ]

  links_sub = links.filter(d => d.centrality > centrality_range[0] && d.centrality < centrality_range[1]);
  svg.select("#bars")
    .selectAll("rect")
    .attrs({
      "fill-opacity": d => d.bin_start >= centrality_range[0] && d.bin_start <= centrality_range[1]? 1: 0.3
    })
}


function visualize(data_list) {
  [centralities, graph] = data_list
  links_sub = graph["links"]
  links = graph["links"]
  setup_simulation(graph["nodes"], links)
  initialize_graph(graph["nodes"], links)
  initialize_histogram(centralities)
  simulation.on("tick", ticked)

  let drag = d3.drag()
    .on("start", (e) => drag_start(simulation, e))
    .on("drag", dragged)
    .on("end", (e) => drag_end(simulation, e))
  svg.select("#nodes")
    .selectAll("circle")
    .call(drag)
}

let width = 600,
  height = 600,
  scales = make_scales(),
  svg = d3.select("#graph"),
  centrality_range,
  links_sub,
  links,
  simulation;
Promise.all([
    d3.json("centrality_bins.json"),
    d3.json("interactome.json")
]).then(visualize)
