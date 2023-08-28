
let circles = d3.range(10);

d3.select("svg")
  .selectAll("circle")
  .data(circles).enter()
  .append("circle")
  .attrs({
    r: 10,
    cx: d => (d + 1) * 50,
    cy: 100,
    fill: "black"
  })

circles = circles.concat([10, 11, 12])
d3.select("svg")
  .selectAll("circle")
  .data(circles)
  .join(
    enter => enter.append("circle")
      .attrs({
        r: 0,
        cx: d => (d + 1) * 50,
        cy: 100
      })
      .call(e => e.transition().duration(1000).attr("r", 10)),
    update => update.call(e => e.transition().duration(1000).attr("fill", "blue"))
  )
