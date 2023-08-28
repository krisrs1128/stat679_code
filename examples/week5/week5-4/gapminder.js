
function visualize(data) {
  scales = make_scales(data)
  data = data.filter(d => d.year == 1965)

  d3.select("svg")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy),
      fill: d => scales.fill(d.continent)
     })
}

function make_scales(data) {
  return {
    y: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.life_expectancy)))
         .range([0, 500]),
    x: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.lpop)))
         .range([0, 700]),
    fill: d3.scaleOrdinal()
      .domain([... new Set(data.map(d => d.continent))])
      .range(d3.schemeSet2)
  }
}

function parse_row(d) {
  return {
    country: d.country,
    continent: d.continent,
    year: +d.year,
    lpop: +d.lpop,
    life_expectancy: +d.life_expectancy
  }
}

d3.csv("gapminder.csv", parse_row)
  .then(visualize);
