---
title: Temporal Data in D3
layout: post
output:
  md_document:
    preserve_yaml: true
---

*Path generators for temporal visualization*

[Code](https://github.com/krisrs1128/stat679_code/tree/main/examples/week8/week8-1),
[Recording](https://mediaspace.wisc.edu/media/Week%208%20-%201%3A%20Temporal%20Data%20in%20D3/1_w28jl3u4)

1.  These notes give the D3 analogs of visualizations created in our
    [earlier
    notes](https://krisrs1128.github.io/stat679_notes/2022/06/01/week7-1.html)
    on temporal visualization. For a static visualization, these methods
    might be overkill — the R approach can give satisfactory results
    more easily. However, if we ever want to customize the appearance or
    interactivity beyond what is possible in R, then these examples can
    serve as a starting point.

2.  Let’s begin with the basic line plot. We have had a few examples
    before
    \[[1](https://krisrs1128.github.io/stat679_notes/2022/06/01/week4-3.html),
    [2](https://krisrs1128.github.io/stat679_notes/2022/06/01/week6-4.html)\],
    but we glossed over important details of D3’s path generators.
    Remember that in the first of those examples, we had manually
    generated paths by setting their `d` attributes to strings
    like`M 100 100 L 200 105 L 300 115`. This means to start a path at
    pixel coordinates (100, 100), move to the right and down by
    (200, 105) pixels, and so on. For a larger time series dataset, it
    woulud be impossible to construct these path strings manually.

3.  To do this more automatically, we can use an SVG path generator.
    This is a function that converts an array of javascript objects to
    SVG path strings like the one above. This is accomplished by giving
    `d3.line()` functions that output the `x` and `y` pixel coordinates
    from objects representing individual timepoints. The `x` and `y`
    functions are usually light wrappers of scales that map the raw data
    into pixel coordinates.

        d3.line()
          .x([helper to get x pixel coordinate])
          .y([helper to get y pixel coordinate])

4.  For example, to regenerate the lynx plot, we first store the time
    series data into an array of objects,

        let data = [{Year: ..., Lynx: ...}, ...]

    define a temporal scale for the x-axis,

         d3.scaleTime()
           .domain(x_extent)
           .range([margins.left, width - margins.right]),

    and finally set the path’s `d` attribute using a generator defined
    with `d3.line()`

        path_generator = d3.line()
          .x(d => scales.x(d.Year))
          .y(d => scales.y(d.Lynx));

        d3.select("#line")
          .selectAll("path")
          .data([data]).enter()
          .append("path")
          .attr("d", path_generator);

    which together with some axis annotation functions creates this
    figure,

    <iframe src="https://krisrs1128.github.io/stat679_code/examples/week8/week8-1/line.html" height=500 width=800></iframe>

5.  If we want to draw a collection of paths, we can use an array of
    arrays. Each element of the outer collection provides a path; each
    element within the inner arrays gives one timepoint.

        [
          [{t: t1, y: value1}, {t: t2, y: value2}, ...] // array for first line
          [{t: t2, y: value2}, {t: t2, y: value2}, ...] // array for second line
          ...
        ]

    This is the reason we used `.data([data]).enter()` in the code for
    the Lynx plot. We created an array with a single element to indicate
    that we only needed one path to be appended.

6.  For example, suppose we want to create a visualization of daily
    electricity demand over several months. We want each line to
    correspond to a single 24 hour period, and will have a few dozen
    lines.

    <iframe src="https://krisrs1128.github.io/stat679_code/examples/week8/week8-1/electricity.html" height=500 width=700></iframe>

    This is done by defining a path generator with scales defined for
    the electricity dataset,

        path_generator = d3.line()
          .x(d => scales.x(d.time_of_day))
          .y(d => scales.y(d.Demand));

    At this point, we can append a path for every series in the `data`
    object. As in the Lynx visualization, we set the `d` attribute
    through the path generator.

        d3.select("#series")
          .selectAll("path")
          .data(data).enter() // no longer add the array
          .append("path")
          .attrs({
            d: path_generator,
            id: d => d[0].Date_string
          })

7.  Path generators are just one example of a D3 function that maps raw
    data to more complex visual marks. For example, to create a stacked
    time series visualization, we can use `d3.stack()` together with
    `d3.area()`. `d3.stack()` reshapes the data so that the y-axis
    values for adjacent bands are easy to access. For our X-Men dataset,
    it transforms an array whose elements correspond to individual
    issues (each with multiple characters),

        let data = [
        ...
        {
          "issue": 187,
          "Magneto_Costume": 0.5743808848140938,
          "Nightcrawler_Costume": 9.268299188171497,
          ...
        },
        {
          "issue": 188,
          "Magneto_Costume": 0.5748317549972979,
          "Nightcrawler_Costume": 10.810761097676323,
        }
        ...
        ]

    into an array of arrays containing characters in the outer grouping
    and issues in the inner grouping. This arrangement is useful because
    it associates each character with one stream in the stream graph
    below. The `ymin` values are calculated from the number of
    appearances for the characters below, and the difference between
    `ymax` and `ymin` give the number of appearances of the current
    character.

        [
        ...
          [[y0_min_magneto, y0_max_magneto, data[0]], [y1_min_magneto, y1_max_magneto, data[1]], ...] // Magneto Costume
          [[y0_min_nightcrawler, y0_max_nightcrawler, data[0]], [y1_min_nightcrawler, y1_max_nightcrawler, data[1]], ...] // Nightcrawler Costume
          ...
        ]

8.  Specifically, we can encode the output of the “stacked” array as a
    collection of SVG paths using `d3.area()`. This function is
    analogous to `d3.line()`, but for full shaded areas rather than
    isolated lines.

        let area_generator = d3.area()
          .x(d => scales.x(d.data.issue))
          .y0(d => scales.y(d[0])) // lower envelope
          .y1(d => scales.y(d[1])) // upper envelope
          .curve(d3.curveBasis) // makes it smooth

    This area generator can be used to create the D3 streamgraph by
    binding the stacked character data and passing in our area generator
    for the `d` attribute,

        d3.select("#stream")
          .selectAll("path")
          .data(stream).enter()
          .append("path")
          .attrs({
            fill: d => scales.fill(d.key),
            d: area_generator
          });

    <iframe src="https://krisrs1128.github.io/stat679_code/examples/week8/week8-1/xmen.html" height=400 width=500 style="text-align: center"></iframe>

9.  Just to show how flexible D3 can be, let’s study two more exotic
    examples of temporal visualizations: Gantt charts and Bump charts.
    Gantt charts encode the start and end of discrete temporal events.
    They are often used to organize project tasks or other discrete
    events with a temporal duration. For example, this shows the start
    and end times for a series of calls to the San Francisco 311 office,
    it is a simplification of the more elegant design
    [here](https://observablehq.com/@clhenrick/collapsable-gantt-chart).

    <iframe src="https://krisrs1128.github.io/stat679_code/examples/week8/week8-1/gantt1.html" height=300 width=500 style="text-align: center"></iframe>

10. This figure can be generated by (i) appending rectangles for each
    event along the `y`-axis and then positioning them along the
    `x`-axis using their starting time. The width of each rectangle
    encodes the amount of time that the event lasts. Binding events to
    the correct `y` positions is a matter of using a `scaleBand` scale
    with the domain set to the unique IDs and the range set to the
    height of the figure. The `x`-axis uses a `scaleTime` scale – this
    knows specifically how to map datetime objects to pixel coordinates.
    The function below captures all of this logic,

        function make_scales(data) {
          let ids = data.map(d => d.id)
          let dateExtent = d3.extent(
            d3.merge([data.map(d => d.startDate), data.map(d => d.endDate)])
          )
          return {
            y: d3.scaleBand()
              .domain(ids)
              .range([0.9 * height, 0]), // leave space for the axis
            x: d3.scaleTime()
              .domain(dateExtent)
              .range([0, width])
          }
        }

11. Given these scales, we can enter one rectangle per event in the
    dataset. We set the width parameter to the difference between the
    mapped start and end times. We manually set the height of the bars.

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
              return w < 2 || isNaN(w) ? 2 : w; // minimum length of 2 pixels
            }
          })

12. Next, let’s consider Bump charts. These are often useful for
    studying how ranks evolve over time. The example below, from the
    Washington Post, shows how state populations have changed over time.
    Steps where a state changes rank have been shaded purple or gold,
    depending on whether the rank increased or decreased.

    <iframe width="100%" height="911" frameborder="0"
      src="https://observablehq.com/embed/@washpostgraphics/bump-chart-of-state-population-ranks?cells=viewof+useWidthScale%2CbumpChart"></iframe>

13. We won’t go over all the steps used to create this visualization
    (you can review the full implementation
    [here](https://observablehq.com/@washpostgraphics/bump-chart-of-state-population-ranks)),
    but let’s take a look at a some of the key steps. The original data
    is an array with objects like the one below,

        { state_name: "New York", state_abbr: "NY", pop: 10385227, year: 1920, rank: 1}

    A line generator was defined using the block below. The variables
    `x` and `y` are scales mapping years and rank to their pixel
    coordinates. `d3.curveBumpX` is what creates the smooth bump chart
    appearance – otherwise the lines would look like typical time series
    (lines along the shortest path between points).

        line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.rank))
            .curve(d3.curveBumpX);

14. Perhaps the most challenging part of creating this data
    visualization is creating a new dataset with which to create the
    links. The above object includes information for one state at one
    timepoint, but the links need to relate two neighboring timepoints.
    If we’re going to bind SVG elements that relate pairs of timepoints,
    we need the data to reflect that. This is done by looping over
    timepoints and creating an array, `linkData`, that’s made up of many
    small arrays like this,

        [{state_name: "New York", state_abbr: "NY", pop: 10385227, year: 1920, rank: 1},
         {state_name: "New York", state_abbr: "NY", pop: 12588066, year: 1930, rank: 1},
          diff: 0, // whether the link is increasing or not
          state_abbr: "NY"]

    which can now naturally be used in a data join. For each array
    element, a path is drawn between them using the line generator
    `line` defined above.

        const links = g.append("g")
            .attr("class", "links")
            .data(linkData)
            .enter().append("g")
            ... styling and mouseover code ...
            .append("path")
            .attr("d", line);

15. This is the main logic of the visualization, but this example is
    worth reading to learn some other nice tricks. For example, note how
    the authors have used `diff` to color in the increasing vs
    decreasing ranks. They also introduced an interesting color gradient
    (rather than having all links in a solid color) by invoking [this
    library](https://observablehq.com/@washpostgraphics/gradient-generators).
