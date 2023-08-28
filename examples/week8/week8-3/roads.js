
let width = 900,
  height = 900;
function visualize(data) {
  let proj = d3.geoMercator()
    .fitSize([width, 1.8 * height], data)
  let path = d3.geoPath()
    .projection(proj);

  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path
    })
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week7/week7-3/brasilia.geojson")
  .then(visualize)
