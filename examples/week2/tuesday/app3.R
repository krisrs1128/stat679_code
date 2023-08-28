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