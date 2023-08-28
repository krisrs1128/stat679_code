
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

// dragging code
let drag = d3.drag()
  .on("drag", drag_fun)
d3.select("svg")
  .selectAll("circle")
  .call(drag)

function drag_fun(ev) {
  d3.select(this)
    .attrs({
      cx: d => ev.x,
      cy: d => ev.y,
    })
}
