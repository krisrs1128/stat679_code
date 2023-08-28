
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
