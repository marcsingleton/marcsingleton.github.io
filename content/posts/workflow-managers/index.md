+++
author = "Marc Singleton"
title = "Workflow Managers in Data Science: Nextflow and Snakemake"
showTableOfContents = true
draft = false
+++

## Introduction: What are workflow managers?
- The key to any complex data analysis project (or any big project really) is breaking it into smaller pieces
- Nowadays cleaning and analyzing a complex data set typically involves chaining together a heterogeneous mix of existing command-line tools and custom scripts written in Python or R
- It's manageable to do this manually for small projects, but once there are more than a handful of scripts, it becomes more difficult
- Since the dependencies between different steps form a [directed acyclic graph](https://marcsingleton.github.io/posts/project-structure-in-data-science/#data-analysis-is-a-dag), keeping the outputs of an analysis up-to-date requires maintaining a mental model of an entire network
  - Needless to say, these cognitive resources are better spent on higher level tasks like the design and interpretation of analyses
- It's even worse when some steps have different computing requirements in terms of hardware and software
  - For example, though data analysis is often process of *reduction* where after a certain point most analyses can run easily on a local machine, often there are a few computationally intensive steps that require distributed computing resources
  - Another special brand of hell is when some steps involve unmaintained software that highly specific dependencies, like a version of Python from 2011
- Rather than manually running the scripts and configuring them to run with certain hardware or computing environments, automate it!

## Nextflow vs Snakemake
- Orchestrating complex data analysis workflows is a common problem across many fields, so there are unsurprisingly numerous workflow management systems and even two competing standards ([CWL](https://www.commonwl.org/) and [WDL](https://openwdl.org/)) for describing workflows in a platform agnostic manner
- However, the most popular choices in scientific computing are Nextflow and Snakemake
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
- While both tools thoroughly document their commands, to my knowledge neither has an explicit explanation of their underlying models
- This can make it difficult to write workflows using programs with complex behavior and outputs without some trial and error
- So, before diving into our toy example, let's take a moment to understand how Nextflow and Snakemake conceptualize organizing and executing workflows

#### Nextflow
- Of the two, Nextflow likely has the more intuitive workflow model
- The basic building blocks of a Nextflow workflow are processes and channels
- Processes are operations that accept input channels and transform them into output channels
  - I like to imagine channels as black boxes with wires going in and coming out
    - (Diagram of processes)
  - The wires are channels which are consumed and produced by a process
  - Workflows are defined in Nextflow by explicitly declaring the output channel of process as an input channel of another
    - As channels are the only interfaces by which processes communicate, one process can't see what's happening in the black box of another--they only know about channels
    - We as the human designers can, but our abstraction of the workflow is independent of the messy details of what happens in the actual execution of a process
    - (Diagram of processes with channels linked together)
  
- In terms of the actual execution, Nextflow executes its processes in isolated working directories
- Any outputs produced by a process are saved relative to this working directory unless absolute paths are used
  - I can think of some valid reasons to use an absolute path in data analysis pipeline but not many, so I recommend generally avoiding them
- Any outputs intended for human users or use in downstream processes must be explicitly declared
  - This effectively distinguishes the wires emerging from our black box processes from its implementation details
  - For example, in a process we may call an external tool from the command line
  - This tool is "messy" and doesn't clean up temporary files it creates during execution
  - However, we didn't write this tool, so we have no control over its implementation
  - Nextflow's explicit declaration of outputs, though, allows it to identify and track which files are part of the chain of execution and which are side effects
- Furthermore, the working directories containing outputs are hidden and to use a software engineering analogy, not considered a part of a pipeline's "public API" unless they are explicitly tagged with an "publish directive"
  - Nextflow links the files in these public directories to the actual ones in the hidden working directories
- As a result, it's not necessary to configure output directories for script because Nextflow automatically tidies up
  - This makes writing pipelines that use command line tools more concise since it does away with that boilerplate code, so feel free to embrace your inner messy child

#### Snakemake
- In contrast, Snakemake's workflow model is centered around the relationships between files which are encoded by rules
- Like Nextflow's processes, these rules declare input and output files and define the operations relating them
- However, Snakemake diverges from Nextflow in that rules are never linked together in an explicit workflow
- Snakemake instead infers the chain of operations that compose a workflow from the names of the input and output files in each rule
  - While the inputs to rules can be literal file names like `input_01.tsv`, Snakemake's flexibility and power lies in its pattern matching features
  - There are several ways of writing patterns, but a common way of generalizing the previous example is by writing rules in the form `input_{sample_id}.tsv`
  - Snakemake interprets `{sample_id}` as a wildcard, allowing it match files like `input_01.tsv` and `input_A.tsv`
- As result, in Snakemake outputs are managed more explicitly
  - Snakemake recommends every rule directs its outputs to a different directory to prevent name collisions and speed the resolution of the workflow
- Footnote: This approach is inspired from its namesake, Make, a classic Unix program used for automating and streamlining compiling source code into executable files
  - It's still widely used today, though, as a tool dating from the early days of Unix, its syntax tends towards compactness over readability

- In contrast to Nextflow, however, in Snakemake's model of execution all commands are run from the directory of its workflow definition file by default
  - This is likely more intuitive for most users since it's how processes run in most shells
- However, there is a "gotcha" in the treatment output directories which was one of the more frustrating aspects of first learning Snakemake
  - Output directories are made automatically unless the directory itself is explicitly an output, as marked with a directory() flag
  - This can cause errors unless your code has the right logic to account for the existence (or lack therefore) of the directories in its expected output paths

## A toy workflow
### Inputs and outputs
- Now we'll implement a toy workflow in both languages to introduce their syntax and compare how they work in practice
- First, though, let's keep an eye on the big picture and talk about our workflow's purpose, inputs, and outputs
- Let's say ...
  - Like all toy examples, this is contrived but all the more useful for illustration purposes

- OUTLINE OF PIPELINE
- Make pipeline using builtin Python text processing and statistics functions
- Have some (small) collection of text files that can be categorized by a type
  - Children
    - Alice's Adventures in Wonderland
    - Wizard of Oz
    - Velveteen Rabbit
    - Peter Pan
  - Shakespeare
    - Romeo & Juliet
    - MacBeth
    - Hamlet
  - SciFi
    - Dr Jekyll and Mr Hyde
    - War of the Worlds
    - The Time Machine
    - Frankenstein
    - Dracula
  - Austen
    - P&P
    - Persuasion
    - Emma
  - Dickens?
  - Twain?
- Do some preprocessing
- Process each to count words and basic stats
  - Number of words (length)
  - Number of unique words
  - Counts of each word
- Aggregate all and by genre and calculate same stats
- Calculate pairwise comparisons of similarity
  - Using word vectors?
- Report on similarity within and between genres

### Nextflow
- Nextflow example

### Snakemake
- Snakemake example
- It is possible to sidestep any argument parsing in Python scripts by accessing arguments through the snakemake object and running the command with a script guard
  - I avoid this approach, though, because it makes the underlying scripts less portable
  - Furthermore, Python has an argument parsing module in its standard library which makes adding basic command-line arguments a breeze

## Conclusion
- I've seen some users contrast Nextflow's and Snakemake's models as "forward" and "backward," but two fit squarely into existing programming paradigms, respectively
  - In Nextflow, the designer has to explicitly define the relationship between processes and their order of execution by connecting their channels
  - This kind of step-by-step description of the operations used to compute a result is called imperative programming
  - In contrast, in Snakemake the user asks the program to compute a result, here a file output, and the program determines the operations needed to achieve that
  - This is called declarative programming
  - In practice, many programming languages and problem-solving strategies incorporate elements from both paradigms, so learning to recognize the common patterns across different domains is one of the most valuable skills a programmer can develop
- More specific to this tutorial, I believe both tools have their use cases
  - Nextflow for production-ready pipelines
  - Snakemake for prototyping and development
