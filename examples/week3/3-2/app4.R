library(tidyverse)
library(shiny)
penguins <- read_csv("https://uwmadison.box.com/shared/static/ijh7iipc9ect1jf0z8qa2n3j7dgem1gh.csv")

reset_selection <- function(x, brush) {
  brushedPoints(x, brush, allRows = TRUE)$selected_
}

scatter <- function(x, selected_, var1, var2) {
  x %>%
    mutate(selected_ = selected_) %>%
    ggplot(aes_string(var1, var2)) +
    geom_point(aes(alpha = as.numeric(selected_), col = species)) +
    scale_alpha(range = c(0.1, 1))
}

ui <- fluidPage(
  fluidRow(
    column(6, plotOutput("scatter1", brush = "plot_brush")),
    column(6, plotOutput("scatter2", brush = "plot_brush"))
  ),
  dataTableOutput("table")
)

server <- function(input, output) {
  selected <- reactiveVal(rep(TRUE, nrow(penguins)))
  observeEvent(
    input$plot_brush,
    selected(reset_selection(penguins, input$plot_brush))
  )
  
  output$scatter1 <- renderPlot({
    scatter(penguins, selected(), "bill_length_mm", "bill_depth_mm")
  })
  output$scatter2 <- renderPlot({
    scatter(penguins, selected(), "flipper_length_mm", "body_mass_g")
  })
  
  output$table <- renderDataTable(filter(penguins, selected()))
}

shinyApp(ui, server)
