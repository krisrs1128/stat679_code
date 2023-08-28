
function setup_simulation(data) {
  let nodes = data["nodes"],
      links = data["edges"];

  let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id)) // attracts nodes
    .force("charge", d3.forceManyBody().strength(-8)) // repels nodes
    .force("center", d3.forceCenter(300, 300)) // center of the canvas

  return {simulation: simulation, nodes: nodes, links: links}
}

function neighborhoods(nodes, links) {
  let result = {};
  for (let i = 0; i < nodes.length; i++) {
    result[nodes[i].index] = [nodes[i].index]
  }

  for (let i = 0; i < links.length; i++) {
    if (result[links[i].source.index]) {
      result[links[i].source.index].push(links[i].target.index)
    }
    if (result[links[i].target.index]) {
      result[links[i].target.index].push(links[i].source.index)
    }
  }

  return result
}

function initialize_graph(nodes, links) {
  neighbors = neighborhoods(nodes, links);
  d3.select("#nodes")
    .selectAll("circle")
    .data(nodes).enter()
    .append("circle")
    .on("mouseover", highlight)

  d3.select("#links")
    .selectAll("line")
    .data(links).enter()
    .append("line")
}

function highlight(e) {
  let ix = e.target.__data__.index;
  d3.select("#nodes")
    .selectAll("circle")
    .attrs({
      fill: d => neighbors[ix].indexOf(d.index) == -1 ? "black" : "red"
    })
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

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function drag_start(simulation, event) {
  if (!event.active) {
    simulation.alphaTarget(0.9).restart();
  }
}

function drag_end(simulation, event) {
  simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

function visualize(data) {
  let {simulation, nodes, links} = setup_simulation(data);
  initialize_graph(nodes, links);
  simulation.on("tick", ticked)

  let drag = d3.drag()
    .on("start", (e) => drag_start(simulation, e))
    .on("drag", dragged)
    .on("end", (e) => drag_end(simulation, e));
  d3.select("#nodes")
    .selectAll("circle")
    .call(drag)
}

let neighbors = [];
d3.json("highschool.json")
  .then(visualize)
