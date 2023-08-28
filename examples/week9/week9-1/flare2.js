
function make_tree(data) {
  data["edges"].push({to: "flare", from: null});
  let stratifier = d3.stratify()
    .id(d => d.to)
    .parentId(d => d.from),
  tree_gen = d3.tree()
    .size([600, 350]);
  return tree_gen(stratifier(data["edges"]));
}

function visualize(data) {
  tree = make_tree(data);
  let link_gen = d3.linkVertical()
    .x(d => d.x)
    .y(d => d.y);

  d3.select("#tree")
    .selectAll("path")
    .data(tree.links()).enter()
    .append("path")
    .attrs({
      d: link_gen,
      transform: "translate(0, 10)" // so doesn't go off page
    })

  d3.select("#tree")
    .selectAll("circle")
    .data(tree.descendants()).enter()
    .append("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y,
      r: d => radius(d.depth),
      fill: "#A0C3D9",
      transform: "translate(0, 10)"
    })

  neighborhoods = d3.Delaunay.from(tree.descendants().map(d => [d.x, d.y]))
  d3.select("svg").on("mousemove", (ev) => update_labels(ev, neighborhoods, tree))
}

function update_labels(ev, neighborhoods, tree) {
  let pos = d3.pointer(ev),
    ix = neighborhoods.find(pos[0], pos[1]),
    cur_node = tree.descendants()[ix]

  d3.select("#tree")
    .selectAll("circle")
    .transition()
    .duration(100)
    .attrs({
      r: (d, i) => i == ix ? 2 * radius(d.depth) : radius(d.depth),
      fill: (d, i) => i == ix ? "#364959" : "#A0C3D9"
    })

  d3.select("#labels")
    .selectAll("text")
    .text(cur_node.id)
    .attrs({
      transform: `translate(${cur_node.x}, ${cur_node.y})`
    })

}

function radius(depth) {
  return 10 * Math.exp(-.5 * depth)
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week9/week9-1/flare.json")
  .then(visualize)
