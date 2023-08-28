
function visualize(data_list) {
  let [data, stats] = data_list;
  data = data.filter(d => d.IMDB_Rating > 0 & d.Rotten_Tomatoes_Rating > 0);
  let scales = make_scales(data, stats)
  initialize(data, stats, scales);
}

function initialize(data, stats, scales) {
  d3.select("#circles")
    .selectAll("circle")
    .data(data, d => d.Title).enter()
    .append("circle")
    .attrs({
      opacity: 1,
      r: 2,
      cx: d => scales.x1(d.IMDB_Rating),
      cy: d => scales.y1(d.Rotten_Tomatoes_Rating),
      fill: d => scales.fill(d.Genre_Group)
    })

  d3.select("#bars")
    .selectAll("rect")
    .data(stats).enter()
    .append("rect")
    .attrs({
      x: width / 2 + margins.pad + margins.text_offset,
      width: d => scales.x2(d.n),
      y: d => scales.y2(d.Genre_Group),
      height: scales.y2.bandwidth(),
      fill: d => scales.fill(d.Genre_Group)
    })
    .on("click", (ev, d) => toggle_selection(ev, d.Genre_Group))

  d3.select("#bar_labels")
    .selectAll("text")
    .data(stats.map(d => d.Genre_Group)).enter()
    .append("text")
    .attrs({
      x: width / 2 + margins.pad,
      y: d => scales.y2(d) + .75 * scales.y2.bandwidth(),
      "text-anchor": "end"
    })
    .text(d => d)

  annotations(scales)
}

function toggle_selection(ev, d) {
  let ix = selected.indexOf(d)
  if (ix == -1) {
    selected.push(d);
  } else {
    selected.splice(ix, 1)
  }
  update_view()
}

function update_view() {
  d3.select("#circles")
    .selectAll("circle")
    .transition()
    .duration(500)
    .attrs({
      opacity: d => selected.indexOf(d.Genre_Group) == -1 ? 0.4 : 1,
      r: d => selected.indexOf(d.Genre_Group) == -1 ? 1 : 2
    })

  d3.select("#bars")
    .selectAll("rect")
    .attr("fill-opacity", d => selected.indexOf(d.Genre_Group) == -1 ? 0.4 : 1)

  d3.select("#bar_labels")
    .selectAll("text")
    .attr("opacity", d => selected.indexOf(d) == -1 ? 0.4 : 1)
  }

function annotations(scales) {
  let x_axis = d3.select("#axes").append("g")
      y_axis = d3.select("#axes").append("g"),
      x_title = d3.select("#axes").append("text"),
      y_title = d3.select("#axes").append("text")

  x_axis.attr("transform", `translate(0, ${height - margins.bottom})`)
    .call(d3.axisBottom(scales.x1).ticks(4))
  y_axis.attr("transform", `translate(${margins.left}, 0)`)
    .call(d3.axisLeft(scales.y1).ticks(4))

  x_title.text("IMDB")
    .attrs({
      class: "label_title",
      transform: `translate(${0.25 * width}, ${height - 0.25 * margins.bottom})`,
    })
  y_title.text("Rotten Tomatoes")
    .attrs({
      class: "label_title",
      transform: `translate(${0.25 * margins.left}, ${0.5 * height})rotate(-90)`
    });
}

function make_scales(data, stats) {
  return {
    x1: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.IMDB_Rating)))
         .range([margins.left, 0.5 * width - margins.pad / 2]),
    y1: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.Rotten_Tomatoes_Rating)))
         .range([height - margins.bottom, margins.top]),
    x2: d3.scaleLinear()
         .domain([0, d3.max(stats.map(d => d.n))])
         .range([0, .5 * width - margins.right - margins.text_offset]),
    y2: d3.scaleBand()
          .domain([... new Set(stats.map(d => d.Genre_Group))])
          .range([height / 3, margins.top]),
    fill: d3.scaleOrdinal()
      .domain([... new Set(data.map(d => d.Genre_Group))])
      .range(d3.schemeSet3)
  }
}

let width = 700,
  height = 500,
  selected = ["Drama", "Other", "Musical", "Comedy", "Action", "Romantic Comedy",
              "Adventure", "Thriller/Suspense", "Horror"],
  margins = {left: 60, right: 60, top: 60, bottom: 60, pad: 60, text_offset: 5};

  Promise.all([
      d3.csv("movies.csv", d3.autoType),
      d3.csv("stats.csv", d3.autoType),
  ]).then(visualize)
