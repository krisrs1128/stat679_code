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

function tile_hover(e, d) {
  let [source, target, _] = d

  d3.select("#tiles")
    .selectAll("rect")
    .attr("stroke-width", d => (d[0] == source || d[1] == target) ? 2 : 0)

  d3.select("#xlabels")
    .selectAll("text")
    .attrs({
      "font-size": d => d.index == target? 14 : 10,
      "opacity": d => neighbors[source].indexOf(d.index) == -1? 0 : 1
    })

  d3.select("#ylabels")
    .selectAll("text")
    .attrs({
      "font-size": d => d.index == source? 14 : 10,
      "opacity": d => neighbors[target].indexOf(d.index) == -1? 0 : 1
    })
}

function reset() {
  let defaults = {"font-size": 8, "opacity": 1}
  d3.selectAll("#xlabels")
    .selectAll("text")
    .attrs(defaults)

  d3.selectAll("#ylabels")
    .selectAll("text")
    .attrs(defaults)
}

function draw_matrix(matrix, scales) {
  d3.select("#tiles")
    .selectAll("rect")
    .data(matrix).enter()
    .append("rect")
    .attrs({
      x: d => scales.x(d[0]),
      y: d => scales.y(d[1]) - scales.y.bandwidth(),
      width: scales.x.bandwidth(),
      height: scales.y.bandwidth(),
      fill: d => scales.fill(d[2])
    })
    .on("mouseover", (e, d) => tile_hover(e, d))
}

function draw_labels(nodes, scales) {
  d3.select("#ylabels")
    .selectAll("text")
    .data(nodes).enter()
    .append("text")
    .attrs({
      "font-size": 8,
      fill: d => scales.fill(d.group),
      transform: d => `translate(${scales.x(d.index)}, ${600 - margins.bottom + 3})rotate(270)`
    }).text(d => d.name)

  d3.select("#xlabels")
    .selectAll("text")
    .data(nodes).enter()
    .append("text")
    .attrs({
      "font-size": 8,
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
  neighbors = neighborhoods(data["nodes"], data["links"]);
  draw_matrix(matrix, scales);
  draw_labels(data["nodes"], scales);
}

let margins = {left: 80, bottom: 80},
  neighbors;
d3.json("miserables.json")
  .then(visualize)
