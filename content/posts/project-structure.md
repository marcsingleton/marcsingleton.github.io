+++
author = "Marc Singleton"
title = "Project Structure in Data Science (draft)"
date = "2024-04-01"
summary = "An overview of my approach to organizing data science projects"
tags = ["best-practices"]
showTableOfContents = true
+++

## Introduction: Why organize your work?
We've all heard it at one point or another in our lives: To get credit, you need to show your work. In data science, there's a similar idea with organizing your work. Because creating an analysis usually requires writing some code, it's easy enough to point to it as the "work" that is "shown", but anyone who's spent some time digging into someone else's code knows that when it comes to understanding what it's doing, there are magnitudes of difference between a well-organized repository and a series of Jupyter notebooks held together with the coding-equivalent of duct tape. When working in teams, organizational norms are essential to prevent a codebase from collapsing into a mess of bugs at a bare minimum, but ideally they allow large numbers of contributors to work together without inferring with each other's efforts. However, organizing data science projects isn't just about helping other people (whether it's you in six months, your immediate teammates, or a broader community) understand your code. Organizational norms are also powerful mental frameworks. They force you to break down hard problems into smaller, more manageable tasks. This is in part why teachers are so fixated on having their students show their work. Writing the knowns and unknowns in a physics question or each step of the long division algorithm makes you slow down, take stock of the problem, and execute each step properly.

End previous paragraph with connection back to data science
This post is an overview of my approach to project structure, which has been refined over several years
Coming from a particular place of academic data science where work is done independently or small teams, but I've sought to make my approach general
Many of these ideas are originally my own, but similar to the recommendations from Cookiecutter
    Excellent reference and has refined my own thinking, so highly recommend checking it out for a variation on these ideas
    https://drivendata.github.io/cookiecutter-data-science/
Structured as 

## Directory Structure
Structured for primarily computational projects with a limited set of distinct (though possibly large) data sets
Not as appropriate for experimentalists with a large number of small data sets with needs for storing protocols and other documentation alongside the data itself

```
data
docs
logs
code
    src
    notebooks
    scripts
reports
outputs

README.md
LICENSE
.gitignore
```

## Principles
Analysis is a DAG
    Use workflow managers to store constants that are shared across analyses
Data is immutable
    Outputs (including data transformations) are stored in a dedicated directory
Separation of computation from visualization
    Separation of concerns
    Computational steps are resource intensive
    Visualization can involve a lot of trial and error -- don't want to re-run an intensive computation just because you caught a typo on your plot's y-axis
