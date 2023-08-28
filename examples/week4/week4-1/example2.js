
delay = 100
u = d3.randomUniform(1, 500);
e = d3.randomUniform(-10, 10);
iter = 0

data = [];
for (var i = 0; i < 10; i++) {
  data.push({x: 0, y: 250});
}

console.log(data);

d3.select("svg")
  .selectAll("circle")
  .data(data).enter()
  .append("circle")
  .attrs({
    cx: d => d.x,
    cy: d => d.y,
    r: 4,
    fill: "#d3d3d3"
  })

function animate() {
  console.log("animating!")
  data = data.map(d => { return {"x": d.x + e(1), "y": d.y + e(1)} });
  d3.selectAll("circle")
    .data(data)
    .transition()
    .duration(delay)
    .ease(d3.easeLinear)
    .attrs({
      cx: d => iter,
      cy: d => d.y,
    })
  d3.timeout(animate, delay)
  iter += 1;
}

animate()
