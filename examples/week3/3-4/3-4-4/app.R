library(shiny)
library(bslib)

ui <- fluidPage(
  theme = bs_theme(
    bootswatch = "simplex",
    base_font = font_google("Combo"),
    heading_font = font_google("Rubik Moonrocks")
  ),
  titlePanel("Old Faithful Geyser Data"),
  sidebarLayout(
    sidebarPanel(
      sliderInput("bins", "Number of bins:", min = 1, max = 50, value = 30) 
      ),
    mainPanel(
      plotOutput("distPlot"),
      p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet ligula quis sapien condimentum lacinia. Nam vel erat bibendum, varius nulla in, maximus mauris. Praesent maximus vitae enim et suscipit. Donec vel erat euismod, sodales ex a, pharetra felis. Praesent dapibus nibh tincidunt molestie vestibulum. Donec convallis consequat nibh at rutrum. Sed sed condimentum sem. Curabitur efficitur magna tellus, id accumsan libero posuere non. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas eget ligula quis nunc vehicula elementum. Mauris pretium fringilla iaculis. Maecenas id leo non nulla sodales pellentesque. Aenean viverra tellus finibus, laoreet sapien eu, eleifend augue. Donec bibendum felis id ex vehicula sagittis. Aenean dapibus, urna dapibus laoreet sagittis, urna justo lobortis felis, vestibulum ullamcorper felis odio ac mauris.")
      )
  )
)

server <- function(input, output) {
    output$distPlot <- renderPlot({
        x    <- faithful[, 2]
        bins <- seq(min(x), max(x), length.out = input$bins + 1)
        hist(x, breaks = bins, col = 'darkgray', border = 'white',
             xlab = 'Waiting time to next eruption (in mins)',
             main = 'Histogram of waiting times')
    }, bg = NA)
}

shinyApp(ui = ui, server = server)
