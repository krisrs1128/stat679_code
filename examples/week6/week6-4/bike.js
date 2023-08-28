
function visualize(data) {
  let scales = make_scales();
  initialize(data, scales)
  setup_brushes(data, scales)
}

function initialize(data, scales) {
  d3.select("#circles")
    .selectAll("circle")
    .data(data["scatter"]).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.temp) + jitter(),
      cy: d => scales.y(d.hum) + jitter()
    })

  let generator = d3.line()
    .x(d => scales.hour(d.hr))
    .y(d => scales.count(d.count));
  d3.select("#series")
    .selectAll("path")
    .data(data["series"]).enter()
    .append("path")
    .attrs({
      d: generator,
      stroke: "#0c0c0c"
    })
}

function setup_brushes(data, scales) {
  let brush = d3.brush()
    .extent([[0, 0], [300, 300]])
    .on("brush", ev => brush_update(ev, data, scales));

  d3.select("#brush")
    .attr("class", "brush")
    .call(brush)
}

function brush_update(ev, data, scales) {
  let dates = filter_dates(ev, data, scales);

  d3.select("#scatter")
    .selectAll("circle")
    .attrs({
      fill: d => dates.indexOf(d  .dteday) == -1? "black" : "#d27bb9"
    })

  d3.select("#series")
    .selectAll("path")
    .attrs({
      stroke: d => dates.indexOf(d[0].dteday) == -1? "black" : "#d27bb9"
    })

}

function filter_dates(ev, data, scales) {
  let [[x0, y0], [x1, y1]] = ev.selection;
  x0 = scales.x.invert(x0);
  y0 = scales.y.invert(y0);
  x1 = scales.x.invert(x1);
  y1 = scales.y.invert(y1);

  let dates = [];
  for (let i = 0; i < data.scatter.length; i++) {
    let di = data.scatter[i]
    if (di.temp > x0 && di.hum > y0 && di.temp < x1 && di.hum < y1) {
      dates.push(di.dteday)
    }
  }
  return dates
}


function make_scales() {
  // scatterplot data are already scaled
  return {
    hour: d3.scaleLinear()
      .domain([0, 23])
      .range([0, 600]),
    count: d3.scaleLinear()
      .domain([0, 1000])
      .range([height, 0]),
    x: d3.scaleLinear()
      .domain([0, 1])
      .range([0, 300]),
    y: d3.scaleLinear()
      .domain([0, 1])
      .range([0, 300])
  }
}

let width = 900,
    height = 300,
    jitter = d3.randomUniform(-2, 2);

d3.json("bike.json")
  .then(visualize);
