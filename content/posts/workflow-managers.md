+++
author = "Marc Singleton"
title = "Workflow Managers in Data Science: Nextflow and Snakemake"
showTableOfContents = true
draft = true
+++

## Introduction: What are workflow managers?
- The key to any complex data analysis project (or any big project really) is breaking it into smaller pieces
- Nowadays cleaning and analyzing a complex data set typically involves chaining together a heterogeneous mix of existing command-line tools and custom scripts written in Python or R
- It's manageable to do this manually for small projects, but once there are more than a handful of scripts, it becomes more difficult
- Since the dependencies between different steps form a directed acyclic graph, keeping the outputs of an analysis up-to-date requires maintaining a mental model of an entire network
  - Needless to say, these cognitive resources are better spent on higher level tasks like the design and interpretation of analyses
- It's even worse when some steps have different computing requirements in terms of hardware and software
  - For example, though data analysis is often process of *reduction* where after a certain point most analyses can run easily on a local machine, often there are a few computationally intensive steps that require distributed computing resources
  - Another special brand of hell is when some steps involve unmaintained software that highly specific dependencies, like a version of Python from 2011
- Rather than manually running the scripts and configuring them to run with certain hardware or computing environments, automate it!

## Nextflow vs Snakemake
- Orchestrating complex data analysis workflows is a common problem across many fields, so there are unsurprisingly numerous workflow management systems and even two competing standards ([CWL](https://www.commonwl.org/) and [WDL](https://openwdl.org/)) for describing workflows in a platform agnostic manner
- However, the two giants in scientific computing are Nextflow and Snakemake
- Like all workflow managers, they solve same problem of organizing and executing data processing workflows, but they do so from different perspectives
  - Roughly, Nextflow is process-oriented whereas Snakemake is file-oriented, and this difference has many implications for how the two systems describe the relationship between steps in a workflow
- Both have their strengths and weaknesses, and I personally see a place for both in a data scientist's toolbox
- However, learning both in-depth is a substantial time commitment, so in the rest of this post I compare and contrast the two beginning with a brief discussion of their documentation
- Afterwards, I'll give a primer on their execution models, and to illustrate these differences and introduce the basic syntax of each, we'll then build a toy data processing workflow with each

### Documentation
- Fortunately, both Nextflow and Snakemake are actively developed and well-documented with robust communities around them
- However, I have to give the edge to Nextflow for its more robust set of examples and tutorials that introduce concepts slowly and its generally higher level of polish
- Snakemake has two examples, but most of its documentation is in the form of its extensive reference, which can is an intimidating place to start
- To be fair, the two tools are not working on a level playing field because Snakemake is an academic project where Nextflow is backed by a for-profit company, Seqera
  - So, while it's important to cite both, it's especially so for Snakemake
  - Regarding the long-term availability of Nextflow, it appears that Seqera is relying on a service and support model that supplements the basic Nextflow software
  - This is a similar approach to other companies that back open source software, like [Red Hat](https://www.redhat.com/) and its operating system of the same name
  - Since a business can make a profit while "giving away" its chief product, I don't think there's a risk of Nextflow suddenly disappearing or requiring a subscription to use
    - Instead this is likely more of a philosophical consideration than anything else

### Process model
- To my knowledge, the documentation for neither tool has an explicit explanation of their underlying models
- This can make it difficult to write workflows using programs with complex behavior and outputs without some trial and error
- So, before diving into our toy example, let's take a moment to understand how Nextflow and Snakemake conceptualize organizing and executing workflows

#### Nextflow
- Of the two, Nextflow likely has the more intuitive process model
- Processes and channels
  - Imagine as black boxes with wires going in and coming out
  - The wires are channels which are consumed and produced by a process
  - Other processes can't see what's happening in the box--they only know about channels
    - We as the human designers can, but our abstraction of the workflow is independent of the messy details of what happens in the actual execution of a process
  - Processes are connected by declaring the input of one channel as the output of another
  
- In terms of the actual process execution, Nextflow creates isolated working directories
- Any outputs produced by a process are saved relative to this working directory
  - Unless, that is, absolute paths are used
  - I can think of some valid reasons to use an absolute path in data analysis pipeline but not many
- Outputs are explicitly published with a publish directive
  - Nextflow links the files in these public directories to the actual ones in the hidden working directories
- Any outputs intended for human users or use in downstream processes must be explicitly declared
- It's not necessary to configure output directories for script because Nextflow automatically tidies up, so feel free to embrace your inner messy child

#### Snakemake
- Snakemake is a more intuitive model of execution where all commands are run from the directory of the Snakefile by default
- As result, have to manage outputs more explicitly by setting output paths
- Snakemake recommends every rule directs its outputs to a different directory to prevent name collisions and speed the resolution of the DAG
  - The pipeline is stored implicitly by file names, so Snakemake has to use its pattern matching rules to build the DAG on the fly
  - Superficially a little more overhead for Snakemake
    - Can sidestep any argument parsing in Python by accessing arguments through the snakemake object and running the command with a script guard
    - I avoid this approach because it makes the underlying scripts less portable
    - Python has an argument parsing module in its standard library which makes adding basic command-line arguments a breeze
- The treatment of output directories is actually the source of one of the biggest "gotchas" I encountered when getting started with Snakemake
  - Output directories made automatically unless the directory itself is explicitly an output, as marked with a directory() flag
  - This can cause errors unless your code has the right logic to account for the existence (or lack therefore) of the directories in its expected output paths

## A toy workflow
### Inputs and outputs
- Now we'll implement a toy workflow in both languages to introduce their syntax and compare how they work in practice
- First, though, let's keep an eye on the big picture and talk about our workflow's purpose, inputs, and outputs
- Let's say ...
  - Like all toy examples, this is contrived but all the more useful for illustration purposes

### Nextflow
- Nextflow example

### Snakemake
- Snakemake example