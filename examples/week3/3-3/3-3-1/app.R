library(DT)
library(shiny)
library(tidyverse)
library(lubridate)

# read in and clean the dataset
movies <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat479_s22/main/_posts/2022-02-10-week04-03/apps/data/movies.csv") %>%
  mutate(
    id = row_number(),
    date = as_date(Release_Date, format = "%b %d %Y"),
    year = year(date),
    Major_Genre = fct_explicit_na(Major_Genre),
    MPAA_Rating = fct_explicit_na(MPAA_Rating),
  )

# helper functions used to generate the selection and plots
reset_selection <- function(x, brush) {
  brushedPoints(x, brush, allRows = TRUE)$selected_
}

histogram <- function(movies) {
  movies %>%
    count(year) %>%
    ggplot() +
    geom_bar(aes(year, n), stat = "identity", width = 1) +
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

# create the app
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

shinyApp(ui, server)