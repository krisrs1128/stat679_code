
library(tidyverse)
library(igraph)
library(tidygraph)
library(ggraph)
set.seed(123)

n <- 200
K <- 3
P <- matrix(0.001, nrow = K, ncol = K)
diag(P) <- .25

G <- sample_sbm(n, P, rmultinom(1, n, rep(1 / K, K))[, 1]) %>%
  as_tbl_graph() %>%
  mutate(
    year = sample(1800:2000, n(), replace = TRUE),
    index = row_number() - 1,
    cluster = group_louvain()
  ) %E>%
  mutate(
    close = abs(.N()$year[from] - .N()$year[to]) < 40,
    source = from - 1,
    target = to - 1
  ) %>%
  filter(close)

ggraph(G) +
  geom_edge_link() +
  geom_node_point(aes(col = as.factor(cluster)))

## build in the layout constraints
constraints <- list()
nodes <- G %N>%
  as_tibble() %>%
  arrange(year)

k <- 1
for (i in seq_len(nrow(nodes))) {
  for (j in seq_len(nrow(nodes))) {
    if (nodes$year[i] > nodes$year[j] & abs(nodes$year[i] - nodes$year[j]) < 5) {
      constraints[[k]] <- list(axis = "y", left = nodes$index[i], right = nodes$index[j], gap = 4, type = "separation")
      k <- k + 1
    }
  }
}

groups <- nodes %>%
  select(cluster, index) %>%
  rename(leaves = index) %>%
  split(.$cluster) %>%
  map(~ as.list(.))
for (k in 1:K) {
  groups[[k]]$id <- k
}

edges <- G %>% as_tibble() %>% select(source, target)
nodes <- G %N>% as_tibble()
constraints <- bind_rows(constraints)

list(edges = edges, nodes = nodes, constraints = constraints, groups = groups) %>%
  write_json("royalty_sim.json")
