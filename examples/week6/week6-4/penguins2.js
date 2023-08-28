
function visualize(data) {
  let scales = make_scales(data)
  initialize(data, scales)
  setup_brushes(data, scales)
}

function initialize(data, scales) {
  d3.select("#circles0")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x0(d.bill_depth),
      cy: d => scales.y0(d.bill_length),
      opacity: 1,
      r: 2,
      fill: d => scales.fill(d.species)
    })

  d3.select("#circles1")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x1(d.body_mass),
      cy: d => scales.y1(d.flipper_length),
      opacity: 1,
      r: 2,
      fill: d => scales.fill(d.species)
    })
}

function setup_brushes(data, scales) {
  brushes = [
    d3.brush().extent([[0, 0], [450, 500]]).on("brush", () => brushed(data)),
    d3.brush().extent([[0, 0], [450, 500]]).on("brush", () => brushed(data))
  ];

  for (let b in brushes) {
    d3.select(`#brush${b}`).call(brushes[b])
  }

  function brushed(data) {
    // get selection in both brushes
    let s = [],
      node;
    for (let b in brushes) {
      node = d3.select(`#brush${b}`).node()
      s.push(d3.brushSelection(node))
    }

    cur_samples = []
    for (let i = 0; i < data.length; i++) {
      let di = data[i],
          passes = [false, false];
      if (s[0][0][0] < scales.x0(di.bill_depth) &&
          s[0][1][0] > scales.x0(di.bill_depth) &&
          s[0][0][1] < scales.y0(di.bill_length) &&
          s[0][1][1] > scales.y0(di.bill_length)) {
          passes[0] = true;
      } if (passes[0] &&
            s[1][0][0] < scales.x1(di.body_mass) &&
            s[1][1][0] > scales.x1(di.body_mass) &&
            s[1][0][1] < scales.y1(di.flipper_length) &&
            s[1][1][1] > scales.y1(di.flipper_length)) {
        passes[1] = true;
       }
      if (passes[0] && passes[1]) {
        cur_samples.push(i)
      }
    }

    // highlight those samples in either plot
    d3.select("#plot0")
      .selectAll("circle")
      .attrs({
        opacity: (d, i) => cur_samples.indexOf(i) == -1? 0.4 : 1,
        r: (d, i) => cur_samples.indexOf(i) == -1? 2 : 3
      })

    d3.select("#plot1")
      .selectAll("circle")
      .attrs({
        opacity: (d, i) => cur_samples.indexOf(i) == -1? 0.4 : 1,
        r: (d, i) => cur_samples.indexOf(i) == -1? 2 : 3
      })
  }
}

function make_scales(data) {
  return {
    x0: d3.scaleLinear()
      .domain(extent(data, "bill_depth"))
      .range([0, width / 2]),
    y0: d3.scaleLinear()
      .domain(extent(data, "bill_length"))
      .range([height, 0]),
    x1: d3.scaleLinear()
      .domain(extent(data, "body_mass"))
      .range([0, width / 2]),
    y1: d3.scaleLinear()
      .domain(extent(data, "flipper_length"))
      .range([height, 0]),
    fill: d3.scaleOrdinal()
      .domain(extent(data, "species"))
      .range(d3.schemeSet2)
  }
}

function parse_data(d) {
  return {
    species: d.species,
    bill_depth: +d.bill_depth_mm,
    bill_length: +d.bill_length_mm,
    body_mass: +d.body_mass_g,
    flipper_length: +d.flipper_length_mm,
  }
}

function extent(data, variable) {
  return d3.extent(data.map(d => d[variable]))
}

let height = 500,
    width = 900,
    cur_samples = d3.range(333),
    brushes;

d3.csv("penguins.csv", parse_data)
  .then(visualize)
