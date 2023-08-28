library(shiny)
library(tidyverse)
library(broom)

### Functions within app components
generate_data <- function(n, mean1, mean2, sigma) {
  data.frame(
    values = c(rnorm(n, mean1, sigma), rnorm(n, mean2, sigma)),
    group = rep(c("A", "B"), each = n)
  )
}

histogram_fun <- function(df) {
  ggplot(df) +
    geom_histogram(
      aes(values, fill = group), 
      bins = 100, position = "identity",
      alpha = 0.8
    ) +
    xlim(-10, 10)
}

test_fun <- function(df) {
  t.test(values ~ group, data = df) %>%
    tidy() %>%
    select(p.value, conf.low, conf.high)
}

### Defines the app
ui <- fluidPage(
  sidebarLayout(
    sidebarPanel(
      sliderInput("mean1", "Mean (Group 1)", 0, min = -10.0, max = 10.0, step = 0.1),
      sliderInput("mean2", "Mean (Group 2)", 0, min = -10, max = 10, step = 0.1),
      sliderInput("sigma", "Enter the standard deviation", 1, min=.1, max=5),
      sliderInput("n", "Enter the number of samples", 500, min=1, max=2000),
    ),
    mainPanel(
      plotOutput("histogram"),
      dataTableOutput("test_result")
    )
  )
)

server <- function(input, output) {
  samples <- reactive({
    generate_data(input$n, input$mean1, input$mean2, input$sigma)
  })
  output$histogram <- renderPlot(histogram_fun(generate_data(input$n, input$mean1, input$mean2, input$sigma)))
  output$test_result <- renderDataTable(test_fun(generate_data(input$n, input$mean1, input$mean2, input$sigma)))
}

app <- shinyApp(ui, server)