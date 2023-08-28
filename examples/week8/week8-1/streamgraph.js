let data = [],
  generator = d3.randomUniform();

for (let t = 0; t < 20; t++) {
  data.push({ t: t, v1: generator(), v2: generator(), v3: generator() });
}

let scales = {
  x: d3.scaleLinear()
    .domain([0, 20])
    .range([0, 400]),
  y: d3.scaleLinear()
    .domain([0, 1.5])
    .range([200, 0]),
  fill: d3.scaleOrdinal()
    .domain(["v1", "v2", "v3"])
    .range(["#b78fec", "#ecb78f", "#8fecb7"])
}

let stack_generator = d3.stack()
  .offset(d3.stackOffsetSilhouette)
  .keys(["v1", "v2", "v3"]);

stream = stack_generator(data);
let area_generator = d3.area()
  .x(d => scales.x(d.data.t))
  .y0(d => scales.y(d[0])) // lower envelope
  .y1(d => scales.y(d[1])) // upper envelope
  .curve(d3.curveMonotoneX) // makes it smooth

d3.select("#stream")
  .selectAll("path")
  .data(stream).enter()
  .append("path")
  .attrs({
    fill: d => scales.fill(d.key),
    d: area_generator
  });
