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

## A high-level overview of a toy workflow
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

## Implementing the business logic in Python
- Before diving into the specifics of Nextflow and Snakemake, we'll first implement the core components of our pipeline as Python scripts
- The division of labor here is the Python scripts will handle all the logic of cleaning the text files, counting the words, making the pairwise comparisons, etc., and the workflow managers will handle executing those scripts on the appropriate inputs
- Deciding the exact breakdown between the two is a bit of an art and will depend on the flexibility of the pipeline's design, but in general scripts take care of all the actual computations, and the workflow manager is only responsible for running those scripts at the right time
- Furthermore, we'll generally write our Python scripts agnostic to the genres and titles of the files they're operating on, that is, they largely won't explicitly handle this information and instead only accept input and output file paths
  - We'll instead encode this metadata in the names of the files themselves
  - This will introduce some complications down the line for both Nextflow and Snakemake, but it will also simulate how metadata is handled in practice, especially when working with tools or formats that can't encode it in the file itself

### Exploring the data
- However, before we can even begin to think about writing code, we first need to understand what the data are and what they look like
- The goal of this pipeline is to calculate various statistics derived from the counts of words in books, so I've selected 13 books in the public domain, downloaded their plain text files from [Project Gutenberg](https://www.gutenberg.org/), and grouped them into three "genres" under the following directory hierarchy:
- Footnote: Take these groupings with a grain of salt, especially since Shakespeare is an author 

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

- By the way, these files and all the code we'll write throughout this tutorial are available in the this archive and this GitHub repository, so be sure to download it and follow along!
  - The limits of good taste do limit the amount of code I'm willing to show in one block, but the structure of the scripts and project as a whole will make much more sense when viewed together
  
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
- Likewise, it also has a footer, which begins at line 5299 and continues for another few hundred lines

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
  - If the data has the expected structure, the code should still run without any issues, but if not, the user should know!

### Cleaning the data
- Now we're ready to start writing some code
- Our first task is a script that removes the header and footer from an input file and saves the result back to disk
- The pipeline will then feed these cleaned files into a subsequent script that counts the words
- Strictly speaking, we could combine these two steps into a single script since it's simple to only count the words after the header and before the footer when processing a file line by line
- However, we won't do that here for two reasons
  - The first is pedagogical
    - Since the primary purpose of this post is to illustrate how to implement a pipeline in Nextflow and Snakemake, we'll keep the individual steps simple to focus our attention more on workflow managers express the relationship between steps and less on their actual computations
  - The second is philosophical
    - In computing, particularly in the Unix ecosystem, there's an idea that programs should do one thing and do it well since this encourages developers to write clear and reusable code
    - For example, though our data has a uniform structure with the same header and footer in each file, we may in the future want to adapt the pipeline to handle different formats
    - By separating the two steps, we ensure we would only have to change the pre-processing code to support a new format, which makes the pipeline both easier to modify and maintain
- As final note, if we were really following every tenet of the Unix philosophy, we would write our scripts to handle data streams rather than files where possible
  - While this design would be more efficient from a storage and memory perspective, we'll save the intermediates to disk for simplicity and ease of validating the results

- As our workflow managers will effectively run these scripts from a command line, they'll need code to handle accepting arguments for the input and output paths as well as creating any directories for the output if necessary
- Footnote: Snakemake (and Nextflow?) do automatically create directories for their outputs, but to make our code as portable as possible, we won't depend on that behavior
- Since this is boilerplate that won't change much, if at all, between the scripts in this pipeline, I'll introduce it once here, so afterwards we can focus on the business logic of each script
- All our scripts will have a structure something like the following

```python
import os
from argparse import ArgumentParser

# Any other imports here

# Function definitions here

# Constants defined here

if __name__ == '__main__':
    # Argument definitions and parsing
    parser = ArgumentParser()
    parser.add_argument('input_path')
    parser.add_argument('output_path')
    args = parser.parse_args()

    # Perform data manipulations here

    # Extract output directory from output path and create if necessary
    output_dir = os.path.dirname(args.output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Write outputs to file here
```

- In our actual scripts, we'll of course replace the placeholder comments with any necessary code, and the argument definitions may differ, but they'll all follow this overall format

- The first thing of note is the argument parsing block, which uses Python's builtin argument parsing module, `argparse`
  - It supports an extensive set of features, but fortunately its basic usage is simple
  - Positional arguments are defined by name with `add_argument` calls to an instance of an `ArgumentParser` object
  - These arguments are then read into an object (called `args` here) using the `parse_args` method where they are available as attributes
- The second non-placeholder block then extracts the path of the output directory and creates it if necessary
  - If the output path is just a file name, `output_dir` will be an empty string, so the if statements checks for that possibility first
- Finally, all code that isn't imports, function definitions, or constants is wrapped in an `if __name__ == '__main__':` statement
  - This isn't strictly necessary, but it's a common idiom in Python scripts
  - There's plenty of discussion diving deep into the purpose of this statement on the internet, but the basic idea is to only allow the code to execute when it's run as a script and not when it's imported as a module
    - Would anyone ever try to import this script as a module and then be surprised when it crashes their program because tries to parse input arguments and execute other code
    - Not likely to be honest, but it's good practice to include it anyway since it's only a single line

- With the boilerplate out of the way, let's write the code to remove the header and footer and store the result in a file

```python
def get_text_lines(path):
    with open(path) as file:
        in_text = False
        for line in file:
            if line.startswith('*** START OF THE PROJECT GUTENBERG EBOOK'):
                in_text = True
                continue  # Skip current line so it's not yielded
            if line.startswith('*** END OF THE PROJECT GUTENBERG EBOOK'):
                return
            if in_text:
                yield line

with open(args.output_path, 'w') as file:
    lines = get_text_lines(args.input_path)
    file.writelines(lines)
```

