
function setup_simulation(data) {
  let nodes = data["nodes"],
      links = data["edges"];

  let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id)) // attracts nodes
    .force("charge", d3.forceManyBody().strength(-8)) // repels nodes
    .force("center", d3.forceCenter(300, 300)) // center of the canvas
    .tick(100); // how long to run the graph layout

  return {simulation: simulation, nodes: nodes, links: links}
}

function visualize(data) {
  let {simulation, nodes, links} = setup_simulation(data);

  d3.select("#nodes")
    .selectAll("circle")
    .data(nodes).enter()
    .append("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y
    })

  d3.select("#links")
    .selectAll("line")
    .data(links).enter()
    .append("line")
    .attrs({
      x1: d => d.source.x,
      y1: d => d.source.y,
      x2: d => d.target.x,
      y2: d => d.target.y
    })
}

d3.json("highschool.json")
  .then(visualize)
