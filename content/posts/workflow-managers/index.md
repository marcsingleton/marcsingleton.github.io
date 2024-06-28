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
  - I like to imagine channels as black boxes with pipes going in and coming out
    - (Diagram of processes)
  - The pipes are channels which are consumed and produced by a process
    - Channels carry messages from one process to another
    - Think of them like pneumatic tubes
    - Unlike pneumatic tubes channels can be duplicated by connecting them to multiple processes or manipulated in more complex ways
      - See channel operators
    - The pneumatic tube metaphor is helpful though because channels do emit messages in discrete chunks
      - This matters when a process is handling multiple channels because process will match messages from incoming channels
        - Like Python's zip function
        - Order is arbitrary
        - (Image of channel with input1, input2, ... then output3, output10, ...)
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
### A high-level overview
- Now we'll implement a toy workflow in both languages to introduce their syntax and compare how they work in practice
  - Like all toy examples, this is contrived but all the more useful for illustration purposes
- First, though, let's keep an eye on the big picture and talk about our workflow's purpose, inputs, and outputs
- Let's say we have a collection of books as text files grouped by genre, and we're interested in the distribution of word counts in each and how those distributions relate to each other, both within and between genres
- The overall idea of our pipeline, then, is to count the words in each book, make all pairwise comparisons between these count distributions, and finally aggregate the results
- As is typical in data science, though, we'll need to clean up the text files a little beforehand to remove metadata that shouldn't contribute to our word counts
- We'll also add a step to calculate some basic statistics from the word count distributions individually and then aggregate them into a single file
- In total, graphically our pipeline will look something like the following
  - (DIAGRAM OF PIPELINE)

