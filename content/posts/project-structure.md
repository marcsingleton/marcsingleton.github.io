+++
author = "Marc Singleton"
title = "Project Structure in Data Science"
draft = true
+++

Main idea: Overview of my approach to project structure
Many of these ideas are originally my own, but similar to the recommendations from Cookiecutter
    Excellent reference and has refined my own thinking, so highly recommend checking it out for a variation on these ideas

https://drivendata.github.io/cookiecutter-data-science/

# Why organize your work
Anecdote about showing your work
    Long division
    Physics problems -- writing knowns and unknowns
Powerful mental frameworks
Way of forcing you to break down hard problems into smaller ones and reduces cognitive load of each step

# Organization
Structured for primarily computational projects with a limited set of distinct (though possibly large) data sets
Not as appropriate for experimentalists with a large number of small data sets with needs for storing protocols and other documentation alongside the data itself

Data is immutable
Outputs (including data transformations) are stored in a dedicated directory
Use workflow managers to store constants that are shared across analyses
Separate computation from visualization
    Separation of concerns
    Computational steps are resource intensive
    Visualization can involve a lot of trial and error -- don't want to re-run an intensive computation just because you caught a typo on your plot's y-axis
