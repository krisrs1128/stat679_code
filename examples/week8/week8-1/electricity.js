
function parse(data) {
  for (let i = 0; i < data.length; i++) {
    for (let t = 0; t < data[i].length; t++) {
      let dit = new Date(data[i][t].Time);
      data[i][t].Time = dit;
      data[i][t].Date = new Date(`${dit.getFullYear()}-${1 + dit.getMonth()}-${dit.getDate()}`)
      data[i][t].time_of_day = new Date("2022-01-01 " + dit.toLocaleTimeString());
    }
  }
  return data;
}

function visualize(data) {
  data = parse(data);
  let scales = make_scales(data);
  draw_line(data, scales);
  add_axes(scales);
}

function draw_line(data, scales) {
  path_generator = d3.line()
    .x(d => scales.x(d.time_of_day))
    .y(d => scales.y(d.Demand));

  d3.select("#series")
    .selectAll("path")
    .data(data).enter() // no longer add the array
    .append("path")
    .attr("d", path_generator);
}

function add_axes(scales) {
  let x_axis = d3.axisBottom()
        .scale(scales.x),
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
  let y_max = 1e4,
      x_extent = d3.extent(data[0].map(d => d.time_of_day));

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
d3.json("electricity.json")
  .then(visualize);
