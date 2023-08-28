library(shiny)

ui <- fluidPage(
  titlePanel("Hello!"),
  textInput("name", "Enter your name")  # first arg is ID, second is label
)

server <- function(input, output) {}
app <- shinyApp(ui, server)
