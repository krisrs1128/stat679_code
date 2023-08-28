
// create 100 two-dimensional uniform coordinates from 0 to 500
let ix = d3.range(1000)
let generator = d3.randomUniform(0, 500)
let u = ix.map(_ =>{ return {x: generator(), y: generator(), r: 0.01 * generator()} })

// append them to the #scatter group
d3.select("#scatter")
  .selectAll("circle")
  .data(u).enter()
  .append("circle")
  .attrs({
    cx: d => d.x,
    cy: d => d.y,
    r: d => d.r
  })
