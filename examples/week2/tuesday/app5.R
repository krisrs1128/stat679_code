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