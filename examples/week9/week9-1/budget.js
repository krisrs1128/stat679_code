
function make_root(data) {
  data.push({to: "flare", from: null, size: 0});
  return d3.stratify()
    .id(d => d.to)
    .parentId(d => d.from)(data);
}

function visualize(data) {
  let root = make_root(data);
  root.sum(d => +d.size);
  tree_gen = d3.treemap()
    .size([600, 600]);
  let tree = tree_gen(root);

  d3.select("#tree")
    .selectAll("rect")
    .data(tree.leaves()).enter()
    .append("rect")
    .attrs({
      left: d => d.x0,
      top: d => d.y0,
      width: d => d.x1 - d.x0,
      height: d => d.y1 - d.y0,
    })
}

d3.csv("flare_treemap.csv", d3.autoType)
  .then(visualize)
