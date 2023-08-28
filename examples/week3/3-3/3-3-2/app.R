library(DT)
library(shiny)
library(tidyverse)
library(lubridate)

movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
  mutate(
    date = as_date(Release_Date, format = "%b %d %Y"),
    year = year(date),
    Major_Genre = fct_explicit_na(Major_Genre)
  )


reset_selection <- function(x, brush) {
  brushedPoints(x, brush, allRows = TRUE)$selected_
}

histogram <- function(movies, selected_) {
  sub_counts <- movies %>%
    filter(selected_) %>%
    count(year)
  
  movies %>%
    count(year) %>%
    ggplot(aes(year, n)) +
    geom_bar(stat = "identity", fill = "#d3d3d3", width = 1) +
    geom_bar(data = sub_counts, stat = "identity", width = 1) +
    scale_y_continuous(expand = c(0, 0))
}

scatterplot <- function(movies, selected_) {
    movies %>%
      mutate(selected_ = selected_) %>%
      ggplot() +
      geom_point(aes(Rotten_Tomatoes_Rating, IMDB_Rating, alpha = as.numeric(selected_))) +
      scale_alpha(range = c(0.05, 0.6))
}

data_table <- function(movies, selected_) {
  movies %>%
    filter(selected_) %>%
    select(Title, Major_Genre, Worldwide_Gross, Director, Release_Date)
}


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