- The idea here is simple
  - We read the input file line by line and only return the lines after the line marking the start of the text and stopping after the line marking its end
  - This is written as a generator, so as to not needlessly store the complete text in memory before writing to disk, but it would work just the same if `get_text_lines` return a list of lines
- The final script is saved as `code/remove_pg.py` in the workflow repository

### Counting words
- The next step of the pipeline is to count the words in each cleaned file
- The idea here is also simple
  - We process the files line by line, first splitting words on whitespace and then processing those words to standardize them
  - Counts of the processed words are stored in a `Counter` object, available from the standard library, and ultimately written to file in count then alphabetical order

```python
from collections import Counter

count = Counter()
with open(args.input_path) as file:
    for line in file:
        words = [process_word(word) for word in process_line(line)]
        words = [word for word in words if word]  # Remove empty words
        count.update(words)
    
with open(args.output_path, 'w') as file:
    file.write('word\tcount\n')
    for word, count in sorted(count.items(), key=lambda x: (x[1], x[0]), reverse=True):
        file.write(f'{word}\t{count}\n')
```

- Unsurprisingly, the most finicky part of this script is extracting words from each line since there are gotchas to watch out for
- The first of these is splitting the words
  - Though most words are separated by whitespace, some authors also use em dashes or double hyphens, so these are also included in the regular expression that defines word delimiters
- This splitting, however, does not remove punctuation marks at the start or end of words
  - The builtin `strip` method of strings and `punctuation` constant from the `string` module fortunately take care of this easily
  - The latter doesn't include curly quotes by default, which are separate characters, so we have to include them manually
  - Finally, we convert all words to lowercase since for our purposes a word is the same regardless of its capitalization

```python
import re
from string import punctuation


def process_line(line):
    words = re.split('[\s]+|—|--', line)  # Whitespace, em dash, and double hyphens
    return words


def process_word(word):
    word = word.strip(punctuation).lower()
    return word


punctuation = punctuation + '‘’“”'  # Add curly quotes
```

- An interesting side effect of stripping punctuation marks is that it can sometimes result in empty words
  - For example, *Winnie the Pooh* contains lines of spaced asterisks like '*        *        *        *        *' to mark sections within the text
  - Because the splitting on whitespace yields words that are "naked" asterisks, stripping them will create empty strings
  - As a result, in the first code block, the list of words derived from each line are filtered for empty strings
- Note, this code was the result of several rounds of iteration, and it was only by carefully examining the results that I identified the edge cases in the line and word processing steps
  - This is a general feature of data analysis, particularly in pipeline prototyping
    - It's difficult to know all the idiosyncrasies of a data set in advance, so it's important to perform sanity checks and exploratory analyses on intermediate results to ensure their validity
- This script is saved under `coding/count_words.py`

### Calculating statistics from word counts
- Before continuing to the main goal of comparing these word count distributions within and between genres, let's take a brief detour to calculate some summary statistics from each distribution individually
- This will not only give us an interesting look into the text of each book, but it's also an important part of the iterative approach to pipeline design mentioned previously
- The full script, `coding/basic_stats.py`, calculates eleven statistics, but for brevity I'll only show six below

```python
import pandas as pd
import scipy.stats as stats

df = pd.read_table(args.input_path)
df['word_len'] = df['word'].apply(len)

vocab_size = len(df)
vocab_size_GT1 = (df['count'] > 1).sum()
vocab_size_L90 = ((df['count'] / df['count'].sum()).cumsum() <= 0.9).sum() + 1  # Analogous to genome assembly statistic L50
longest_word = df.sort_values(['word_len', 'word'],
                              ascending=[False, True],
                              ignore_index=True).at[0, 'word']
most_common_word = df.at[0, 'word']
entropy = stats.entropy(df['count'])

output = [
    ("vocab_size", vocab_size),
    ("vocab_size_GT1", vocab_size_GT1),
    ("vocab_size_L90", vocab_size_L90),
    ("longest_word", longest_word),
    ("most_common_word", most_common_word),
    ("entropy", entropy),
    ]

with open(args.output_path, 'w') as file:
    header = '\t'.join([record[0] for record in output]) + '\n'
    values = '\t'.join([str(record[1]) for record in output]) + '\n'
    file.write(header + values)
```

- Since the data is stored as table, pandas provides an efficient interface for manipulating the count distributions
- As a result, most of these are fairly self-explanatory or easily understood from their definitions
- However, `vocab_size_L90` is likely new for anyone unfamiliar with genome assembly
  - It's inspired by a similar statistic for measuring the contiguity of an assembly and is defined as the number of words that account for 90% of the total number when ordered by frequency
  - It effectively counts the number of unique words excluding the 10% most uncommon
- Additionally, entropy is measure of a distribution's "randomness" and is calculated using a function from SciPy's `stats` module
- Finally, notice that the book's title and genre is not stored directly alongside the calculated statistics
  - We'll instead encode this information in the output file names
  - This decision will make our lives a bit more complicated when it comes to aggregating the statistics from each book into a single file in the workflow managers
  - However, this is a common constraint for many tools and file formats, so while somewhat artificially imposed here, it will illustrate the strengths and weaknesses of Nextflow and Snakemake when it comes to handling this issue

### Pairwise comparisons of counts

### Grouping

## Linking the pieces with Nextflow
- Nextflow example
- Nextflow is more powerful of two

## Linking the pieces with Snakemake
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
