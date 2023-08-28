---
title: Interface Design and Topic Models
layout: post
output: 
  md_document:
    preserve_yaml: true
---

*The Stanford Dissertation Browser case study*

[Code](https://github.com/krisrs1128/stat679_code/blob/main/notes/week12-3.Rmd),
[Recording](https://mediaspace.wisc.edu/media/Week%2012%20-%203%3A%20Interface%20Design%20and%20Topic%20Models/1_jocz55hl)

1.  For most of the course, we have focused on visualizing the data
    directly. For the last few weeks, though, we have visualized the
    results of an initial modeling step, like fitting PCA or topic
    models. These kinds of models can help in creating abstractions, and
    reasoning effectively through abstraction is often a source of
    discovery.

2.  The ideal is to apply modeling to lift concrete datasets into more
    meaningful abstractions, which can then be visualized to support
    high-level reasoning. Reality, however, is rarely as simple is that.
    In practice, models can go awry, visualizations can be misleading,
    and results can be misunderstood. Indeed, this complexity is one of
    the reasons data science training takes years.

3.  The authors of this week’s reading suggest a mnemonic: “interpret
    but verify.” This captures several principles,

    -   Interpret: Models and visualizations should be designed in such
        a way that users can draw inferences that are relevant to their
        understanding of a domain.
    -   Verify: It is the designer’s responsibility that these
        inferences be accurate.

#### Stanford Dissertation Browser

1.  The authors ground their discussion by considering a specific design
    project: The Stanford Dissertation Browser. For this project,
    university leadership wanted to discover ways to promote effective,
    interdisciplinary research. Topic models helped transform the the
    raw dissertation text data into higher-levels of abstraction.
    Research themes were reflected in topics, and the interdisciplinary
    reach of certain PhD theses was reflected in their
    mixed-memberships.

2.  In several initial implementations of their interface, it was easy
    to draw incorrect inferences. For example, in some
    dimensionality-reduction outputs, it seemed that petroleum
    engineering had become closer to biology over time, but this turned
    out to be an artifact of the reduction and was not visible when
    using the original distances. Another example — some words were used
    in neurobiology (voltage, current, …) led to theses in this
    department to appear very close to electrical engineering, when they
    really had more in common with those in other biology departments.

    <p align="center">

    <img src="/stat679_notes/assets/week12-3/petroleum_case.png" width="400" />

    </p>

3.  The authors carefully tracked and manually verified inferences made
    by a group of test users. Based on this qualitative evaluation, they
    were able to refine their modeling and visualization approach. For
    example, they used a supervised variant of topics models, and they
    replaced their original dimensionality reduction scatterplot with a
    visualization of topic-derived inter-department similarities.

    <p align="center">

    <img src="/stat679_notes/assets/week12-3/radial_view.png" width="400" />

    </p>

#### Overall Strategy

1.  To implement the “interpret but verify” idea, the authors recommend,

    -   Align the analysis, visualization, and models along appropriate
        “units of analysis.”
    -   Verify that the modeling results in abstractions / concepts that
        are relevant to the analysis, and modify accordingly.
    -   Progressively disclose data to support reasoning at multiple
        levels of abstraction.

2.  The units of analysis in the dissertation browser were departments
    and theses. In general, these are the “entities, relationships, and
    concepts” of interest, and they can often linked to existing
    metadata.

3.  Verification can be guided both by quantitative metrics (e.g., test
    error) and qualitative evaluation (e.g., user studies). For revising
    models, it can be possible to refit parameters, add labels, modify
    model structure, or simply override the model with user-provided
    values.

4.  Progressive disclosure allows the user to go up and down the [ladder
    of abstraction](http://worrydream.com/LadderOfAbstraction/). It
    makes it possible to navigate large-scale data while supporting
    verification through specific examples.

5.  In the dissertation browser, this is implemented through semantic
    zooming (from departmental to dissertation views) and linked
    highlighting (revealing the dissertation abstract on mouseover).

    <p align="center">

    <img src="/stat679_notes/assets/week12-3/dissertation_browser_overview.png" width="800" />

    </p>

6.  The question of how to effectively weave together model building
    with visual design is still one that is actively explored in
    research today. If you enjoyed reading about this project, you may
    enjoy other papers on visualization for topic models or machine
    learning \[[1](https://visxai.io/), [2](https://distill.pub/),
    [3](https://www.sciencedirect.com/science/article/pii/S2468502X17300086)\]
    more generally.
