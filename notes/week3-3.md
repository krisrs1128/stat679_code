---
title: Linked Brushing
layout: post
output: 
  md_document:
    preserve_yaml: true
---

*More examples defining brush queries using Shiny and `ggplot2`.*

[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week3-3.Rmd),
[Recording](https://mediaspace.wisc.edu/media/Week%203%20-%203%3A%20Linked%20Brushing/1_jdtr6xg6)

1.  These notes provide more realistic examples of linked brushing.
    Though the visual design problems they address are more complex,
    they follow the same recipe described earlier,

    -   A `reactiveVal` is defined to track the currently selected
        samples.
    -   An `observeEvent` is used to update the `reactiveVal` every time
        a plot is brushed.
    -   Downstream `render` contexts update plot and data table outputs
        whenever the `reactiveVal` is changed.

2.  The first example implements linked brushing on the movie ratings
    dataset presented earlier. Before we used a slider to select movies
    within a user-specified time range. Our graphical alternative is to
    allow selections over a histogram of movie release dates within the
    dataset. Specifically, we will create an interactive version of the
    histogram below,

        library(tidyverse)
        library(lubridate)

        movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
          mutate(
            date = as_date(Release_Date, format = "%b %d %Y"),
            year = year(date),
            Major_Genre = fct_explicit_na(Major_Genre)
          )

        movies %>% 
          count(year) %>%
          ggplot(aes(year, n)) +
          geom_bar(stat = "identity", width = 1) +
          scale_y_continuous(expand = c(0, 0))

    ![](/stat679_notes/assets/week3-3/unnamed-chunk-2-1.png)

    and when a subset of years of has been brushed, we will highlight
    the corresponding movies in the same kind of scatterplot used in the
    earlier, slider-based implementation.

        ggplot(movies) +
          geom_point(aes(Rotten_Tomatoes_Rating, IMDB_Rating))

    ![](/stat679_notes/assets/week3-3/unnamed-chunk-3-1.png)

3.  Viewed more abstractly, we are going to use a brush to link the
    histogram and scatterplot views. We will be able to evaluate the
    change in a visualization (the scatterplot) after “conditioning” on
    a subset defined by a complementary view (the histogram). This is
    analogous to the penguins dataset example – only the form of the
    base plots has changed.

4.  The main logic needed to link these views is given in the block
    below. The histogram `plotOutput` in the UI is given a brush which
    will be used to select years[1]. We use the `selected` reactive
    value to store a list of `TRUE/FALSE`’s indicating which movie falls
    into the currently brushed time range. Each time the brushed range
    is changed, the `output$scatterplot` and `output$table` outputs are
    regenerated, highlighting those movies that appear in the
    `selected()` list.

        ui <- fluidPage(
          fluidRow(
            column(6, plotOutput("histogram", brush = brushOpts("plot_brush", direction = "x"))),
            column(6, plotOutput("scatterplot"))
          ),
          dataTableOutput("table")
        )

        server <- function(input, output) {
          selected <- reactiveVal(rep(TRUE, nrow(movies)))

          observeEvent(
            input$plot_brush,
            selected(reset_selection(movies, input$plot_brush))
          )

          output$histogram <- renderPlot(histogram(movies))
          output$scatterplot <- renderPlot(scatterplot(movies, selected()))
          output$table <- renderDataTable(data_table(movies, selected()))
        }

5.  We haven’t included the full code for `histogram`, `scatterplot`,
    and `data_table`, since they in and of themselves don’t require any
    logic for interactivity. You can try out the full code
    [here](https://github.com/krisrs1128/stat679_code/blob/main/examples/week3/3-3/3-3-1/app.R)
    and tinker with the interface below.

    <iframe src="https://data-viz.it.wisc.edu/content/1014c0e9-cf88-4b8d-93a6-52fd77669c23/" allowfullscreen="" data-external="1" height=700 width=600></iframe>

6.  A natural extension of the previous app is to allow brushing on both
    the histogram and the scatterplot. Brushing over the scatterplot
    would show the years during which the selected movies were released
    – this can be used to find out if very poorly or highly rated movies
    are associated with specific time ranges, for example.

7.  The updated application is below. The main differences are that,

    -   The scatterplot `plotOutput` now includes a brush.
    -   We are passing in the reactive value of the `selected()` movies
        into the histogram as well.

    <!-- -->

        ui <- fluidPage(
          fluidRow(
            column(6, plotOutput("histogram", brush = brushOpts("plot_brush", direction = "x"))),
            column(6, plotOutput("scatterplot", brush = "plot_brush"))
          ),
          dataTableOutput("table")
        )

        server <- function(input, output) {
          selected <- reactiveVal(rep(TRUE, nrow(movies)))

          observeEvent(
            input$plot_brush,
            selected(reset_selection(movies, input$plot_brush))
          )

          output$histogram <- renderPlot(histogram(movies, selected()))
          output$scatterplot <- renderPlot(scatterplot(movies, selected()))
          output$table <- renderDataTable(data_table(movies, selected()))
        }

        shinyApp(ui, server)

8.  For the scatterplot, we simply reduced the transparency for the
    movies that weren’t selected. We cannot do this for the histogram,
    though, because the movies are not directly represented in this
    plot, only their counts over time. Instead, our idea will be to draw
    two overlapping histograms. A static one in the background will
    represent the year distribution before any selection. A changing one
    in the foreground will be redrawn whenever the selected movies are
    changed. For example, the code below overlays two `geom_bar` layers,
    with one corresponding only to the first 500 movies in the dataset.

          sub_counts <- movies[1:500, ] %>%
            count(year)

          movies %>%
            count(year) %>%
            ggplot(aes(year, n)) +
            geom_bar(stat = "identity", fill = "#d3d3d3", width = 1) +
            geom_bar(data = sub_counts, stat = "identity", width = 1) +
            scale_y_continuous(expand = c(0, 0))

    ![](/stat679_notes/assets/week3-3/unnamed-chunk-6-1.png)

9.  Combining these ideas leads to the app
    [here](https://github.com/krisrs1128/stat679_code/blob/main/examples/week3/3-3/3-3-2/app.R)
    and included below. Try brushing on both the scatterplot and the
    histogram. The especially interesting thing about this approach is
    that, without introducing any new screen elements, we’ve widened the
    class of questions of that can be answered. In a sense, we’ve
    increased the information density of the display – we can present
    more information without having to introduce any peripheral UI
    components or graphical marks.

    <iframe src="https://data-viz.it.wisc.edu/content/fae55716-8e52-4f6e-ae29-4db14c063002/" allowfullscreen data-external="1" height="700" width="600">
    </iframe>

10. In our last problem, we would like to use a dataset of flight delays
    to understand what characteristics of the flights make some more /
    less likely to be delayed. The basic difficulty is that there are
    many potentially relevant variables, and they might interact in ways
    that are not obvious in advance.

        library(nycflights13)
        head(flights)

        ## # A tibble: 6 × 19
        ##    year month   day dep_time sched_dep…¹ dep_d…² arr_t…³ sched…⁴ arr_d…⁵ carrier
        ##   <int> <int> <int>    <int>       <int>   <dbl>   <int>   <int>   <dbl> <chr>  
        ## 1  2013     1     1      517         515       2     830     819      11 UA     
        ## 2  2013     1     1      533         529       4     850     830      20 UA     
        ## 3  2013     1     1      542         540       2     923     850      33 AA     
        ## 4  2013     1     1      544         545      -1    1004    1022     -18 B6     
        ## 5  2013     1     1      554         600      -6     812     837     -25 DL     
        ## 6  2013     1     1      554         558      -4     740     728      12 UA     
        ## # … with 9 more variables: flight <int>, tailnum <chr>, origin <chr>,
        ## #   dest <chr>, air_time <dbl>, distance <dbl>, hour <dbl>, minute <dbl>,
        ## #   time_hour <dttm>, and abbreviated variable names ¹​sched_dep_time,
        ## #   ²​dep_delay, ³​arr_time, ⁴​sched_arr_time, ⁵​arr_delay

11. Our solution strategy will be to dynamically link complementary
    histograms. By brushing the histogram of delays time, we’ll be able
    to see the conditional distributions for other variables of
    interest. In principle, we could do this for every variable in the
    dataset, but for the example, we’ll focus on just the scheduled
    departure time and flight distance.

12. The UI in this case creates three separate histograms, each of which
    introduces a brush. We will plan on brushing one histogram at a
    time, which is then used to update overlays on each.

          ui <- fluidPage(
          fluidRow(
            column(
              6, 
              plotOutput("h1", brush = brushOpts("plot_brush", direction = "x"), height = 200),
              plotOutput("h2", brush = brushOpts("plot_brush", direction = "x"), height = 200),
              plotOutput("h3", brush = brushOpts("plot_brush", direction = "x"), height = 200)
            ),
            column(6, dataTableOutput("table"))
          ),
        )

13. The logic for drawing the overlays is encapsulated by the functions
    below. The `bar_plot` function draws two bar plots over one another,
    one referring to a global `counts` object of unchanging histogram
    bar heights. The second refers to the bar heights for the
    continually updated overlays. Notice that we use `.data[[v]]` to use
    variable names encoded in strings. The `plot_overlay` function
    provides the histogram bar heights for variable `v` after brushing
    over the flights in `selected_`.

        bar_plot <- function(sub_flights, v) {
          ggplot(counts[[v]], aes(.data[[v]], n)) +
            geom_bar(fill = "#d3d3d3", stat = "identity") +
            geom_bar(data = sub_flights, stat = "identity")
        }

        plot_overlay <- function(selected_, v) {
          flights %>%
            filter(selected_) %>%
            count(.data[[v]]) %>%
            bar_plot(v)
        }

14. Code for the full application is linked
    [here](https://github.com/krisrs1128/stat679_code/blob/main/examples/week3/3-3/3-3-3/app.R).
    Thanks to shiny’s `reactiveVal` and `brushedPoints` definitions,
    implementing interactivity only requires about 20 lines (starting
    from `ui <- ...` to the end). The rest of the code is used to draw
    new static plots depending on the current selection.

    <iframe src="https://data-viz.it.wisc.edu/content/02da9288-2810-4ce8-b92c-75177bb4cdc9/" allowfullscreen="" data-external="1" height=700 width=600></iframe>

[1] Note that we restrict brush motion to the *x*-direction. This is
because the *x* direction alone encodes year information, which we want
to select.
