library(shiny)

ui <- fluidPage(
  titlePanel("Hello!"),
  textInput("name", "Enter your name"),
  textOutput("printed_name")
)

server <- function(input, output) {
  output$printed_name <- renderText({
    paste0("Welcome to shiny, ", input$name, "!")
  })
}

app <- shinyApp(ui, server)