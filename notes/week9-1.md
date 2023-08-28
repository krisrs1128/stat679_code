---
title: Manipulating Graph Data
layout: post
output:
  md_document:
    preserve_yaml: true
---

*Reading and modifying graph data*

[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week9-1.Rmd),
[Recording](https://mediaspace.wisc.edu/media/Week%209%20-%201%3A%20Manipulating%20Graph%20Data/1_co3nvevc)

    library(tidygraph)
    library(ggraph)
    theme_set(theme_bw())

1.  Before diving into graph data visualization, let’s get some
    experience manipulating graphs hands on. One of the best R packages
    for graph manipulation is called `tidygraph`. The goal of this
    package is to extend the semantics of the tidyverse to
    graph-structured data. We can’t simply use the standard `dplyr`
    functions because graphs cannot be stored in simple data.frames –
    any graph must be represented by two data structures, a set of nodes
    and a set of edges.

2.  This can be usefully organized as a pair of `data.frames`, and the
    `tidygraph` structure represents graphs in exactly this way. For
    example, `G` below is a tidy graph structure showing the friendship
    connections between 70 students in a high school over two years. The
    `Node Data` component gives features for each student (in this case,
    just the name), while `Edge Data` represents friendship links
    between students.

        G <- as_tbl_graph(highschool)
        G

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # A directed multigraph with 1 component
        ## #
        ## # Node Data: 70 × 1 (active)
        ##   name 
        ##   <chr>
        ## 1 1    
        ## 2 2    
        ## 3 3    
        ## 4 4    
        ## 5 5    
        ## 6 6    
        ## # … with 64 more rows
        ## #
        ## # Edge Data: 506 × 3
        ##    from    to  year
        ##   <int> <int> <dbl>
        ## 1     1    13  1957
        ## 2     1    14  1957
        ## 3     1    20  1957
        ## # … with 503 more rows

3.  The beauty of this data structure is that we can define the analogs
    of the usual tidyverse verbs for it. For example, we can derive a
    new node attribute using `mutate`.

        G %>%
          mutate(favorite_color = sample(c("red", "blue"), n(), replace = TRUE))

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # A directed multigraph with 1 component
        ## #
        ## # Node Data: 70 × 2 (active)
        ##   name  favorite_color
        ##   <chr> <chr>         
        ## 1 1     red           
        ## 2 2     blue          
        ## 3 3     red           
        ## 4 4     red           
        ## 5 5     blue          
        ## 6 6     red           
        ## # … with 64 more rows
        ## #
        ## # Edge Data: 506 × 3
        ##    from    to  year
        ##   <int> <int> <dbl>
        ## 1     1    13  1957
        ## 2     1    14  1957
        ## 3     1    20  1957
        ## # … with 503 more rows

4.  What if we want to mutate the edges instead? We have to tell
    tidygraph to “activate” the edge set,

        G %>%
          activate(edges) %>%
          mutate(weight = runif(n()))

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # A directed multigraph with 1 component
        ## #
        ## # Edge Data: 506 × 4 (active)
        ##    from    to  year weight
        ##   <int> <int> <dbl>  <dbl>
        ## 1     1    13  1957 0.983 
        ## 2     1    14  1957 0.0474
        ## 3     1    20  1957 0.349 
        ## 4     1    52  1957 0.306 
        ## 5     1    53  1957 0.322 
        ## 6     2    20  1957 0.209 
        ## # … with 500 more rows
        ## #
        ## # Node Data: 70 × 1
        ##   name 
        ##   <chr>
        ## 1 1    
        ## 2 2    
        ## 3 3    
        ## # … with 67 more rows

    To avoid these activate calls, a convenient shorthand is calling
    mutate with `%N>%` and `%E>%` for modifying node and edge data,
    respectively,

        G %E>%
          mutate(weight = runif(n()))

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # A directed multigraph with 1 component
        ## #
        ## # Edge Data: 506 × 4 (active)
        ##    from    to  year weight
        ##   <int> <int> <dbl>  <dbl>
        ## 1     1    13  1957 0.0379
        ## 2     1    14  1957 0.896 
        ## 3     1    20  1957 0.309 
        ## 4     1    52  1957 0.150 
        ## 5     1    53  1957 0.489 
        ## 6     2    20  1957 0.0534
        ## # … with 500 more rows
        ## #
        ## # Node Data: 70 × 1
        ##   name 
        ##   <chr>
        ## 1 1    
        ## 2 2    
        ## 3 3    
        ## # … with 67 more rows

5.  There are many other verbs that have been defined for tidygraph
    objects. For example, we can join two graphs together.

        ## initialize two simple graphs
        G1 <- create_ring(10)  %N>%
          mutate(id = LETTERS[1:n()])
        G2 <- create_bipartite(4, 2) %>%
          mutate(id = LETTERS[1:n()])

        ## join them together
        G1 %>%
          graph_join(G2)

        ## # A tbl_graph: 10 nodes and 18 edges
        ## #
        ## # A directed acyclic multigraph with 1 component
        ## #
        ## # Node Data: 10 × 2 (active)
        ##   id    type 
        ##   <chr> <lgl>
        ## 1 A     FALSE
        ## 2 B     FALSE
        ## 3 C     FALSE
        ## 4 D     FALSE
        ## 5 E     TRUE 
        ## 6 F     TRUE 
        ## # … with 4 more rows
        ## #
        ## # Edge Data: 18 × 2
        ##    from    to
        ##   <int> <int>
        ## 1     1     2
        ## 2     2     3
        ## 3     3     4
        ## # … with 15 more rows

    ![](/stat679_notes/assets/week9-1/unnamed-chunk-8-1.png)

6.  Similarly, we can filter nodes or edges based on their attributes.

        G %E>%
          mutate(weight = runif(n())) %>%
          filter(weight < 0.2) %>%
          arrange(-weight)

        ## # A tbl_graph: 70 nodes and 113 edges
        ## #
        ## # A directed multigraph with 6 components
        ## #
        ## # Edge Data: 113 × 4 (active)
        ##    from    to  year weight
        ##   <int> <int> <dbl>  <dbl>
        ## 1    29    38  1958  0.198
        ## 2    46    28  1957  0.196
        ## 3    69    65  1958  0.195
        ## 4     7    16  1957  0.194
        ## 5    52    47  1957  0.192
        ## 6    59    56  1957  0.191
        ## # … with 107 more rows
        ## #
        ## # Node Data: 70 × 1
        ##   name 
        ##   <chr>
        ## 1 1    
        ## 2 2    
        ## 3 3    
        ## # … with 67 more rows

7.  It’s possible to perform simple graph algorithms using these verbs.
    For example, we can cluster nodes based on their connection
    structure.

        G %>%
          to_undirected() %>%
          mutate(cluster = group_louvain())

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # An undirected multigraph with 1 component
        ## #
        ## # Node Data: 70 × 2 (active)
        ##   name  cluster
        ##   <chr>   <int>
        ## 1 1           1
        ## 2 2           1
        ## 3 3           1
        ## 4 4           2
        ## 5 5           2
        ## 6 6           1
        ## # … with 64 more rows
        ## #
        ## # Edge Data: 506 × 3
        ##    from    to  year
        ##   <int> <int> <dbl>
        ## 1     1    13  1957
        ## 2     1    14  1957
        ## 3     1    20  1957
        ## # … with 503 more rows

    ![](/stat679_notes/assets/week9-1/unnamed-chunk-11-1.png)

8.  We can even map over nodes to compute topological queries. For
    example, the block below computes the number of neighbors within two
    steps of each node, using the [`local_size`
    function](https://tidygraph.data-imaginist.com/reference/local_graph.html).
    More general operations can be computed using map operations, like
    [`map_local`](https://tidygraph.data-imaginist.com/reference/map_local.html)
    or
    [`map_bfs`](https://tidygraph.data-imaginist.com/reference/map_bfs.html).

        G %>%
          mutate(two_steps = local_size(order = 2))

        ## # A tbl_graph: 70 nodes and 506 edges
        ## #
        ## # A directed multigraph with 1 component
        ## #
        ## # Node Data: 70 × 2 (active)
        ##   name  two_steps
        ##   <chr>     <dbl>
        ## 1 1            32
        ## 2 2            21
        ## 3 3            12
        ## 4 4            24
        ## 5 5            31
        ## 6 6            25
        ## # … with 64 more rows
        ## #
        ## # Edge Data: 506 × 3
        ##    from    to  year
        ##   <int> <int> <dbl>
        ## 1     1    13  1957
        ## 2     1    14  1957
        ## 3     1    20  1957
        ## # … with 503 more rows
