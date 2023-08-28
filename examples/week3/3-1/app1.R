library(tidyverse)
library(shiny)

# wrapper to get the distances from points to clicks
reset_dist <- function(x, click) {
  nearPoints(x, click, allRows = TRUE, addDist = TRUE)$dist_
}

# scatterplot plot with point size dependent on click location
scatter <- function(x, dists) {
  x %>%
    mutate(dist = dists) %>%
    ggplot() +
    geom_point(aes(mpg, hp, size = dist)) +
    scale_size(range = c(6, 1))
}

ui <- fluidPage(
  plotOutput("plot", click = "plot_click")
)

server <- function(input, output) {
  dist <- reactiveVal(rep(1, nrow(mtcars)))
  observeEvent(
    input$plot_click,
    dist(reset_dist(mtcars, input$plot_click))
  )
  
  output$plot <- renderPlot(scatter(mtcars, dist()))
}

shinyApp(ui, server)