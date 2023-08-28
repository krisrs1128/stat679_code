
function visualize(data) {
  let scales = make_scales(data)
  setup_inputs(data, scales)
  data = data.filter(d => d.year == year)
  initialize(data, scales);
}

function initialize(data, scales) {
  d3.select("#circles")
    .selectAll("circle")
    .data(data, d => d.country).enter()
    .append("circle")
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy),
      fill: d => scales.fill(d.continent)
    })

  annotations(scales)
}

function annotations(scales) {
  let x_axis = d3.select("#axes").append("g")
      y_axis = d3.select("#axes").append("g"),
      x_title = d3.select("#axes").append("text"),
      y_title = d3.select("#axes").append("text");

  x_axis.attr("transform", `translate(0, ${height - margins.bottom})`)
    .call(d3.axisBottom(scales.x).ticks(4))
  y_axis.attr("transform", `translate(${margins.left}, 0)`)
    .call(d3.axisLeft(scales.y).ticks(4))

  x_title.text("log(Population)")
    .attrs({
      class: "label_title",
      transform: `translate(${0.5 * width}, ${height - 0.25 * margins.bottom})`,
    })
  y_title.text("Life Expectancy")
    .attrs({
      class: "label_title",
      transform: `translate(${0.25 * margins.left}, ${0.5 * height})rotate(-90)`
    });
}

function update_continents(ev, data, scales) {
  continents = $(ev.target).val()
  let subset = data.filter(d => continents.indexOf(d.continent) != -1 & d.year == year);

  let selection = d3.select("#circles").selectAll("circle")
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
  d3.select("#circles").selectAll("circle")
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
         .range([margins.left, width - margins.right]),
    y: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.life_expectancy)))
         .range([height - margins.bottom, margins.top]),
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

let width = 700,
  height = 500,
  year = 1965,
  continents = ["Americas", "Europe", "Africa", "Asia", "Oceania"],
  margins = {left: 60, right: 60, top: 60, bottom: 60};
d3.csv("gapminder.csv", parse_row)
  .then(visualize);
