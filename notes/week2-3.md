---
title: IMDB Shiny Application
layout: post
output:
  md_document:
    preserve_yaml: true
---

*Using Shiny to explore a movies dataset*

[Recording](https://mediaspace.wisc.edu/media/Week+2+-+3A+IMDB+Shiny+Application/1_yitx0198),
[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week2-3.Rmd)

1.  So far, all of our Shiny applications have been based on toy
    simulated data. In this set of notes, we’ll use Shiny to explore a
    real dataset, illustrating the general development workflow in the
    process. Before diving into code, let’s consider the role of
    interactivity in data analysis.

2.  A major difference between doing visualization on paper and on
    computers is that visualization on computers can make use of
    interactivity. An interactive visualization is one that changes in
    response to user cues. This allows a display to update in a way that
    provides a visual comparison that was not available in a previous
    view. In this way, interactive visualization allows users to answer
    a sequence of questions.

3.  Selection, both of observations and of attributes, is fundamental to
    interactive visualization. This is because it precedes other
    interactive operations: you can select a subset of observations to
    filter down to or attributes to coordinate across multiple displays
    (we consider both types of interactivity in later lectures).

4.  The code below selects movies to highlight based on Genre. We use a
    `selectInput` to create the dropdown menu. A reactive expression
    creates a new column (`selected`) in the `movies` dataset
    specifiying whether the current movie is selected. The reactive
    graph structure means that the ggplot2 figure is recreated each time
    the selection is changed, and the `selected` column is used to shade
    in the points. This process of changing the visual encoding of
    graphical marks depending on user selections is called “conditional
    encoding.”

        library(shiny)
        library(tidyverse)
        library(lubridate)

        movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
          mutate(
            date = as_date(Release_Date, format = "%b %d %Y"),
            year = year(date),
            Major_Genre = fct_explicit_na(Major_Genre),
            MPAA_Rating = fct_explicit_na(MPAA_Rating),
          )

        genres <- pull(movies, Major_Genre) %>%
          unique() %>%
          na.omit()

        ### functions used in app
        scatterplot <- function(df) {
          ggplot(df) +
            geom_point(
              aes(Rotten_Tomatoes_Rating, IMDB_Rating, size = selected, alpha = selected)
            ) +
            scale_size(limits = c(0, 1), range = c(.5, 2), guide = "none") +
            scale_alpha(limits = c(0, 1), range = c(.1, 1), guide = "none")
        }

        ### definition of app
        ui <- fluidPage(
          titlePanel("IMDB Analysis"),
          selectInput("genres", "Genre", genres),
          plotOutput("ratings_scatter")
        )

        server <- function(input, output) {
          movies_subset <- reactive({
            movies %>%
              mutate(selected = 1 * (Major_Genre %in% input$genres))
          })

          output$ratings_scatter <- renderPlot({
            scatterplot(movies_subset())
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/02971f81-3af5-4fdb-89d7-84a663778546/" allowfullscreen="" data-external="1" height=550 width=600></iframe>

    ![](/https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/figures/initial_imdb.png)

5.  We can extend this further. Let’s allow the user to filter by year
    and MPAA rating. Notice that there are some years in the future! We
    also find that there are systematic differences in IMDB and Rotten
    Tomatoes ratings as a function of these variables.

        library(shiny)
        library(tidyverse)
        library(lubridate)

        movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
          mutate(
            date = as_date(Release_Date, format = "%b %d %Y"),
            year = year(date),
            Major_Genre = fct_explicit_na(Major_Genre),
            MPAA_Rating = fct_explicit_na(MPAA_Rating),
          )

        genres <- pull(movies, Major_Genre) %>%
          unique() %>%
          na.omit()
        ratings <- pull(movies, MPAA_Rating) %>%
          unique() %>%
          na.omit()

        ### functions used in app
        scatterplot <- function(df) {
          ggplot(df) +
            geom_point(
              aes(Rotten_Tomatoes_Rating, IMDB_Rating, size = selected, alpha = selected)
            ) +
            scale_size(limits = c(0, 1), range = c(.5, 2), guide = "none") +
            scale_alpha(limits = c(0, 1), range = c(.1, 1), guide = "none")
        }

        ### definition of app
        ui <- fluidPage(
          titlePanel("IMDB Analysis"),
          selectInput("genres", "Genre", genres, multiple = TRUE),
          checkboxGroupInput("mpaa", "MPAA Rating", ratings, ratings),
          sliderInput("year", "Year", min = min(movies$year), max = max(movies$year), c(1928, 2020), sep = ""),
          plotOutput("ratings_scatter")
        )

        server <- function(input, output) {
          movies_subset <- reactive({
            movies %>%
              mutate(selected = 1 * (
                (Major_Genre %in% input$genres) &
                (MPAA_Rating %in% input$mpaa) &
                (year >= input$year[1]) &
                (year <= input$year[2])
              ))
          })

          output$ratings_scatter <- renderPlot({
            scatterplot(movies_subset())
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/9036974c-176a-4e9b-963d-c25eb45f5635/" allowfullscreen="" data-external="1" height=900 width=600></iframe>

    ![](/https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/figures/final_imdb.png)

6.  We’ll include a final version of this plot which additionally shows
    the movie name when points are hovered. To accomplish this, we can
    no longer use `ggplot2` on its own – it has to be linked with a
    plotting library that renders web-based visualizations (not just
    static image files). This is what the `ggplotly()` call does in the
    updated version of the app. The mouseover text is added through the
    `tooltip` argument.

        library(shiny)
        library(tidyverse)
        library(lubridate)
        library(plotly)

        movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
          mutate(
            date = as_date(Release_Date, format = "%b %d %Y"),
            year = year(date),
            Major_Genre = fct_explicit_na(Major_Genre),
            MPAA_Rating = fct_explicit_na(MPAA_Rating),
          )

        genres <- pull(movies, Major_Genre) %>%
          unique() %>%
          na.omit()
        ratings <- pull(movies, MPAA_Rating) %>%
          unique() %>%
          na.omit()

        ### functions used in app
        scatterplot <- function(df) {
          p <- ggplot(mapping = aes(Rotten_Tomatoes_Rating, IMDB_Rating)) +
            geom_point(data = df %>% filter(selected),  aes(text = Title), size = 2, alpha = 1) +
            geom_point(data = df %>% filter(!selected),  size = .5, alpha = .1)
          ggplotly(p, tooltip = "Title") %>%
            style(hoveron = "fill")
        }

        ### definition of app
        ui <- fluidPage(
          titlePanel("IMDB Analysis"),
          selectInput("genres", "Genre", genres),
          checkboxGroupInput("mpaa", "MPAA Rating", ratings, ratings),
          sliderInput("year", "Year", min = min(movies$year), max = max(movies$year), c(1928, 2020), sep = ""),
          plotlyOutput("ratings_scatter")
        )

        server <- function(input, output) {
          movies_subset <- reactive({
            movies %>%
              mutate(selected = (
                (Major_Genre %in% input$genres) &
                (MPAA_Rating %in% input$mpaa) &
                (year >= input$year[1]) &
                (year <= input$year[2])
              ))
          })

          output$ratings_scatter <- renderPlotly({
            scatterplot(movies_subset())
          })
        }

        app <- shinyApp(ui, server)

    <iframe src="https://data-viz.it.wisc.edu/content/2151742d-4b80-4200-9b91-55dda592a9f6/" allowfullscreen="" data-external="1" height=900 width=600></iframe>

7.  These visualizations are an instance of the more general idea of
    using filtering to reduce complexity in data. Filtering is an
    especially powerful technique in the interactive paradigm, where it
    is possible to easily reverse (or compare) filtering choices.

8.  Conceptually, what we are doing falls under the name of “Dynamic
    Querying,” which refers more generally to updating a visualization
    based on user queries. There are several ways to think about these
    dynamic queries,

    -   Interpretation 1: Dynamic queries create the visual analog of a
        database interaction. Rather than using a programming-based
        interface to filter elements or select attributes, we can design
        interactive visual equivalents.
    -   Interpretation 2: Dynamic queries allow rapid evaluation of
        conditional probabilities. The visualization above was designed
        to answer: What is the joint distribution of movie ratings,
        conditional on being a drama?
