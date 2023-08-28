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