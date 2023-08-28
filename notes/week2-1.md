---
title: Elements of a Shiny App
layout: post
output:
  md_document:
    preserve_yaml: true
---

*Vocabulary used by R Shiny Library, and a few example apps.*

[Recording](https://mediaspace.wisc.edu/media/Week+2+-+1A+Elements+of+a+Shiny+App/1_rlzn96xp),
[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week2-1.Rmd)

1.  All Shiny apps are made up from the same few building blocks. These
    notes review the main types of blocks. When reading code from more
    complex apps, it can be helpful to try to classify pieces of the
    code into these types of blocks.

2.  The highest level breakdown of Shiny app code is between `ui` and
    `server` components. The `ui` controls what the app *looks like*. It
    stands for “User Interface.” The `server` controls what the app
    *does*. For example, the app below defines a title and textbox where
    users can type. But it does not do anything, since the server is
    empty.

        library(shiny)

        ui <- fluidPage(
          titlePanel("Hello!"),
          textInput("name", "Enter your name")  # first arg is ID, second is label
        )

        server <- function(input, output) {}
        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/43a4312c-a124-4b63-8228-23ba5375992b/" allowfullscreen="" data-external="1"></iframe>

3.  The UI elements can be further broken down into Inputs, Outputs, and
    Descriptors[1], all grouped together by an organizing layout
    function. Inputs are UI elements that users can manipulate to prompt
    certain types of computation. Outputs are parts of the interface
    that reflects the result of a `server` computation. Descriptors are
    parts of the page that aren’t involved in computation, but which
    provide narrative structure and guide the user.

    For example, in the toy app above, `titlePage` is a descriptor
    providing some title text. `textInput` is an input element allowing
    users to enter text. `fluidPage` is a layout function that arranges
    these elements on a continuous page (some other layout functions are
    `sidebarLayout`, `navbarPage`, `flowLayout`, …)

4.  An important point is that all input and output elements must be
    given a unique ID. This is always the first argument of a `*Input`
    or `*Output` function defined in Shiny. The ID tags are how
    different parts of the application are able to refer to one another.
    For example, if we wanted to refer to the text the user entered in
    the application above, we could refer to the `name` ID.

5.  Let’s see how to (1) make user inputs cause some sort of computation
    and (2) have the result of that computation appear to the user. For
    (1), we will add a `renderText` element to the `server`. All
    `render*` functions do two things,

    -   They make inputs from the `ui` available for computation.
    -   They generate HTML code that allows the results of the
        computation to appear in a UI output.

    For (2), we will add a `textOutput` element to the `ui` layout
    defined above. Let’s look at the code,

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

    <iframe src="https://data-viz.it.wisc.edu/content/541af110-2ce1-46d1-b293-f38a96e125f3/" allowfullscreen="" data-external="1"></iframe>

6.  There are a few points worth noting. First, the `renderText`
    component was able to refer to the value entered in the textbox
    using `input$name`. This was possible because `name` was the ID that
    we gave to the `textInput` component. It would not have worked if we
    had used `input$text` outside of a `render*` function: this is what
    we mean by the `render*` functions making the UI inputs available
    for computation. Finally, we were able to refer to the rendered
    output in the UI by adding a `textOutput` component. By giving this
    component the id `printed_name`, we were able to tell it to look
    into the server for a rendered output named `printed_name` and fill
    it in.

7.  An even deeper idea is that the code did not simply run linearly,
    from top of the script to the bottom. If that were all the code did,
    then it would have run once at the beginning, and it would never
    have updated when you entered your name. Instead, it ran *every time
    you typed into the textbox*. This is the “reactive programming”
    paradigm, and it is what makes interactive visualization possible.
    `renderText` knows to rerun every time something is entered into the
    `name` text input, because we told it to depend on `input$name`. We
    will explore the idea of reactivity in more depth in the next
    lecture, but for now, just remember that the order in which code is
    executed is not simply determined by the order of lines in a file.

8.  Let’s look at a few more examples, just to get a feel for things.
    The app below updates a plot of random normal variables given a mean
    specified by the user. We’ve introduced a new type of input, a
    `numericInput`, which captures numbers. We’ve also added a new
    output, `plotOutput`, allowing with its accompanying renderer,
    `renderPlot` (remember, UI outputs are always paired with server
    renderers).

        library(shiny)
        library(tidyverse)

        ui <- fluidPage(
          titlePanel("Random Normals"),
          numericInput("mean", "Enter the mean", 0), # 0 is the default
          plotOutput("histogram")
        )

        server <- function(input, output) {
          output$histogram <- renderPlot({
            data.frame(values = rnorm(100, input$mean)) %>%
              ggplot() +
                geom_histogram(aes(values))
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/2cc8cc90-7c51-493c-81e1-a6b8919cd6a6/" allowfullscreen="" data-external="1" height=535 width=600></iframe>

9.  We can make the plot depend on several inputs. The code below allows
    the user to change the total number of data points and the variance,
    this time using slider inputs. I recommend taking a look at
    different inputs on the shiny
    [cheatsheet](https://shiny.rstudio.com/images/shiny-cheatsheet.pdf),
    though be aware that there are many
    [extensions](https://github.com/nanxstats/awesome-shiny-extensions)
    built by the community.

        library(shiny)
        library(tidyverse)

        ui <- fluidPage(
          titlePanel("Random Normals"),
          numericInput("mean", "Enter the mean", 0),
          sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
          sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
          plotOutput("histogram")
        )

        server <- function(input, output) {
          output$histogram <- renderPlot({
            data.frame(values = rnorm(input$n, input$mean, input$sigma)) %>%
              ggplot() +
                geom_histogram(aes(values), bins = 100) +
                xlim(-10, 10)
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/3d0d8a20-446a-438a-b373-bd06206f178f/" allowfullscreen="" data-external="1" height=735 width=600></iframe>

10. We can also make the app return several outputs, not just a plot.
    The code below attempts to print the data along in addition to the
    histogram, but it makes a crucial mistake (can you spot it?).

        library(shiny)
        library(tidyverse)

        ui <- fluidPage(
          titlePanel("Random Normals"),
          numericInput("mean", "Enter the mean", 0),
          sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
          sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
          plotOutput("histogram"),
          dataTableOutput("dt")
        )

        server <- function(input, output) {
          output$histogram <- renderPlot({
            data.frame(values = rnorm(input$n, input$mean, input$sigma)) %>%
              ggplot() +
                geom_histogram(aes(values), bins = 100) +
                xlim(-10, 10)
          })

          output$dt <- renderDataTable({
            data.frame(values = rnorm(input$n, input$mean, input$sigma))
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/15f7837a-64b6-4f73-9b4a-13f2ca168daa/" allowfullscreen="" data-external="1" height=935 width=600></iframe>

11. The issue is that this code reruns `rnorm` for each output. So, even
    though the interfaces suggests that the printed samples are the same
    as the ones in the histogram, they are actually different. To
    resolve this, we need a way of storing an intermediate computation
    which (1) depends on the inputs but (2) feeds into several outputs.
    Whenever we encounter this need, we can use a reactive expression.
    It is a type of server element that depends on the input and can be
    referred to directly by outputs, which call the reactive expression
    like a function. For example, the code below generates the random
    normal samples a single time, using the `samples()` reactive
    expression.

        library(shiny)
        library(tidyverse)

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
            data.frame(values = rnorm(input$n, input$mean, input$sigma))
          })

          output$histogram <- renderPlot({
              ggplot(samples()) +
                geom_histogram(aes(values), bins = 100) +
                xlim(-10, 10)
          })

          output$dt <- renderDataTable(samples())
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/3e53bb63-a19a-4ded-8ab6-5ffbc9447c8f/" allowfullscreen="" data-external="1" height=935 width=600></iframe>

12. Finally, a good practice is to move as much non-app related code to
    separate functions. This makes the flow of the app more transparent.
    The clearer the delineation between “computation required for
    individual app components” and “relationship across components,” the
    easier the code will be to understand and extend.

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

    <iframe src="https://data-viz.it.wisc.edu/content/fe220e82-becf-4cc6-891c-7fa1c69ba850/" allowfullscreen="" data-external="1" height=935 width=600></iframe>

[1] I like to use these names to keep everything organized, but they are
not standard in the community.
