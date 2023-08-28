
function parse(d) {
  return {
    Year: new Date(d.Year + "-01-01"),
    Lynx: +d.Lynx
  }
}

function visualize(data) {
  let scales = make_scales(data);
  draw_line(data, scales);
  add_axes(scales);
}

function draw_line(data, scales) {
  path_generator = d3.line()
    .x(d => scales.x(d.Year))
    .y(d => scales.y(d.Lynx));

  d3.select("#line")
    .selectAll("path")
    .data([data]).enter()
    .append("path")
    .attr("d", path_generator);
}

function add_axes(scales) {
  let x_axis = d3.axisBottom()
        .scale(scales.x)
        .tickFormat(d3.timeFormat("%Y")),
      y_axis = d3.axisLeft()
        .scale(scales.y);

  d3.select("#axes")
    .append("g")
    .attrs({
      id: "x_axis",
      transform: `translate(0,${height - margins.bottom})`
    })
    .call(x_axis);

  d3.select("#axes")
    .append("g")
    .attrs({
      id: "y_axis",
      transform: `translate(${margins.left}, 0)`
    })
    .call(y_axis)
}

function make_scales(data) {
  let y_max = d3.max(data.map(d => d.Lynx)),
      x_extent = d3.extent(data.map(d => d.Year));

  return {
    x: d3.scaleTime()
         .domain(x_extent)
         .range([margins.left, width - margins.right]),
    y: d3.scaleLinear()
         .domain([0, y_max])
         .range([height - margins.bottom, margins.top])
  }
}

let width = 900,
    height = 500,
    margins = {top: 50, bottom: 50, left: 50, right: 50}
d3.csv("lynx.csv", parse)
  .then(visualize);
