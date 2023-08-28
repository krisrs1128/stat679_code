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