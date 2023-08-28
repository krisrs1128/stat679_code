

function visualize(data) {
  let scales = make_scales(data)
  initialize(data, scales)
}

function initialize(data, scales) {
  d3.select("#circles0")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x0(d.bill_depth_mm),
      cy: d => scales.y0(d.bill_length_mm),
      opacity: 1,
      r: 2,
      fill: d => scales.fill(d.species)
    })

  d3.select("#circles1")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x1(d.body_mass_g),
      cy: d => scales.y1(d.flipper_length_mm),
      opacity: 1,
      r: 2,
      fill: d => scales.fill(d.species)
    })

  brushes = [
    d3.brush().on("brush", ev => brushed(ev, data, 0)),
    d3.brush().on("brush", ev => brushed(ev, data, 1))
  ];

  for (let b in brushes) {
    d3.select(`#brush${b}`).call(brushes[b])
  }

  function brushed(ev, data, b) {
    // clear the other brush
    let opposite = d3.select(`#brush${(b + 1) % 2}`)
    let has_brush = d3.brushSelection(opposite.node())
    if (!(has_brush === null)) {
        opposite.call(brushes[(b + 1) % 2].move, null)
    }

    // get selection in current brush
    let node = d3.select(`#brush${b}`).node()
    let [[x0, y0], [x1, y1]] = d3.brushSelection(node)

    x0 = scales[`x${b}`].invert(x0)
    x1 = scales[`x${b}`].invert(x1)
    y0 = scales[`y${b}`].invert(y0)
    y1 = scales[`y${b}`].invert(y1)

    cur_samples = []
    for (let i = 0; i < data.length; i++) {
      let di = data[i]
      if (b == 0 && x0 < di.bill_depth_mm && x1 > di.bill_depth_mm && y0 > di.bill_length_mm && y1 < di.bill_length_mm) {
        cur_samples.push(i)
      } else if (b == 1 && x0 < di.body_mass_g && x1 > di.body_mass_g && y0 > di.flipper_length_mm && y1 < di.flipper_length_mm) {
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
      .domain(extent(data, "bill_depth_mm"))
      .range([0, width / 2]),
    y0: d3.scaleLinear()
      .domain(extent(data, "bill_length_mm"))
      .range([height, 0]),
    x1: d3.scaleLinear()
      .domain(extent(data, "body_mass_g"))
      .range([0, width / 2]),
    y1: d3.scaleLinear()
      .domain(extent(data, "flipper_length_mm"))
      .range([height, 0]),
    fill: d3.scaleOrdinal()
      .domain(extent(data, "species"))
      .range(d3.schemeSet2)
  }
}

function extent(data, variable) {
  return d3.extent(data.map(d => d[variable]))
}

let height = 500,
    width = 900,
    cur_samples = d3.range(333),
    brushes;

d3.csv("penguins.csv", d3.autoType)
  .then(visualize)
