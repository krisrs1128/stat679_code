
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
      r: d => 10 * Math.exp(-.5 * d.depth), // decreasing sizes
      transform: "translate(0, 10)"
    })
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week9/week9-1/flare.json")
  .then(visualize)
