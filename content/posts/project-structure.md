+++
author = "Marc Singleton"
title = "Project Structure in Data Science (draft)"
date = "2024-04-01"
summary = "An overview of my approach to organizing data science projects"
tags = ["best-practices"]
showTableOfContents = true
+++

## Introduction: Why organize your work?
We've all heard it at one point or another in our lives: To get credit, you need to show your work. In data science, there's a similar idea with organizing your work. Because creating an analysis usually requires writing some code, it's easy enough to point to it as the "work" that is "shown," but anyone who's spent some time digging into someone else's code knows that when it comes to understanding what it's doing, there are magnitudes of difference between a well-organized repository and a series of Jupyter notebooks held together with the coding equivalent of duct tape. When working in teams, organizational norms at a bare minimum prevent a codebase from collapsing into a intractible mess, but ideally they allow large numbers of contributors to work together efficiently and with minimal interference. However, organizing data science projects isn't just about helping other people (whether it's you in six months, your immediate teammates, or a broader community) understand your code. Organizational norms are also powerful mental frameworks. They force you to break down hard problems into smaller, more manageable tasks. This is in part why teachers are so fixated on having their students show their work. Writing the knowns and unknowns in a physics question or each step of the long division algorithm makes you slow down, take stock of the problem, and execute each step properly. Project structures in data science work in a similar way. Rather than trying to clean, model, and interpret your data all at once, they allow you to focus on smaller, more manageable tasks where the outputs of one step flow smoothly into the inputs of another.

