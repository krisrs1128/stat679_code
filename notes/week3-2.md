---
title: Graphical Queries - Brush Events
layout: post
output: 
  md_document:
    preserve_yaml: true
---

*An introduction to brush events in Shiny*

[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week3-2.Rmd),
[Recording](https://mediaspace.wisc.edu/media/Week%203%20-%202%3A%20Graphical%20Queries%20-%20Brush%20Events/1_y2dyjzbd)

1.  Click events are useful for referring to individual samples.
    However, they are not ideal for referring to groups of samples. In
    this case, a useful type of plot input is a `brush`. This is a
    selection that can be defined by clicking and dragging over a
    region.

2.  In shiny, brush events are treated similarly to click events. For
    example, to define a new brush input, we can set the `brush`
    argument to `plotOutput`.

        ui <- fluidPage(
          plotOutput("plot", brush = "plot_brush")
        )

    Just like the `click` argument, the value `"plot_brush"` is an ID
    that can be used in the server. Also like in click events, we can
    setup an observer to change a reactive value every time a brush is
    drawn[1]. The general pattern is similar to what we had before,

        server <- function(input, output) {
          selected <- reactiveVal(initial value)
          observeEvent(
            input$plot_brush,
            ... computation using get new_value ...
            selected(new_value)
          )

          output$plot <- renderPlot(... use scatter() reactive val...)
        }

3.  The example below is similar to the `plot_click` example from the
    previous notes. Instead of sorting points by proximity to the click,
    though, prints the subset of rows that have been currently brushed.

        library(tidyverse)
        library(shiny)
        mtcars <- add_rownames(mtcars)

        reset_selection <- function(x, brush) {
          brushedPoints(x, brush, allRows = TRUE)$selected_
        }

        scatter <- function(x, selected_) {
          x %>%
            mutate(selected_ = selected_) %>%
            ggplot() +
            geom_point(aes(mpg, hp, alpha = as.numeric(selected_))) +
            scale_alpha(range = c(0.1, 1))
        }

        ui <- fluidPage(
          plotOutput("plot", brush = "plot_brush"),
          dataTableOutput("table")
        )

        server <- function(input, output) {
          selected <- reactiveVal(rep(TRUE, nrow(mtcars)))
          observeEvent(
            input$plot_brush,
            selected(reset_selection(mtcars, input$plot_brush))
          )

          output$plot <- renderPlot(scatter(mtcars, selected()))
          output$table <- renderDataTable(filter(mtcars, selected()))
        }

        shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/a651bc7b-6773-445d-8bc6-22084155e21a/" allowfullscreen="" data-external="1" height=700 width=600></iframe>

4.  It is often useful to combine multi-view composition (*i.e.*,
    faceting or compound figures) with dynamic queries. The basic idea
    is to (a) show different aspects of a dataset using different views,
    and then (b) link the views using dynamic queries. This strategy is
    sometimes called dynamic linking.

5.  The example below implements dynamic linking with the penguins
    dataset. Brushing over either scatterplot highlights the
    corresponding points in the adjacent plot (it also updates the data
    table). This is a way of understanding structure beyond two
    dimensions. The implementation is similar to the brushing above,
    except that the reactive value `selected()` is called in two
    `renderPlot` contexts, leading to changes in both plots every time
    the brush is moved.

        library(tidyverse)
        library(shiny)
        penguins <- read_csv("https://uwmadison.box.com/shared/static/ijh7iipc9ect1jf0z8qa2n3j7dgem1gh.csv")

        reset_selection <- function(x, brush) {
          brushedPoints(x, brush, allRows = TRUE)$selected_
        }

        scatter <- function(x, selected_, var1, var2) {
          x %>%
            mutate(selected_ = selected_) %>%
            ggplot(aes_string(var1, var2)) +
            geom_point(aes(alpha = as.numeric(selected_), col = species)) +
            scale_alpha(range = c(0.1, 1))
        }

        ui <- fluidPage(
          fluidRow(
            column(6, plotOutput("scatter1", brush = "plot_brush")),
            column(6, plotOutput("scatter2", brush = "plot_brush"))
          ),
          dataTableOutput("table")
        )

        server <- function(input, output) {
          selected <- reactiveVal(rep(TRUE, nrow(penguins)))
          observeEvent(
            input$plot_brush,
            selected(reset_selection(penguins, input$plot_brush))
          )

          output$scatter1 <- renderPlot({
            scatter(penguins, selected(), "bill_length_mm", "bill_depth_mm")
          })
          output$scatter2 <- renderPlot({
            scatter(penguins, selected(), "flipper_length_mm", "body_mass_g")
          })

          output$table <- renderDataTable(filter(penguins, selected()))
        }

        shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/8e4b07a5-d671-40cb-9d57-22d25533b8fe/" allowfullscreen="" data-external="1" height=800 width=600></iframe>

[1] Technically, the code only executes when the mouse lifts off the
brush selection. Some visualizations will be able to call the updating
code every time the mouse is moved with the brush selected. This creates
a smoother experience.
