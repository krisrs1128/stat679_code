---
title: Graphical Queries - Click Events
layout: post
output: 
  md_document:
    preserve_yaml: true
---

*An introduction to click events in Shiny*

[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week3-1.Rmd),
[Recording](https://mediaspace.wisc.edu/media/Week+3+-+1A+Graphical+Queries+-+Click+Events/1_9zrb0tjb)

1.  Some of the most sophisticated interactive data visualizations are
    based on the idea that user queries can themselves be defined
    visually. For example, to select a date range, we could directly
    interact with a time series plot, rather than relying on a slider
    input. Or, instead of a long dropdown menu of items, a user could
    select items by clicking on bars in a bar plot. There are many
    variations of this idea, but they all leverage graphical (rather
    than textual) displays to define queries. The advantage of this
    approach is that it increases information density – the selection
    inputs themselves encode data.

2.  To implement this in Shiny, we first need a way of registering user
    interactions on plots themselves. We will consider two types of plot
    interaction mechanisms: clicks and brushes. These can be specified
    by adding `click` or `brush` events to `plotOutput` objects.

3.  This creates a UI with a single plot on which we will be able to
    track user clicks,

        ui <- fluidPage(
          plotOutput("plot", click = "plot_click")
        )

    Here, `plot_click` is an ID that can be used as `input$plot_click`
    in the server. We could name it however we want, but we need to be
    consistent across the UI and server (just like ordinary,
    non-graphical inputs).

4.  Before, we just needed to place the `input$id` items within `render`
    and `reactive` server components, and the associated outputs would
    automatically know to redraw each time the value of any input was
    changed. Clicks are treated slightly differently. We have to
    both (a) recognize when a click event has occurred and (b) extract
    relevant information about what the click was referring to.

5.  For (a), we generally use `observeEvent`,

        observeEvent(
          input$plot_click,
          ... things to do when the plot is clicked ...
        )

    This piece of code will be run anytime the plot is clicked.

6.  For (b), we can use the `nearPoints` helper function. Suppose the
    plot was made using the data.frame `x`. Then

        nearPoints(x, input$click)

    will return the samples in `x` that are close to the clicked
    location. We will often use a variant of this code that doesn’t just
    return the closeby samples – it returns all samples, along with
    their distance from the clicked location,

        nearPoints(x, input$click, allRows = TRUE, addDist = TRUE)

7.  We are almost ready to build a visualization whose outputs respond
    to graphical queries. Suppose we want a scatterplot where point
    sizes update according to their distance from the user’s click.
    Everytime the plot is clicked, we need to update the set of
    distances between samples and the clicked point. We then need to
    rerender the plot to reflect the new distances. This logic is
    captured by the block below,

        server <- function(input, output) {
          dist <- reactiveVal(rep(1, nrow(x)))
          observeEvent(
            input$plot_click,
            dist(reset_dist(x, input$plot_click))
          )

          output$plot <- renderPlot({
            scatter(x, dist())
          })
        }

    The code above uses one new concept, the `reactiveVal` on the first
    line of the function. It is a variable that doesn’t directly depend
    on any inputs, which can become a source node for downstream
    `reactive` and `render` nodes in the reactive graph. Anytime the
    variable’s value is changed, all downstream nodes will be
    recomputed. A very common pattern is use an `observeEvent` to update
    a `reactiveVal` every time a graphical query is performed. Any plots
    that depend on this value will then be updated. For example,

        val <- reactiveVal(initial_val) # initialize the reactive value

        observeEvent(
          ...some input event...
          ...do some computation...
          val(new_value) # update val to new_val
        )

        # runs each time the reactiveVal changes
        renderPlot({
          val() # get the current value of the reactive value
        })

8.  So, revisiting the `dist` in the earlier code block, we see that it
    is initialized as a vector of `1`’s whose length is equal to the
    number of rows of `x`. Everytime the plot is clicked, we update the
    value of `dist` according to the function `reset_dist`. Finally, the
    changed value of `dist` triggers a rerun of `renderPlot`. Let’s look
    at the full application in action. It makes a scatterplot using the
    cars dataset and resizes points every time the plot is clicked.

        library(tidyverse)
        library(shiny)

        # wrapper to get the distances from points to clicks
        reset_dist <- function(x, click) {
          nearPoints(x, click, allRows = TRUE, addDist = TRUE)$dist_
        }

        # scatterplot plot with point size dependent on click location
        scatter <- function(x, dists) {
          x %>%
            mutate(dist = dists) %>%
            ggplot() +
            geom_point(aes(mpg, hp, size = dist)) +
            scale_size(range = c(6, 1))
        }

        ui <- fluidPage(
          plotOutput("plot", click = "plot_click")
        )

        server <- function(input, output) {
          dist <- reactiveVal(rep(1, nrow(mtcars)))
          observeEvent(
            input$plot_click,
            dist(reset_dist(mtcars, input$plot_click))
          )

          output$plot <- renderPlot(scatter(mtcars, dist()))
        }

        shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/17a54e4c-5237-4018-b6fe-20c1555cf337/" allowfullscreen="" data-external="1" height=400 width=600></iframe>

9.  The `reset_dist` function uses `nearPoints` to compute the distance
    between each sample and the plot, each time the plot is clicked. The
    associated reactive value `dist` gets changed, which triggers
    `scatterplot` to run, and it is encoded using size in the downstream
    ggplot2 figure.

10. We can make the plot more interesting by outputting a table showing
    the original dataset. Using the same `dist()` call, we can sort the
    table by distance each time the plot is clicked.

        library(tidyverse)
        library(shiny)
        mtcars <- add_rownames(mtcars)

        reset_dist <- function(x, click) {
          nearPoints(x, click, allRows = TRUE, addDist = TRUE)$dist_
        }

        scatter <- function(x, dists) {
          x %>%
            mutate(dist = dists) %>%
            ggplot() +
            geom_point(aes(mpg, hp, size = dist)) +
            scale_size(range = c(6, 1))
        }

        ui <- fluidPage(
          plotOutput("plot", click = "plot_click"),
          dataTableOutput("table")
        )

        server <- function(input, output) {
          dist <- reactiveVal(rep(1, nrow(mtcars)))
          observeEvent(
            input$plot_click,
            dist(reset_dist(mtcars, input$plot_click))
          )

          output$plot <- renderPlot(scatter(mtcars, dist()))
          output$table <- renderDataTable({
            mtcars %>%
              mutate(dist = dist()) %>%
              arrange(dist)
          })
        }

        shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/9fcf3583-a74f-4d84-8d7c-68ac3595bf6b/" allowfullscreen="" data-external="1" height=750 width=800></iframe>
