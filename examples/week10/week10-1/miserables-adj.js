
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
      .range([0, 600]),
    fill: d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(d3.schemeCategory10)
  }
}

function draw_matrix(matrix, scales) {
  d3.select("#graph")
    .selectAll("rect")
    .data(matrix).enter()
    .append("rect")
    .attrs({
      x: d => scales.x(d[0]),
      y: d => scales.x(d[1]),
      width: scales.x.bandwidth(),
      height: scales.x.bandwidth(),
      fill: d => scales.fill(d[2])
    })
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
}

d3.json("miserables.json")
  .then(visualize)
