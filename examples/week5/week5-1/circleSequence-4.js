
let circles = d3.range(10);

d3.select("svg")
  .selectAll("circle")
  .data(circles).enter()
  .append("circle")
  .attrs({
    r: 10,
    cx: d => (d + 1) * 50,
    cy: 100,
  })

circles = circles.concat([10, 11, 12])
d3.select("svg")
  .selectAll("circle")
  .data(circles).enter()
  .append("circle")
  .attrs({
    cx: d => (d + 1) * 50,
    cy: 100,
    r: 0,
    fill: "red"
  })
  .transition()
  .duration(2000)
  .attr("r", 10)
