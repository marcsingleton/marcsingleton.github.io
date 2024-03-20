+++
author = "Marc Singleton"
title = "Workflow Managers in Data Science: Snakemake and Nextflow"
draft = true
+++

# What are workflow managers?
Analysis is a DAG
Key to any complex data analysis project (or any big project really) is breaking it into smaller pieces
Chaining together outputs of individual scripts
Manageable to do this manually for small projects, but once there are more than a handful of scripts, becomes difficult
    Cognitive load of keeping entire DAG in your mind
Even worse when analyses have different computing requirements in terms of hardware and software
    Most of my analyses run easily on my local machine, but there are often a few computationally intensive steps that I'd like to distribute across 30
    Special brand of hell of using unmaintained software that only works with a version of Python from 2011
Automate it!

# Data model: Snakemake vs Nextflow
Two giants in the scientific computing space are Snakemake and Nextflow
Solve same problem from very different perspectives
    Snakemake is file-oriented whereas Nextflow is process-oriented

# Documentation
Both are well-documented, but have to give edge to Nextflow for more robust set of examples and tutorials that introduce concepts slowly
Snakemake has two examples, but most of documentation is in the form of its extensive reference, which can be an intimidating place to start
Though not a fair comparison because Nextflow is maintained by a dedicated team of developers and Snakemake is an academic project
    Very important that you cite both
Unfortunately to my knowledge, neither have an explicit explanation of their underlying execution models, which can make it difficult to write workflows using programs with complex behavior and outputs without some trial and error

# Execution model
## Nextflow
Nextflow executes its processes in isolated working directories
Any outputs produced by a process are saved relative to this working directory
    Unless absolute paths are used, but risky!
Outputs are explicitly published with a publish directive
    Links the files in these public directories to the actual ones in the hidden working directories
Any outputs wish to publish or use in downstream processes must be explicitly declared
Not necessary to configure output directories for script because Nextflow automatically tidies up for you
    You can embrace your inner messy child and leave all your toys out in the open because behind the scenes Nextflow ensures they're stored their proper place

## Snakemake
Snakemake is a more intuitive model of execution where all commands are run from the directory of the Snakefile by default
    As result, have to manage outputs more explicitly by setting output paths
    Snakemake actually recommends every rule directs its outputs to a different directory to prevent name collisions and speed the resolution of the DAG
        The pipeline is stored implicitly by file names, so Snakemake has to use its pattern matching rules to build the DAG on the fly
    Superficially a little more overhead for Snakemake
        Can actually sidestep any argument parsing in Python by accessing arguments through the snakemake object and running the command with a script guard
        Avoid this approach because it makes the underlying scripts less portable
        Python has an argument parsing module in its standard library which makes adding basic command-line arguments a breeze
    The treatment of output directories is actually the source of one of the biggest "gotchas" I encountered when getting started with Snakemake
        Output directories made automatically unless the directory itself is explicitly an output, as marked with a directory() flag
        This can cause errors unless your code has the right logic to account for the existence (or lack therefore) of the directories in its expected output paths
