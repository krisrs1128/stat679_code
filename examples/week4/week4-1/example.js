
test = d3.select("svg");
console.log(test)
console.log(d3.range(10))

test.selectAll("circle")
  .data(d3.range(100)).enter()
  .append("circle")
  .attrs({
    cx: d => 20 * d,
    cy: d => 20 * d,
    r: 10,
    fill: "blue"
  }).on("mouseover", changeColor);

  function changeColor(d) {
    d3.select(this)
      .attr("fill", "red")
  }
