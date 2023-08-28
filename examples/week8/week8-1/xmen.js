function make_scales() {
  return {
    x: d3.scaleLinear()
      .domain([97, 280])
      .range([0, 400]),
    y: d3.scaleLinear()
      .domain([0, 65])
      .range([200, 0]),
    fill: d3.scaleOrdinal()
      .domain(keys)
      .range(["#8E038E", "#D505D5", "#C20008", "#FF020D", "#13AFEF", "#4EC3F3", "#595A52", "#73756A", "#FFB400", "#FFC740"])
  }
}

function reshape_array(data) {
  let stack_generator = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys);
  return stack_generator(data);
}

function draw(stream) {
  let scales = make_scales()
  let area_generator = d3.area()
    .x(d => scales.x(d.data.issue))
    .y0(d => scales.y(d[0])) // lower envelope
    .y1(d => scales.y(d[1])) // upper envelope
    .curve(d3.curveBasis) // makes it smooth

  d3.select("#stream")
    .selectAll("path")
    .data(stream).enter()
    .append("path")
    .attrs({
      fill: d => scales.fill(d.key),
      d: area_generator
    });
}

function visualize(data) {
  console.log(data)
  let stream = reshape_array(data);
  console.log(stream)
  draw(stream);
}

const keys = ['Gambit_Costume', 'Gambit_Non-Costume', 'Magneto_Costume', 'Magneto_Non-Costume', 'Nightcrawler_Costume', 'Nightcrawler_Non-Costume', 'Storm_Costume', 'Storm_Non-Costume', 'Wolverine_Costume', 'Wolverine_Non-Costume']
d3.csv("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week8/week8-1/xmen-wide.csv", d3.autoType)
  .then(visualize);
