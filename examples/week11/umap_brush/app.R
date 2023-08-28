library(tidyverse)
library(embed)
library(shiny)

theme_set(theme_bw())
cocktails_df <- read_csv("https://uwmadison.box.com/shared/static/qyqof2512qsek8fpnkqqiw3p1jb77acf.csv")
umap_rec <- recipe(~., data = cocktails_df) %>%
  update_role(name, category, new_role = "id") %>%
  step_normalize(all_predictors()) %>%
  step_umap(all_predictors(), neighbors = 20, min_dist = 0.1)
umap_prep <- prep(umap_rec)
umap_scores <- juice(umap_prep)

reset_selection <- function(x, brush) {
  brushedPoints(x, brush, allRows = TRUE)$selected_
}

ui <- fluidPage(
  plotOutput("umap", brush = "plot_brush"),
  dataTableOutput("table")
)

server <- function(input, output) {
  selected <- reactiveVal(rep(FALSE, nrow(umap_scores)))

  output$umap <- renderPlot({
    umap_scores %>%
      mutate(selected_ = selected()) %>%
      arrange(UMAP1) %>%
      ggplot(aes(UMAP1, UMAP2)) +
        geom_point(aes(color = category, alpha = as.numeric(selected_)), size = 0.8) +
        geom_text(aes(label = name, alpha = as.numeric(selected_)), check_overlap = TRUE, size = 3, hjust = "inward") +
        scale_alpha(c(0.2, 0.9), guide = FALSE)
  })
  
  output$table <- renderDataTable({
    filter(umap_scores, selected())
  })

  observeEvent(input$plot_brush, {
    selected(reset_selection(umap_scores, input$plot_brush))
  })
}

shinyApp(ui, server)
