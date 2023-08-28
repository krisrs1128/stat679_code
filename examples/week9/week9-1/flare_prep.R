
library(ggraph)
test <- flare$vertices %>%
  left_join(flare$edges, by = c("name" = "to")) %>%
  rename(to = name) %>%
  filter(to != "flare")
write_csv(test, "~/Desktop/teaching/stat679_code/examples/week9/week9-1/flare_treemap.csv")

setdiff(test$from, test$to)