This post is an overview of my approach to project structure. I should note my perspective comes from an academic flavor of data science where the work is done independently or in small teams and the data sets are generally static, but I've sought to make my approach general. When I started writing code for data science, I originally followed William Noble's [guide](https://doi.org/10.1371/journal.pcbi.1000424), but over the years I've refined his suggestions into a more modern structure. Many of my ideas are also similar to the recommendations from [Cookiecutter](https://drivendata.github.io/cookiecutter-data-science/). It's an excellent reference for data science project structure that has refined my own thinking, so I highly recommend checking it out for alternate take on this topic.

The rest of this post is broken into two parts. In the first, I'll give an overview of my recommended project structure, and in the second, I'll discuss some broader principles that inform how that structure is put into practice.

## Directory structure
The following structure is designed for primarily computational projects using the "pipeline" model, *i.e.*, those that begin with a limited number of distinct and static data sets and transform them over a series of operations into a set of outputs. It's intended for *ad hoc* analyses of specific data sets rather than for the development of standalone, installable packages. However, its structure does encourage good software design practices like separation of concerns and modularity, so a project developed with this framework could be converted into a re-usable pipeline without many modifications. Additionally, though it contains some Python-specific elements for demonstration purposes, this structure is compatible with any scripting language commonly used for data science, like R, Julia, or even a mix of them!

For the experimentalists out there, this structure will likely require some modifications to accommodate projects with a wet lab component. If there aren't many experiments, protocols and other documentation can be stored alongside each data set in a dedicated subdirectory. Projects that are primarily wet lab with shorter and more contained analyses may require a more "experiment-centric" structure, however. In other words, I don't necessarily recommend this structure as a lab notebook in its current form, but its overall ideas of separating data, code, and results would likely still apply.

```
project_root/
    ├── data/                 <- All raw data
    │   ├── data_set_1/           <- Put different data sets in different subdirectories
    │   ⋮  
    │   └── data_set_n/  
    ├── references/           <- Data dictionaries, manuals, log entries, and all other explanatory materials
    ├── docs/                 <- Formal documentation systems, e.g. Sphinx; not necessary for most projects
    ├── bin/                  <- "Binaries," i.e. external programs used in this project
    ├── code/                 <- All code written written specifically for this project
    │   ├── src/                  <- Re-usable functions for common tasks across project
    │   │   ├── __init__.py           <- Necessary to make src/ a Python module
    │   │   ├── module_1/             <- Organize functions into related modules
    │   │   ⋮
    │   │   └── module_n/
    │   ├── scripts/              <- Code to execute individual pipeline steps
    │   │   ├── clean_data.py         <- Give files readable but brief names
    │   │   ├── fit_model.py
    │   │   └── make_plots.py
    │   └── notebooks/            <- Notebook-style code for exploratory analyses
    ├── results/              <- All outputs produced by the pipeline
    │   ├── clean_data/           <- Subdirectories should match the name of the script that produced them
    │   ├── fit_model/
    │   └── make_plots/
    ├── reports/              <- Formal reports compiled from individual results; not necessary for many projects
    ├── logs/                 <- Log files produced by workflow managers and other programs
    ├── README.md             <- Give a high-level overview of the purpose and structure of the project
    ├── LICENSE.txt           <- Include a license to be explicit about how others can use your code!
    ├── requirements.txt      <- Requirements file for reproducing the project's computing environment
    └── .gitignore            <- Files and folders ignored by Git (or some other VCS)
```

## Principles
### Data analysis is a DAG
- Data analysis is a series of operations where the outputs of one operation become the inputs of another
- Convenient to visualization this as a flow chart or, more mathematically, a directed acyclic graph
  - In this model, operations are nodes and dependencies between them are edges
  - The graph is directed to reflect the one-way dependence of the operations
    - For example, code that fits a model to cleaned data depends on the code that cleans the data, but not the other way around
  - The graph is acyclic to prevent circular dependencies. If cleaning the data depends on a model fit to the cleaned data, there's no way to reproduce an analysis from the scratch
- It's possible to hard code the paths between various scripts and manually run them in sequence, but this quickly becomes unmanageable
  - Increases cognitive load
  - Violates DRY principle, so any changes to paths must be reflected in multiple locations
- Instead use workflow managers
  - Proper "glue" for stitching together scripts that minimizes need for manually specifying paths
  - Convenient mechanism for storing "global parameters" that influence the way an analysis is executed but are also distinct from "data" itself
  - Biggest strength is automatic inference of dependencies between outputs and propagation of updates

### Projects are isolated from the file system
When writing code for data analysis, it can be tempting for many beginners to use absolute rather than relative file paths. After all, the absolute path from the root of the file system **is** the address of a file, which ensures any code using an absolute path will always unambiguously refer to a specific file, no matter where it is run. However, this approach immediately breaks down when more than one machine is involved. Often these other machines are your teammates' computers. Just as you'll likely store the project root somewhere under your home directory on your local machine, so will your teammates, and unless all of you have the same name and file system structure, the code will quickly grind to a halt. Even when working individually or on a common file system in the cloud, it is sometimes necessary to run certain steps on more powerful computing infrastructure, which creates the same issues.

That said, all paths should be relative rather than absolute. However, this then raises the question of relative to what exactly because depending on where the code is run, relative paths will have completely different meanings in the file system. My convention is to assume all code is run from the project root because this allows relative paths to be written without all those dreaded double dots (`..`) to refer to parent directories. Jupyter notebooks usually run from the directory that contains them, which requires either using double dots or implementing some additional configuration steps to change the default working directory. On the other hand, I don't recommend Jupyter notebooks for creating reproducible analyses anyway (see the section on the [three types of code](#there-are-three-types-of-code-you-write)), so following a strict convention here is not as necessary.

Sometimes it's not possible to directly access all a project's resources under its root, for example, if a large data set is stored on some kind of external or network drive. However, this issue is easily solved by mounting those drives and adding a link to the required files or folders in the `data/` directory. Another example is linking to external programs in the `bin/` directory if for whatever reason they are not on the system `PATH` variable. In both cases, the project's documentation should give explicit directions on how to configure the computing environment properly (see the section on [requirements](#requirements-are-frozen-and-explicit) for more details). 

### Data is immutable
- Outputs (including data transformations) are stored in a dedicated directory
- Generally should be flat with one output subdirectory per script
  - The internal structure of these subdirectories can be arbitrary
- In some cases, may be appropriate to group related outputs together into a subdirectory
  - A related series of visualizations where some plots may require extensive computation time to generate for example
  - Be aware of the separation of computation from visualization principle though, but there are no hard rules here
  
### There are three types of code you write
- Scripts, modules, and notebooks

### Separate computation from visualization
- Separation of concerns
- Computational steps are resource intensive
- Visualization can involve a lot of trial and error -- don't want to re-run an intensive computation just because you caught a typo on your  plot's y-axis
- Divide computationally intensive steps for a single visualization as well
  - Some visualization steps like t-SNE may require significant computation when applied to large data sets

### Requirements are frozen and explicit
- Use environment managers at a minimum
  - venv good for Python only
  - conda good for Python and many other commonly used packages in scientific computing
  - Sometimes requirements don't fit neatly into a standard package manager; Use containers like Docker or Singularity to capture an entire computing environment
