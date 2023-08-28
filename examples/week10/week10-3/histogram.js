console = d3.window(svg.node()).console;

function make_scales() {
  return {
    x: d3.scaleBand()
      .domain(d3.range(100))
      .range([0, width]),
    y: d3.scaleLinear()
      .domain([0, 100])
      .range([0, height])
  }
}

function visualize(data) {
  let brush = d3.brushX()
    .extent([[0, 0], [width, scales.y.range()[1]]])
    .on('brush', brushed)

   svg.select("#bars")
      .selectAll("rect")
      .data(data).enter()
      .append("rect")
      .attrs({
        x: d => scales.x(d.bin_ix),
        y: d => height - scales.y(d.n),
        height: d => scales.y(d.n),
        width: scales.x.bandwidth()
      })

  svg.select("#background")
    .call(brush)
}

function brushed(event) {
  let bin_ix = event.selection.map(d => Math.floor(d / scales.x.step()))
  let centralities = [
    data.filter(d => d.bin_ix == bin_ix[0])[0].bin_start,
    data.filter(d => d.bin_ix == bin_ix[1] + 1)[0].bin_start
  ]

  Shiny.setInputValue("centrality_range", centralities, {priority: "event"});
  svg.select("#bars")
    .selectAll("rect")
    .attrs({
      "fill-opacity": d => d.bin_start >= centralities[0] && d.bin_start <= centralities[1]? 1: 0.3
    })
}

let scales = make_scales();
console.log(data)
svg.append("g")
  .attr("id", "background")
  .append("g")
  .attr("id", "bars")
visualize(data)
