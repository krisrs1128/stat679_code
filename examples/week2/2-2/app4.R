library(shiny)
library(plotly)

cities <- unique(txhousing$city)

ui <- fluidPage(
  selectizeInput(
    inputId = "cities", 
    label = NULL,
    # placeholder is enabled when 1st choice is an empty string
    choices = c("Please choose a city" = "", cities), 
    multiple = TRUE
  ),
  plotlyOutput(outputId = "p")
)

server <- function(input, output, session, ...) {
  output$p <- renderPlotly({
    if (identical(input$cities, "")) return(NULL)
    p <- ggplot(data = filter(txhousing, city %in% input$cities)) + 
      geom_line(aes(date, median, group = city))
    height <- session$clientData$output_p_height
    width <- session$clientData$output_p_width
    ggplotly(p, height = height, width = width)
  })
}

shinyApp(ui, server)
