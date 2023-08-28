library(tidyverse)
library(shiny)
mtcars <- add_rownames(mtcars)

reset_dist <- function(x, click) {
  nearPoints(x, click, allRows = TRUE, addDist = TRUE)$dist_
}

make_scatter <- function(x) {
  ggplot(x) +
    geom_point(aes(mpg, hp, size = dist)) +
    scale_size(range = c(6, 1))
}

ui <- fluidPage(
  plotOutput("plot", click = "plot_click"), # defines both an input and output
  dataTableOutput("table")
)

server <- function(input, output) {
  dist <- reactiveVal(rep(1, nrow(mtcars)))
  observeEvent(
    input$plot_click,
    dist(reset_dist(mtcars, input$plot_click))
  )
  
  output$plot <- renderPlot({
    mtcars$dist <- dist()
    make_scatter(mtcars)
  })
  
  output$table <- renderDataTable({
    mtcars$dist <- dist()
    mtcars %>%
      arrange(dist)
  })
}

shinyApp(ui, server)