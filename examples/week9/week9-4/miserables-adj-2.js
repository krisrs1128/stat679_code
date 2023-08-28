
function graph_order(data) {
  let graph = reorder.graph()
    .nodes(data["nodes"])
    .links(data["links"])
    .init();

  return reorder.spectral_order(graph)
}

function make_scales(order) {
  return {
    x: d3.scaleBand()
      .domain(order)
      .range([margins.left, 600]),
    y: d3.scaleBand()
      .domain(order)
      .range([0, 600 - margins.bottom]),
    fill: d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(d3.schemeCategory10)
  }
}

function draw_matrix(matrix, scales) {
  d3.select("#tiles")
    .selectAll("rect")
    .data(matrix).enter()
    .append("rect")
    .attrs({
      x: d => scales.x(d[0]),
      y: d => scales.y(d[1]),
      width: scales.x.bandwidth(),
      height: scales.y.bandwidth(),
      fill: d => scales.fill(d[2])
    })

}

function draw_labels(nodes, scales) {
  d3.select("#ylabels")
    .selectAll("text")
    .data(nodes).enter()
    .append("text")
    .attrs({
      fill: d => scales.fill(d.group),
      transform: d => `translate(${scales.x(d.index)}, ${600 - margins.bottom + 3})rotate(270)`
    }).text(d => d.name)

  d3.select("#xlabels")
    .selectAll("text")
    .data(nodes).enter()
    .append("text")
    .attrs({
      fill: d => scales.fill(d.group),
      transform: d => `translate(${margins.left},${scales.y(d.index)})`
    }).text(d => d.name)
}

function visualize(data) {
  let matrix = data["links"]
      .flatMap(({source, target, value}) => [
        [source, target, value],
        [target, source, value]
      ]);
  let order = graph_order(data)
  let scales = make_scales(order)
  draw_matrix(matrix, scales);
  draw_labels(data["nodes"], scales);
}

let margins = {left: 80, bottom: 80}
d3.json("miserables.json")
  .then(visualize)
