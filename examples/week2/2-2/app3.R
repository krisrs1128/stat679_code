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