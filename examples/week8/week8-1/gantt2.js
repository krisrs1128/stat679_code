
let height = 300,
  width = 500,
  collapsed = false;

function make_scales(data) {
  let ids = data.map(d => d.id)
  let dateExtent = d3.extent(
    d3.merge([data.map(d => d.startDate), data.map(d => d.endDate)])
  )

  return {
    y: d3.scaleBand()
      .domain(ids)
      .range([0.9 * height, 0]),
    x: d3.scaleTime()
      .domain(dateExtent)
      .range([0, width])
    }
}

function visualize(data) {
  let scales = make_scales(data)
  d3.select("#rects")
    .selectAll("rect")
    .data(data).enter()
    .append("rect")
    .attrs({
      height: 8,
      x: d => scales.x(d.startDate),
      y: d => scales.y(d.id),
      width: d => {
        const w = Math.round(scales.x(d.endDate) - scales.x(d.startDate));
        return w < 2 || isNaN(w) ? 2 : w;
      }
    })
    .on("mousemove", (ev, d) => mousemove(ev, d, scales));

  d3.select("button")
    .on("click", ev => toggle_collapse(scales))

  let x_axis = d3.axisBottom(scales.x)
  d3.select("#x_axis")
    .attr("transform", `translate(0, ${0.9 * height})`)
    .call(x_axis)
}

function mousemove(ev, d, scales) {
  if (collapsed)  return;
  d3.select("#tooltip")
    .attrs({
      transform: `translate(${scales.x(d.endDate) + 5},${scales.y(d.id) + scales.y.bandwidth() * 0.5})`
    })
    .select("text")
    .text(d.id)
}

function toggle_collapse(scales) {
  if (collapsed) {
    collapsed = false;
    uncollapse(scales);
  } else {
    collapsed = true;
    collapse();
  }
}

function collapse() {
  d3.select("#rects")
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attr("y", 0)

  d3.select("#x_axis")
    .transition()
    .duration(1000)
    .attr("transform", "translate(0, 8)")

  d3.select("#tooltip").select("text").text("")
}

function uncollapse(scales) {
  d3.select("#rects")
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attr("y", d => scales.y(d.id))

  d3.select("#x_axis")
    .transition()
    .duration(1000)
    .attr("transform", `translate(0, ${0.9 * height})`)
}

d3.csv("311.csv", d3.autoType)
  .then(visualize)
