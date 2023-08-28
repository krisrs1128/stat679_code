
function f(event) {
  console.log(event.selection)
}

let brush = d3.brush().on("brush", f)
d3.select(".brush").call(brush)
