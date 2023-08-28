function init_array(size, init_v) {
  var result = [];
  for (i = 0; i < size; i += 1) {
    result.push(init_v);
  }
  return result;
}

var GRID = 5,
WALK_H = 280,
WALK_W = 2 * WALK_H,
PLOT_H = 1.5 * WALK_H / 2,
POINT_R = 4,
delay = 10,
result_cnt = init_array(WALK_W / GRID, 0),
svg = d3.select("body").append("svg:svg")
  .attr("width", WALK_W)
  .attr("height", WALK_H + PLOT_H + POINT_R),
// From
// https://github.com/mbostock/d3/blob/master/lib/colorbrewer/colorbrewer.js
// colorbrewer.Oranges[9]
// See https://github.com/mbostock/d3/blob/master/lib/colorbrewer/LICENSE
PALETE = ["rgb(255,245,235)", "rgb(254,230,206)", "rgb(253,208,162)",
          "rgb(253,174,107)", "rgb(253,141,60)", "rgb(241,105,19)",
          "rgb(217,72,1)","rgb(166,54,3)", "rgb(127,39,4)"].reverse();

walk(WALK_W / 2, 0);

function append_result(final_x) {
  var result_idx = final_x / GRID;
  svg.append("svg:circle")
    .attr("cx", final_x)
    .attr("cy", WALK_H + POINT_R)
    .attr("r", POINT_R)
    .style("fill", "aliceblue")
    //.style("opacity", 0.85)
    .transition()
    // Move the result point to the bottom of the plot.
    .attr("cy", WALK_H + PLOT_H - 2 * POINT_R * result_cnt[result_idx] )
    .duration(3000);
  result_cnt[result_idx] += 1;
}

function walk(x, y) {
  var x_end, y_end = y + GRID;
  if (Math.random() < 0.5) {
    x_end = x + GRID;
  } else {
    x_end = x - GRID;
  }
  line = svg.select('line[x1="' + x + '"][x2="' + x_end + '"]'+
                    '[y1="' + y + '"][y2="' + y_end + '"]');
  if (line.empty()) {
    // Create a new line segment
    svg.append("svg:line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x_end)
      .attr("y2", y_end)
      .style("stroke", PALETE[0])
      .style("stroke-width", 2)
      .datum(0);
  } else {
    // or alter color of an existing line.
    var color_idx = Math.min(line.datum() + 1, PALETE.length - 1);
    line.style('stroke', PALETE[color_idx])
      .datum(color_idx)
  }

  if (y_end >= WALK_H) {
    // End reached.
    append_result(x_end);
    x_end = WALK_W / 2;
    y_end = 0;
  }
  window.setTimeout(function() {
    walk(x_end, y_end);
  }, delay);
}
