
function setup_simulation(data) {
  nodes = data["nodes"],
  links = data["links"];

  let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links)) // attracts nodes
    .force("charge", d3.forceManyBody().strength(-20)) // repels nodes
    .force("center", d3.forceCenter(300, 300)) // center of the canvas

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

  d3.select("#hulls")
    .selectAll("path")
    .data(convex_hull(nodes)).enter()
    .append("path")
}

function ticked() {
  d3.select("#nodes")
    .selectAll("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y,
      fill: d => scales.fill(d.group)
    })

  d3.select("#links")
    .selectAll("line")
    .attrs({
      x1: d => d.source.x,
      y1: d => d.source.y,
      x2: d => d.target.x,
      y2: d => d.target.y
    })

  let path_generator = d3.line()
    .curve(d3.curveCatmullRomClosed)
    .x(d => d[0])
    .y(d => d[1])

  d3.select("#hulls")
    .selectAll("path")
    .data(convex_hull(nodes))
    .attrs({
      d: path_generator,
      fill: (d, i) => scales.fill(i)
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

function convex_hull(nodes) {
  let unique_groups = new Set(nodes.map(d => d.group)),
      group_coord = {};

  // add small buffered squares around the nodes
  for (let i = 0; i < nodes.length; i++) {
    if (group_coord[nodes[i].group]) {
      group_coord[nodes[i].group].push([nodes[i].x - offset, nodes[i].y - offset])
      group_coord[nodes[i].group].push([nodes[i].x - offset, nodes[i].y + offset])
      group_coord[nodes[i].group].push([nodes[i].x + offset, nodes[i].y - offset])
      group_coord[nodes[i].group].push([nodes[i].x + offset, nodes[i].y + offset])
    } else {
      group_coord[nodes[i].group] = [
        [nodes[i].x - offset, nodes[i].y - offset],
        [nodes[i].x - offset, nodes[i].y + offset],
        [nodes[i].x + offset, nodes[i].y - offset],
        [nodes[i].x + offset, nodes[i].y + offset]
      ]
    }
  }

  return Object.values(group_coord).map(d3.polygonHull)
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

let scales = make_scales(),
  nodes,
  offset = 10;
d3.json("miserables.json")
  .then(visualize)
