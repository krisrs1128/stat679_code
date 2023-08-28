
function visualize(data, continents, year) {
  let scales = make_scales(data)
  data = data.filter(d => d.year == year)
  console.log(continents)
  initialize(data, scales)
  update_year(continents, year, data, scales)
  update_continents(continents, year, data, scales)
}

function initialize(data, scales) {
  svg.select("#circles")
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
  let x_axis = svg.select("#axes").append("g")
      y_axis = svg.select("#axes").append("g"),
      x_title = svg.select("#axes").append("text"),
      y_title = svg.select("#axes").append("text");

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

function update_continents(continents, year, data, scales) {
  let subset = data.filter(d => continents.indexOf(d.continent) != -1 & d.year == year);

  let selection = svg.select("#circles").selectAll("circle")
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

function update_year(continents, year, data, scales) {
  let subset = data.filter(d => continents.indexOf(d.continent) != -1 & d.year == year);
  svg.select("#circles").selectAll("circle")
    .data(subset, d => d.country)
    .transition()
    .duration(1000)
    .attrs({
      cx: d => scales.x(d.lpop),
      cy: d => scales.y(d.life_expectancy)
    })
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

let margins = {left: 60, right: 60, top: 60, bottom: 60},
  year = r2d3.data.year,
  continents = r2d3.data.continents;
if (continents == null) {
  continents = ["Americas", "Europe", "Africa", "Asia", "Oceania"];
}
data = r2d3.data.gapminder;
svg.append("g").attr("id", "circles")
svg.append("g").attr("id", "axes")
visualize(data, continents, year)
