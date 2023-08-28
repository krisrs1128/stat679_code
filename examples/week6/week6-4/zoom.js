
function visualize(data) {
  let scales = make_scales([[-3.5, -3.5], [3.5, 3.5]]);
  initialize(data, scales)
  setup_brushes(data, scales)
}

function initialize(data, scales) {
  d3.select("#focus")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")

  d3.select("#focus")
    .append("rect")
    .attrs({
      fill: "white",
      x: [width - 100],
      y: 0,
      width: 100,
      height: 100
    })

  d3.select("#context")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x_zoom(d[0]),
      cy: d => scales.y_zoom(d[1])
    })

  update(scales)
}

function update(scales) {
  d3.select("#focus")
    .selectAll("circle")
    .attrs({
      cx: d => scales.x(d[0]),
      cy: d => scales.y(d[1])
    })
}

function setup_brushes(data, scales) {
  let brush = d3.brush()
    .extent([[width - 100, 0], [width, 100]])
    .on("brush", ev => brush_update(ev, scales));

  d3.select("#context")
    .append("g")
    .attr("class", "brush")
    .call(brush)
}

function brush_update(ev, scales) {
  let [[x0, y0], [x1, y1]] = ev.selection;
  x0 = scales.x_zoom.invert(x0)
  y0 = scales.y_zoom.invert(y0)
  x1 = scales.x_zoom.invert(x1)
  y1 = scales.y_zoom.invert(y1)

  let new_scale = make_scales([[x0, y0], [x1, y1]])
  update(new_scale)
}

function make_scales(extent) {
  return {
    x: d3.scaleLinear()
      .domain([extent[0][0], extent[1][0]])
      .range([0, width]),
    y: d3.scaleLinear()
      .domain([extent[0][1], extent[1][1]])
      .range([0, height]),
    x_zoom: d3.scaleLinear()
      .domain([-3.5, 3.5])
      .range([width - 100, width]),
    y_zoom: d3.scaleLinear()
      .domain([-3.5, 3.5])
      .range([0, 100])
  }
}


let generator = d3.randomNormal()
let data = d3.range(100).map(() => [generator(), generator()])
let width = 600,
    height = 600;
visualize(data)
