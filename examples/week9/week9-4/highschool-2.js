
function setup_simulation(data) {
  let nodes = data["nodes"],
      links = data["edges"];

  let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id)) // attracts nodes
    .force("charge", d3.forceManyBody().strength(-8)) // repels nodes
    .force("center", d3.forceCenter(300, 300)) // center of the canvas

  return {simulation: simulation, nodes: nodes, links: links}
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
      cy: d => d.y
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

function visualize(data) {
  let {simulation, nodes, links} = setup_simulation(data);
  initialize_graph(nodes, links);
  simulation.on("tick", ticked)
}

d3.json("highschool.json")
  .then(visualize)
