
function setup_simulation(data) {
  nodes = data["nodes"],
  links = data["links"];

  let simulation = d3.forceSimulation(nodes)
    .force("center", d3.forceCenter(300, 300)) // center of the canvas
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(links)) // attracts nodes

  return {simulation: simulation, nodes: nodes, links: links}
}

function make_scales(order) {
  return {
    fill: d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(d3.schemeCategory10)
  }
}

function initialize_graph(nodes, links) {
  d3.select("#nodes")
    .selectAll("circle")
    .data(nodes).enter()
    .append("circle")

  d3.select("#links")
    .selectAll("line")
    .data(links).enter()
    .append("line")
}

function ticked() {
  d3.select("#nodes")
    .selectAll("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y,
      fill: d => scales.fill(d.group),
    })

  d3.select("#links")
    .selectAll("line")
    .attrs({
      x1: d => d.source.x,
      y1: d => d.source.y,
      x2: d => d.target.x,
      y2: d => d.target.y
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

function zoomed(e) {
  d3.select("#overall")
    .attr("transform", e.transform)
}

function visualize(data) {
  let {simulation, nodes, links} = setup_simulation(data);
  initialize_graph(nodes, links);
  simulation.on("tick", ticked)

  let drag = d3.drag()
    .on("start", (e) => drag_start(simulation, e))
    .on("drag", dragged)
    .on("end", (e) => drag_end(simulation, e))
  d3.select("#nodes")
    .selectAll("circle")
    .call(drag)

  d3.select("#overall")
    .call(d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', zoomed));
}

let scales = make_scales(),
  nodes;
d3.json("miserables.json")
  .then(visualize)
