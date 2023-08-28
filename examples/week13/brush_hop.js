
function make_scales() {
  return {
    x: d3.scaleLinear()
      .domain([-2, 2.4])
      .range([0, 400]),
    y: d3.scaleLinear()
      .domain([-1.7, 3])
      .range([400, 0]),
    u1: d3.scaleLinear()
      .domain([-12, 12])
      .range([0, 200]),
    u2: d3.scaleLinear()
      .domain([-10, 9])
      .range([0, 200])
  }
}

function draw_scatter(supernova, scales) {
  d3.select("#dataset")
    .selectAll("circle")
    .data(supernova).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.E3),
      cy: d => scales.y(d.Magnitude)
    })
}

function draw_outcomes(lines, scales) {
  let line_gen = d3.line()
    .curve(d3.curveBasis)
    .x(d => scales.x(d.E3))
    .y(d => scales.y(d.Magnitude))

  d3.select("#hops")
    .selectAll("path")
    .data(lines).enter()
    .append("path")
    .attrs({
      d: line_gen,
      stroke: "#C1CED9",
      "stroke-width": 0.8,
      opacity: .4
    })
}

function draw_PC(coords, scales) {
  d3.select("#coords")
    .selectAll("circle")
    .data(coords).enter()
    .append("circle")
    .attrs({
      fill: "#585859",
      cx: d => scales.u1(d.PC1),
      cy: d => scales.u2(d.PC2)
    })

  let brush = d3.brush()
    .extent([[0, 0], [200, 200]])
    .on("brush", ev => highlight(ev, scales, coords))
  d3.select("#brush").call(brush)
}

function selected_draws(bounds, scales, coords) {
  let result = [];
  for (let i = 0; i < coords.length; i++) {
    ci = coords[i]
    if (scales.u1(ci.PC1) > bounds[0][0] &
        scales.u1(ci.PC1) < bounds[1][0] &
        scales.u2(ci.PC2) > bounds[0][1] &
        scales.u2(ci.PC2) < bounds[1][1]) {
          result.push(coords[i].id)
    }
  }
  return result;
}

function highlight(ev, scales, coords) {
  let draws = selected_draws(ev.selection, scales, coords)
  d3.select("#coords")
    .selectAll("circle")
    .attrs({ fill: d => draws.indexOf(d.id) == -1? "#585859" : "#73020C" })

  d3.select("#hops")
    .selectAll("path")
    .attrs({
      stroke: d => draws.indexOf(d[0][".draw"]) == -1? "#C1CED9" : "#73020C",
      "stroke-width": d => draws.indexOf(d[0][".draw"]) == -1? 0.5 : 2,
      opacity: d => draws.indexOf(d[0][".draw"]) == -1? 0.4 : 1,
    })
}

function reshape_lines(lines) {
  let result = {}
  for (let i = 0; i < lines.length; i++) {
    result[lines[i][".draw"]] = [];
  }

  for (let i = 0; i < lines.length; i++) {
    result[lines[i][".draw"]].push(lines[i]);
  }

  return Object.values(result);
}

function visualize(data) {
  [PC, lines0, supernova] = data
  let lines = reshape_lines(lines0)
  let scales = make_scales()
  draw_scatter(supernova, scales)
  draw_outcomes(lines, scales)
  draw_PC(PC, scales)
}

Promise.all([
  d3.csv("draw_coords.csv", d3.autoType),
  d3.csv("outcomes.csv", d3.autoType),
  d3.csv("supernova.csv", d3.autoType)
]).then(visualize)