### Aside: The scatter-gather pattern
- Although this example is a "toy" in terms of the size of the data and the computing power required in each step, it illustrates several instances of the scatter gather pattern, which is ubiquitous in pipeline design
  - Because big data processing is often [embarrassingly parallelizable](https://en.wikipedia.org/wiki/Embarrassingly_parallel), the scatter gather pattern splits large jobs into many independent pieces and merges the results together
  - In this case, the pairwise comparisons of the word count distribution is a perfect example of the scatter gather pattern since each comparison is independent of the others until a downstream process aggregates them together
  - Throughout this pipeline, individual books are used as the natural unit of work, and we won't subdivide its operations below that level
  - However, it is possible in principle to parallelize some processes even further
  - For example, counting the distribution of words in a book can occur in parallel if the list of words is split into several chunks
    - Each scatter subprocess uses its chunk to creates its own distribution of word counts and the gather process calculates the full distribution by simply adding the counts across each sub-distribution
    - Footnote: This works because the fundamental units and operations in this process are words and sums, respectively, the latter of which is both commutative and associative
    - In practice, this an over-engineered solution because once a text is split on words, or even lines, the process is essentially done
    - However, it does illustrate the general principle that the "atom" of work in a scatter gather pattern may be smaller than an individual file
    - A more common scenario is instead scattering and gathering on files only
    - Though in this example, every book corresponds to a single file, that's mostly a reflection of how we received the data rather than anything inherent to the analysis
      - We could also have, for whatever reason, received each book in multiple files split into chapters or at a maximum size
      - In that case, the word counting process would gather across multiple files
    - The practical implementation of scatter gather processes is therefore often highly dependent on the organization of the input data within and between files, how the "atoms" of work are conceptualized, and the computational requirements of those "atoms"
      - Footnote: The computational requirements of an atom of work can be a key factor of its definition!
      - As a result, it's impossible to make generalizations about the best way of splitting work in pipelines, and in practice these decisions will depend on a mixture of design and engineering considerations
    - By the way, for the bioinformaticians out there, if all this seems completely unrelated to anything in the real-world, mentally swap "counting words" with "mapping reads," "books" with "samples," and "genres" with "experimental condition"

### Implementing the core logic in Python
- Before diving into the specifics of Nextflow and Snakemake, we'll first implement the core components of our pipeline as Python scripts
- The division of labor here is the Python scripts will handle all the logic of cleaning the text files, counting the words, making the pairwise comparisons, etc., and the workflow managers will handle executing those scripts on the appropriate inputs
- Deciding the exact breakdown between the two is a bit of an art and will depend on the flexibility of the pipeline's design, but in general scripts take care of all the actual computations, and the workflow manager is only responsible for running those scripts at the appropriate time
- Furthermore, we'll generally write our Python scripts agnostic to the genres and titles of the files they're operating on, that is, they largely won't explicitly handle this information and instead only accept input and output file paths
  - We'll instead encode this metadata in the names of the files themselves
  - This will introduce some complications down the line for both Nextflow and Snakemake, but it will also simulate how metadata is handled in practice, especially when working with tools or formats that can't encode it in the file itself

#### Exploring the data
- However, before we can even begin to think about writing code, we first need to understand what the data are and what they look like
- The goal of this pipeline is to calculate various statistics derived from the counts of words in books, so I've selected 13 books in the public domain, downloaded their plain text files from [Project Gutenberg](https://www.gutenberg.org/), and grouped them into three "genres" under the following directory hierarchy:

```
data/
├── childrens/
│   ├── alices-adventures-in-wonderland.txt
│   ├── peter-pan.txt
│   ├── the-jungle-book.txt
│   ├── the-wonderful-wizard-of-oz.txt
│   ├── through-the-looking-glass.txt
│   └── winnie-the-pooh.txt
├── scifi/
│   ├── frankenstein.txt
│   ├── the-strange-case-of-dr-jekyll-and-mr-hyde.txt
│   ├── the-time-machine.txt
│   └── the-war-of-the-worlds.txt
└── shakespeare/
    ├── hamlet.txt
    ├── macbeth.txt
    └── romeo-and-juliet.txt
```

- It's always a good idea to take a look at the beginning, middle, and end of the raw data as sanity check, so let's do that now
- For example, the beginning of `romeo-and-juliet.txt` is

```{linenos=true, linenostart=1}
The Project Gutenberg eBook of Romeo and Juliet
    
This ebook is for the use of anyone anywhere in the United States and
most other parts of the world at no cost and with almost no restrictions
whatsoever. You may copy it, give it away or re-use it under the terms
of the Project Gutenberg License included with this ebook or online
at www.gutenberg.org. If you are not located in the United States,
you will have to check the laws of the country where you are located
before using this eBook.

Title: Romeo and Juliet

Author: William Shakespeare

Release date: November 1, 1998 [eBook #1513]
                Most recently updated: June 27, 2023

Language: English

Credits: the PG Shakespeare Team, a team of about twenty Project Gutenberg volunteers


*** START OF THE PROJECT GUTENBERG EBOOK ROMEO AND JULIET ***




THE TRAGEDY OF ROMEO AND JULIET

by William Shakespeare
```

- Clearly, this file has a header declaring it's a Project Gutenberg eBook along with licensing information and some other metadata
- Likewise, it also has a footer, which begins at line 5299

```{linenos=true, linenostart=5284}
PRINCE.
A glooming peace this morning with it brings;
The sun for sorrow will not show his head.
Go hence, to have more talk of these sad things.
Some shall be pardon’d, and some punished,
For never was a story of more woe
Than this of Juliet and her Romeo.

 [_Exeunt._]






*** END OF THE PROJECT GUTENBERG EBOOK ROMEO AND JULIET ***


    

Updated editions will replace the previous one—the old editions will
be renamed.
```

- Though not all files contain headers, and even fewer contain footers, but when they do, the pipeline must account for them
- If it doesn't, at best the pipeline will crash because something unexpected happened
- However, the worst-case scenario is the pipeline won't notice and will continue chugging along, happily returning incorrect results
- That's why it's essential to at a minimum spot check a few input files at the beginning and end
  - This is where it's also helpful to have some domain knowledge
  - For example, being remotely acquainted with Shakespeare (and literature in generally) made it obvious the text at the end was part of a license
- It's usually not practical to check every input manually though, so a better general (long-term? overall?) strategy is to program defensively
- Incorporate checks to verify any assumptions made about the data during its processing and throw errors liberally!
  - If the data is as expected, the code should still run without any issues
  - But if something unexpected happens, the user should know!

### Nextflow
- Nextflow example
- Nextflow is more powerful of two

### Snakemake
- Snakemake example
- It is possible to sidestep any argument parsing in Python scripts by accessing arguments through the snakemake object and running the command with a script guard
  - I avoid this approach, though, because it makes the underlying scripts less portable
  - Furthermore, Python has an argument parsing module in its standard library which makes adding basic command-line arguments a breeze
- Snakemake requires that all wildcards used in input must be in output
- Difficult to write shell scripts with f strings because of behavior with double brackets

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
