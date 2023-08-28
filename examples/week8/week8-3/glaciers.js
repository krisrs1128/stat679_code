
let width = 900,
  height = 900,
  scales = {
    fill: d3.scaleQuantize()
      .domain([0, 100])
      .range(d3.schemeBlues[9])
  }

function mouseover(d) {
  d3.select("#name")
    .select("text")
    .text(d.properties.GLIMS_ID)

  d3.select("#map")
    .selectAll("path")
    .attr("stroke-width", e => e.properties.GLIMS_ID == d.properties.GLIMS_ID ? 2 : 0)
}

function visualize(data) {
  let proj = d3.geoMercator()
    .fitSize([width, height], data)
  let path = d3.geoPath()
    .projection(proj);

  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => scales.fill(d.properties.Thickness),
      "stroke-width": 0
    })
    .on("mouseover", (_, d) => mouseover(d));

  d3.select("#name")
    .append("text")
    .attr("transform", "translate(100, 100)")
    .text("hover a glacier")
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week7/week7-3/glaciers.geojson")
  .then(visualize)
