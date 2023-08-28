
function visualize(data) {
  let scales = make_scales(data)
  setup_inputs(data, scales)
  data = data.filter(d => d.year == year)
  initialize(data, scales);
}

function initialize(data, scales) {
  d3.select("svg").selectAll("circle")
    .data(data, d => d.country).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy),
      fill: d => scales.fill(d.continent)
    })
}

function update_continents(ev, data, scales) {
  continents = $(ev.target).val()
  let subset = data.filter(d => continents.indexOf(d.continent) != -1 & d.year == year);

  let selection = d3.select("svg").selectAll("circle")
    .data(subset, d => d.country)
  selection.enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy),
      fill: d => scales.fill(d.continent),
    })
  selection.exit().remove()
}

function update_year(ev, data, scales) {
  year = +ev.target.value
  let subset = data.filter(d => continents.indexOf(d.continent) != -1 & d.year == year);
  d3.select("svg").selectAll("circle")
    .data(subset, d => d.country)
    .transition()
    .duration(1000)
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy)
    })
}

function setup_inputs(data, scales) {
  d3.select("#country_select")
    .on("change", (ev) => update_continents(ev, data, scales))
  d3.select("#year_slider")
    .on("change", (ev) => update_year(ev, data, scales))
}

function make_scales(data) {
  return {
    x: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.lpop)))
         .range([0, 700]),
    y: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.life_expectancy)))
         .range([500, 0]),
    fill: d3.scaleOrdinal()
      .domain([... new Set(data.map(d => d.continent))])
      .range(d3.schemeSet2)
  }
}

let year = 1965,
  continents = ["Americas", "Europe", "Africa", "Asia", "Oceania"];
d3.csv("gapminder.csv", d3.autoType)
  .then(visualize);
