
// nice reference: https://ialab.it.monash.edu/webcola/examples/smallworldwithgroups.html

function setup_simulation(data) {
  let nodes = data["nodes"],
      links = data["edges"],
      constraints = data["constraints"],
      groups = Object.values(data["groups"])
    for (let k = 0; k < groups.length; k++) {
      groups[k].id = k;
    }

  let constrained = cola.d3adaptor()
    .linkDistance(30)
    .size([500, 500])
    .nodes(nodes)
    .links(links)
    .constraints(constraints)
    .groups(groups)
    .avoidOverlaps(true)
    .start()

  return {simulation: constrained, nodes: nodes, links: links}
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
      fill: d => scales.fill(d.year)
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

let scales = {
  fill: d3.scale.quantize()
    .domain([1800, 2000])
    .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"])
}

d3.json("royalty_sim.json", (error, graph) => visualize(graph));
