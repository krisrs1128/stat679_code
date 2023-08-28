library(DT)
library(shiny)
library(tidyverse)
library(nycflights13)

flights <- flights %>%
  filter(dep_delay < 200, distance < 3000) %>%
  mutate(
    sched_dep_time = round(sched_dep_time, -2),
    distance = round(distance, -2)
  )
counts <- list(
  "dep_delay" = count(flights, dep_delay),
  "sched_dep_time" = count(flights, sched_dep_time),
  "distance" = count(flights, distance)
)

bar_plot <- function(sub_flights, v, width = 100) {
  ggplot(counts[[v]], aes(.data[[v]], n)) +
    geom_bar(fill = "#d3d3d3", stat = "identity", width = width) +
    geom_bar(data = sub_flights, stat = "identity", width = width)
}

plot_overlay <- function(selected_, v, width = 100) {
  flights %>%
    filter(selected_) %>%
    count(.data[[v]]) %>%
    bar_plot(v, width)
}

reset_selection <- function(x, brush) {
  xvar <- str_match(brush$mapping$x, "dep_delay|sched_dep_time|distance")[1]
  brushedPoints(x, brush, allRows = TRUE, xvar = xvar)$selected_
}

ui <- fluidPage(
  fluidRow(
    column(
      4, 
      plotOutput("h1", brush = brushOpts("plot_brush", direction = "x"), height = 200),
      plotOutput("h2", brush = brushOpts("plot_brush", direction = "x"), height = 200),
      plotOutput("h3", brush = brushOpts("plot_brush", direction = "x"), height = 200)
    ),
    column(6, dataTableOutput("table"))
  ),
)
server <- function(input, output) {
  selected <- reactiveVal(rep(TRUE, nrow(flights)))
  
  observeEvent(
    input$plot_brush,
    selected(reset_selection(flights, input$plot_brush))
  )
  
  output$h1 <- renderPlot(plot_overlay(selected(), "dep_delay", width = 1))
  output$h2 <- renderPlot(plot_overlay(selected(), "sched_dep_time"))
  output$h3 <- renderPlot(plot_overlay(selected(), "distance"))
  output$table <- renderDataTable(filter(flights, selected()))
}

shinyApp(ui, server)