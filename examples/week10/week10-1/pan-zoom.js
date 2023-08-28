
let generator = d3.randomUniform()
let circle_data = d3.range(100).map(_ => {
  return {x: 200 * generator(), y: 200 * generator()}
})

d3.select("svg")
  .selectAll("circle")
  .data(circle_data).enter()
  .append("circle")
  .attrs({
    cx: d => d.x,
    cy: d => d.y,
    r: 5
  })

// zooming code
let zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoom_fun)
d3.select("svg").call(zoom)

function zoom_fun(ev) {
  d3.select("svg").attr("transform", ev.transform);
}
