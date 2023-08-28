
#' prepare data for x-men streamgraph. See for example,
#' https://github.com/d3/d3-shape/blob/main/README.md#stack

# widen so each key in a column
library(tidyverse)
xmen <- read_csv("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week7/week7-1/x-men.csv") %>%
  select(-rank, -character) %>%
  unite(key, char_popular, costume) %>%
  pivot_wider(names_from = "key", values_from = "depicted")

# smooth it out
for (j in 2:ncol(xmen)) {
  xmen[, j] <- smooth.spline(xmen$issue, xmen[[j]], spar = 0.3)$y
}

write_csv(xmen, "xmen-wide.csv")