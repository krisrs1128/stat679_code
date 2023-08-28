
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
      transform: "translate(0, 10)", // so doesn't go off page
      "stroke-width": 0.05
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

function focus_ids(cur_node) {
    descendants = cur_node.descendants().map(d => d.id)
    ancestors = cur_node.ancestors().map(d => d.id)
    return ancestors.concat(descendants)
}

function highlight(d, i, ix, focus) {
  if (i == ix) {
    return 1
  } else if (focus.indexOf(d.id) != -1) {
    return 0
  }
  return -1
}

function update_labels(ev, neighborhoods, tree) {
  let pos = d3.pointer(ev),
    ix = neighborhoods.find(pos[0], pos[1]),
    cur_node = tree.descendants()[ix],
    focus = focus_ids(cur_node)

  d3.select("#tree")
    .selectAll("circle")
    .transition().duration(100)
    .attrs({
      r: (d, i) => {
        let relevance = highlight(d, i, ix, focus)
        return relevance == 1 ? 2 * radius(d.depth) : relevance == 0 ? radius(d.depth) : .5 * radius(d.depth)
      },
      fill: (d, i) => highlight(d, i, ix, focus) >= 0 ? "#364959" : "#A0C3D9"
    })

  d3.select("#tree")
    .selectAll("path")
    .transition().duration(100)
    .attr("stroke-width", d => focus.indexOf(d.target.id) == -1 ? 0.05 : 1)

  d3.select("#labels")
    .selectAll("text")
    .text(cur_node.id)
    .attr("transform", `translate(${cur_node.x}, ${cur_node.y})`)
}

function radius(depth) {
  return 10 * Math.exp(-.5 * depth)
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week9/week9-1/flare.json")
  .then(visualize)
