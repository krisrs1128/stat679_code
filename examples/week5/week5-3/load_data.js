
function visualize(data) {
  data = data.filter(d => d.year == 1965)
  d3.select("svg")
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attrs({
      cx: d => 10 * d.lpop,
      cy: d => d.life_expectancy,
      r: 2
     })
}

d3.csv("gapminder.csv", d3.autoType)
  .then(visualize);
