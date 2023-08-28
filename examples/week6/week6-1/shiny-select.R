
library(tidyverse)
library(shiny)
library(r2d3)
library(jsonlite)

gapminder <- read_csv("gapminder.csv")
continents <- gapminder %>%
  pull(continent) %>%
  unique()

ui <- fluidPage(
  selectInput("continents", "Continents", continents, multiple = TRUE),
  sliderInput("year", "Year", min(gapminder$year), max(gapminder$year), min(gapminder$year)),
  d3Output("scatterplot")
)

server <- function(input, output) {
  output$scatterplot <- renderD3(
    r2d3(
      list(gapminder = toJSON(gapminder), year = input$year, continents = input$continents),
      "shiny-select.js",
      css = "gapminder.css",
      dependencies = c("d3-selection-multi.v1.min.js")
    )
  )
}

shinyApp(ui, server)