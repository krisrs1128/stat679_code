
library(shiny)
library(r2d3)
library(jsonlite)

interactome <- read_json("interactome.json")
centralities <- read_json("centrality_bins.json")

ui <- fluidPage(
  column(8, d3Output("network")),
  column(4, d3Output("histogram"))
)

server <- function(input, output) {
  output$network <- renderD3({
    r2d3(
      list(interactome, input$centrality_range),
      script = "edge_brush.js",
      dependencies = c("d3-selection-multi.v1.min.js"),
      css = "interactome.css"
    )
  })

  output$histogram <- renderD3({
    r2d3(
      centralities,
      script = "histogram.js",
      dependencies = c("d3-selection-multi.v1.min.js"),
      css = "interactome.css"
    )
  })
}

shinyApp(ui, server)
