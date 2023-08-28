---
title: Introduction to Reactivity
layout: post
output:
  md_document:
    preserve_yaml: true
---

*Viewing shiny code execution as a graph*

[Recording](https://mediaspace.wisc.edu/media/Week%202%20-%202%3A%20Introduction%20to%20Reactivity/1_zf6r85l4),
[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week2-2.Rmd)

1.  These notes will explore the idea of reactivity in more depth.
    Recall that reactivity refers to the fact that Shiny app code is not
    run from top to bottom, like an ordinary R script. Instead, it runs
    reactively, depending on inputs that the user has provided. This can
    make writing Shiny code a bit unintuitive at first, but there are a
    few higher-level concepts that can help when writing reactive code.

2.  The most important of these concepts is that reactive code can be
    viewed as a graph. The `ui` and `server` define an explicit
    dependency structure for how components depend on one another. The
    `input$`’s within `render*` functions in the server specify how UI
    inputs affect server computations. The IDs within the `*Output`
    elements in the `ui` specify which of the rendered `output$`’s in
    the server should be used to populate the visible interface.

3.  For example, our first “Hello” app has the following (simple)
    reactivity graph. Note that I’ve drawn input and output nodes
    differently, to emphasize the flow of computation. I’ve also copied
    the code from the original app for reference.

    ![](https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-02/figures/names.png)

        library(shiny)

        ui <- fluidPage(
          titlePanel("Hello!"),
          textInput("name", "Enter your name"),
          textOutput("printed_name")
        )

        server <- function(input, output) {
          output$printed_name <- renderText({
            paste0("Welcome to shiny, ", input$name, "!")
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/43a4312c-a124-4b63-8228-23ba5375992b/" allowfullscreen="" data-external="1"></iframe>

4.  Even though the graph is simple, note that the outputs will be
    recomputed each time that the input is changed. For more general
    graphs, all downstream nodes will be re-executed whenever an
    upstream source is changed (typically by a user input, though it’s
    possible to trigger changes automatically).

5.  Reactive expressions provide a special kind of node that live
    between inputs and outputs. They depend on inputs, and they feed
    into outputs, but they are never made directly visible to the user.
    This is why we’ve drawn them as a kind of special intermediate node.
    Below, I’ve drawn the graph for our random normal plotter, with the
    reactive `samples()` expression.

    ![](https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-02/figures/reactive_histo.png)

        library(shiny)
        library(tidyverse)

        ### Functions within app components
        generate_data <- function(n, mean, sigma) {
          data.frame(values = rnorm(n, mean, sigma))
        }

        histogram_fun <- function(df) {
          ggplot(df) +
            geom_histogram(aes(values), bins = 100) +
            xlim(-10, 10)
        }

        ### Defines the app
        ui <- fluidPage(
          titlePanel("Random Normals"),
          numericInput("mean", "Enter the mean", 0),
          sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
          sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
          plotOutput("histogram"),
          dataTableOutput("dt")
        )

        server <- function(input, output) {
          samples <- reactive({
            generate_data(input$n, input$mean, input$sigma)
          })
          output$histogram <- renderPlot(histogram_fun(samples()))
          output$dt <- renderDataTable(samples())
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/6063856c-2c50-4bb2-b272-b1c41b30f574/" allowfullscreen="" data-external="1" height=935 width=600></iframe>

6.  A useful perspective is to think of reactive expressions as
    simplifying the overall reactivity graph. Specifically, by adding a
    reactive node, it’s possible to trim away many edges. For example,
    our initial implementation of the random normal plotter (which
    didn’t use the reactive expression) has a much more complicated
    graph, since many inputs feed directly into outputs.

    ![](https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-02/figures/nonreactive_histo.png)

7.  Let’s see these principles in action for a similar, but more complex
    app. The app below can be used for power analysis. It simulates two
    groups of samples, both from normal distributions, but with
    different (user specified) means. We’ve used a reactive expression
    to generate the samples, so that both the histogram and hypothesis
    test result outputs can refer to the same intermediate simulated
    data.

        library(shiny)
        library(tidyverse)
        library(broom)

        ### Functions within app components
        generate_data <- function(n, mean1, mean2, sigma) {
          data.frame(
            values = c(rnorm(n, mean1, sigma), rnorm(n, mean2, sigma)),
            group = rep(c("A", "B"), each = n)
          )
        }

        histogram_fun <- function(df) {
          ggplot(df) +
            geom_histogram(
              aes(values, fill = group), 
              bins = 100, position = "identity",
              alpha = 0.8
            ) +
            xlim(-10, 10)
        }

        test_fun <- function(df) {
          t.test(values ~ group, data = df) %>%
            tidy() %>%
            select(p.value, conf.low, conf.high)
        }

        ### Defines the app
        ui <- fluidPage(
          sidebarLayout(
            sidebarPanel(
              sliderInput("mean1", "Mean (Group 1)", 0, min = -10.0, max = 10.0, step = 0.1),
              sliderInput("mean2", "Mean (Group 2)", 0, min = -10, max = 10, step = 0.1),
              sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
              sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
            ),
            mainPanel(
              plotOutput("histogram"),
              dataTableOutput("test_result")
            )
          )
        )

        server <- function(input, output) {
          samples <- reactive({
            generate_data(input$n, input$mean1, input$mean2, input$sigma)
          })
          output$histogram <- renderPlot(histogram_fun(generate_data(input$n, input$mean1, input$mean2, input$sigma)))
          output$test_result <- renderDataTable(test_fun(generate_data(input$n, input$mean1, input$mean2, input$sigma)))
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/1f5cecd2-a4c7-46bd-a2ea-07443b009687/" allowfullscreen="" data-external="1" height=935 width=600></iframe>

    Other than that, the only difference is that I’ve saved output from
    the `t.test` using `test_result`. Notice the use of the `broom`
    package, which helps format the test output into a `data.frame`.

8.  So far, all of our reactive code has lived within the `render*` or
    `reactive()` sets of functions. However, there is a another kind
    that is often useful, especially in more advanced applications:
    `observers`. An observer is a computation that is done every time
    certain inputs are changed, but which don’t affect downstream UI
    outputs through a `render*` function. For example, below, we’ve
    added a block (under `observeEvent`) that prints to the console
    every time either of the means are changed. I realize it is a bit of
    a mystery why these functions would ever be useful, but we will see
    them in more realistic contexts next week.

        library(shiny)
        library(tidyverse)
        library(broom)

        ### Functions within app components
        generate_data <- function(n, mean1, mean2, sigma) {
          data.frame(
            values = c(rnorm(n, mean1, sigma), rnorm(n, mean2, sigma)),
            group = rep(c("A", "B"), each = n)
          )
        }

        histogram_fun <- function(df) {
          ggplot(df) +
            geom_histogram(
              aes(values, fill = group), 
              bins = 100, position = "identity",
              alpha = 0.8
            ) +
            xlim(-10, 10)
        }

        test_fun <- function(df) {
          t.test(values ~ group, data = df) %>%
            tidy() %>%
            select(p.value, conf.low, conf.high)
        }

        ### Defines the app
        ui <- fluidPage(
          sidebarLayout(
            sidebarPanel(
              sliderInput("mean1", "Mean (Group 1)", 0, min = -10.0, max = 10.0, step = 0.1),
              sliderInput("mean2", "Mean (Group 2)", 0, min = -10, max = 10, step = 0.1),
              sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
              sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
            ),
            mainPanel(
              plotOutput("histogram"),
              dataTableOutput("test_result")
            )
          )
        )

        server <- function(input, output) {
          samples <- reactive({
            generate_data(input$n, input$mean1, input$mean2, input$sigma)
          })
          output$histogram <- renderPlot(histogram_fun(samples()))
          output$test_result <- renderDataTable(test_fun(samples()))
          observeEvent(input$mean1 | input$mean2, {
            message("group 1 mean is now: ", input$mean1)
            message("group 2 mean is now: ", input$mean2)
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/752b80de-5c75-4dd9-b7fe-2d399c3ea3da/" allowfullscreen="" data-external="1" height=935 width=600></iframe>
