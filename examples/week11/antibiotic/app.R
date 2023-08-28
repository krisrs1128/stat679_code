library(tidyverse)
library(RcppRoll)
library(shiny)
library(tidymodels)
library(ggrepel)
theme_set(theme_bw())

antibiotic <- read_csv("https://uwmadison.box.com/shared/static/t1lifegdz8s0a8lgckber32ytyh9hu4r.csv")
taxa <- read_csv("https://uwmadison.box.com/shared/static/ng6y6etk79lrm0gtsgw2u0yq6gqcozze.csv")
antibiotic_ <- recipe(~ ., data = antibiotic) %>%
  update_role(sample:antibiotic, new_role = "id") %>%
  step_log(all_predictors(), offset = 1) %>%
  step_normalize(all_predictors())

reset_selection <- function(x, brush) {
  brushedPoints(x, brush, allRows = TRUE)$selected_
}


ui <- fluidPage(
  sliderInput("window", "Window Size", min = 3, max = 21, value = 7, step = 2),
  plotOutput("scores", brush = "plot_brush"),
  plotOutput("ts")
)

server <- function(input, output) {
  selected <- reactiveVal(rep(FALSE, nrow(antibiotic)))
  observeEvent(input$plot_brush, {
    selected(reset_selection(pca_scores(), input$plot_brush))
  })
  
  updated_recipe <- reactive({
    antibiotic_ %>%
      step_window(all_predictors(), size = input$window)
  })
  
  pca_scores <- reactive({
    pca_prep <- updated_recipe() %>%
      step_pca(all_predictors()) %>%
      prep()
    
    juice(pca_prep)
  })
  
  output$scores <- renderPlot({
    ggplot(pca_scores(), aes(PC1, PC2, col = antibiotic)) +
      geom_point(aes(shape = ind), size = 1.5) +
      geom_text_repel(aes(label = sample), check_overlap = TRUE, size = 3) +
      scale_color_brewer(palette = "Set2")
  })
  
  output$ts <- renderPlot({
    updated_data <- updated_recipe() %>%
      prep() %>%
      bake(antibiotic)
    
    if (!any(selected())) {
      filter_ix <- rep(TRUE, nrow(antibiotic))
    } else {
      filter_ix <- selected()
    }
    
    sorted_species <- updated_recipe() %>%
        prep() %>%
        bake(antibiotic) %>%
        select(starts_with("Unc")) %>%
        filter(filter_ix)
    
    cur_species <- sorted_species %>%
      colMeans() %>%
      sort(decreasing = TRUE) %>%
      names()
    
    updated_data %>%
      select(ind, time, antibiotic, all_of(cur_species[1:5])) %>%
      pivot_longer(starts_with("Unc"), names_to = "species") %>%
      ggplot() +
        geom_line(aes(time, value, group = interaction(ind, species))) +
        facet_grid(. ~ ind)
  })
}

shinyApp(ui, server)
