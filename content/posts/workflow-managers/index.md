+++
author = "Marc Singleton"
title = "Workflow Managers in Data Science: Nextflow and Snakemake"
date = "2024-07-18"
summary = "A tutorial on designing a data analysis pipeline and automating it with Nextflow and Snakemake."
tags = ["pipeline", "workflow", "snakemake", "nextflow", "python", "bash", "tutorial"]
showTableOfContents = true
math = true
+++

## Introduction: What are workflow managers?
The key to any complex data analysis task (or any big project) is breaking it into smaller pieces. Nowadays, cleaning and analyzing a data set typically involves chaining together a heterogeneous mix of existing command-line tools and custom scripts written in Python or R. It's manageable to do this manually for small projects, but once there are more than a handful of scripts, it becomes more difficult. Since the dependencies between different steps form a [directed acyclic graph](https://marcsingleton.github.io/posts/project-structure-in-data-science/#data-analysis-is-a-dag), keeping the outputs of an analysis up-to-date requires keeping a mental model of this entire network of relationships and their last-modified times. This is by no means easy, and these cognitive resources are better spent on higher-level tasks like the design and interpretation of analyses.

It's even worse when some steps have different hardware and software requirements. For example, though data analysis is often a process of *reduction* where after a certain point most analyses can run easily on a local machine, often there are a few computationally intensive steps that require distributed computing resources. Another special kind of hell is when some steps involve unmaintained software that has highly specific dependencies, like a version of Python from 2011. Rather than manually running the scripts and configuring for certain hardware or computing environments, the savvy data scientist reaches for automation!

## Nextflow vs Snakemake
Orchestrating complex data analysis workflows is a common challenge in many fields, so there are many workflow management systems and even two competing standards ([CWL](https://www.commonwl.org/) and [WDL](https://openwdl.org/)) for describing workflows in a platform-agnostic manner. However, the most popular choices in scientific computing are Nextflow and Snakemake. Like all workflow managers, they solve the same problem of organizing and executing data analyses, but they do so from different perspectives. Roughly, Nextflow is process-oriented whereas Snakemake is file-oriented, and this difference has many implications for how they describe the relationship between tasks in a workflow. Both have their strengths and weaknesses, and I personally see a place for both in a data scientist's toolbox. Learning both in-depth requires a substantial time commitment, so in the rest of this post I compare the two beginning with a brief discussion of their documentation and execution models. Afterwards, to illustrate these differences and introduce their syntaxes, we'll build a toy data processing pipeline with each.

### Documentation
Both Nextflow and Snakemake are actively developed, well-documented, and supported by robust communities. However, Nextflow is the clear winner for its many highly-polished [examples and tutorials](https://training.nextflow.io/) that introduce concepts slowly. Snakemake has [two examples](https://snakemake.readthedocs.io/en/stable/tutorial/tutorial.html), but most of its documentation is in the form of its extensive [reference](https://snakemake.readthedocs.io/en/stable/snakefiles/rules.html), which can is an intimidating place to start. A point in Snakemake's favor, though, is its Python-style workflow definitions will feel comfortable for the many data scientists and coders who use Python as a primary language. In contrast, Nextflow is based on Groovy which is turn an extension of Java. While Groovy supports many of the same features as Python, there are also many small differences in syntax and naming that significantly increase the initial learning curve.

To be fair, the two tools are not on a level playing field because Snakemake is an academic project whereas Nextflow is backed by a for-profit company, Seqera. So, while it's important to cite both, it's especially so for Snakemake. Regarding the long-term availability of Nextflow, it appears that Seqera relies on a service and support model that supplements the basic Nextflow software. This is a similar approach to other companies that back open source software, like [Red Hat](https://www.redhat.com/) and its operating system of the same name. Since a business can make a profit while "giving away" its chief product, I don't think there's a risk of Nextflow suddenly disappearing or requiring a subscription to use. Instead this is likely more of a philosophical consideration than anything else.

### Workflow model
While both tools thoroughly document their commands, to my knowledge neither has an explicit explanation of their underlying models. This can make it difficult to write workflows using programs with complex behavior and outputs without some trial and error. So, before diving into our toy example, let's take a moment to understand how Nextflow and Snakemake conceptualize organizing and executing workflows.

#### Nextflow
Of the two, Nextflow likely has the more intuitive workflow model. The basic building blocks of a Nextflow workflow are *processes* and *channels*. Processes are operations that accept input channels and transform them into output channels. I like to imagine channels as black boxes with pipes going in and coming out.

{{< figure src="process.svg" caption="Processes are one of Nextflow's primitives, which accept and emit messages via channels." >}}

The pipes are channels which carry messages from one process to another in discrete chunks, similar to pneumatic tubes. Furthermore, processes will match messages from multiple input channels in the order they are received, like Python's `zip` function. This can yield unintended results, however, because Nextflow's concurrent process execution doesn't preserve order. Unlike pneumatic tubes, though, channels can be duplicated by connecting them to multiple processes or manipulated in more complex ways via operators.

Workflows are defined in Nextflow by explicitly declaring an output channel of process as an input channel of another. Channels are the only interfaces by which processes communicate, so one process can't see what's happening in the black box of another---they only know about channels. We as the human designers can, but our abstraction of the workflow is independent of the messy details of what happens during the execution of a process.

{{< figure src="nextflow_overview.svg" caption="In Nextflow, processes are explicitly linked together in a workflow." >}}
  
In terms of the actual execution, Nextflow runs processes in isolated working directories, so any files created by a process are saved relative to this working directory unless absolute paths are used.[^1] Outputs intended for human users or use in downstream processes must be explicitly declared. This effectively distinguishes the pipes emerging from our black box processes from any side effects that may occur during their execution. For example, in a process we may call an external tool from the command line. However, this tool is "messy" and doesn't clean up its temporary files, but since we didn't write this tool, we have no direct control over this behavior. Nextflow's explicit declaration of outputs, though, allows it to identify and track which files are part of the chain of execution and which are side effects. Additionally, the working directories containing outputs are hidden and not linked to a public folder unless they are explicitly tagged with an "publish directive," which adds another layer of separation between "intermediate" and "final" outputs produced by a workflow.

[^1]: While I can think of some valid reasons to use an absolute path in data analysis pipeline, there aren't many, so I generally recommend avoiding them.

#### Snakemake
In contrast, Snakemake's workflow model is centered around *rules* which encode the relationships between files. Like Nextflow's processes, these rules declare input and output files and define the operations relating them. However, Snakemake differs from Nextflow in that rules are never linked together in an explicit workflow. Snakemake instead infers the chain of operations that compose a workflow from the names of the input and output files in each rule. While the inputs and outputs to rules can be literal file names like `input_01.tsv` and `output_01.tsv`, Snakemake derives its flexibility and power from its pattern matching engine. For example, the previous file names can be generalized by writing them as `input_{sample_id}.tsv` and `output_{sample_id}.tsv`. Snakemake interprets `{sample_id}` as a wildcard, allowing it recognize both (`input_01.tsv`, `output_01.tsv`) and (`input_A.tsv`, `output_A.tsv`) as possible input/output pairs. Snakemake then automatically links these pattern-matched rules to infer the chain of operations which compose the workflow. This approach is inspired from its namesake, Make, a classic Unix program used for automating and streamlining the compilation of source code into executable files. It's still widely used today, though, as a tool dating from the early days of Unix, its syntax tends towards compactness over readability.

{{< figure src="snakemake_overview.svg" caption="In Snakemake, rules define relationships between input and output files, implicitly forming a workflow." >}}

Snakemake also differs from Nextflow in that all commands are run from the directory of its workflow definition file by default. This is likely more intuitive for most users since it's how processes usually run in shells. However, there is a "gotcha" in its treatment of output directories which is likely one of the more frustrating aspects of first learning Snakemake. Output directories are made automatically unless the directory itself is explicitly an output, as marked with a `directory()` flag. This can cause errors unless the script has the right logic to account for the existence (or lack therefore) of the directories in its expected output paths.

## A high-level overview of a toy workflow
We'll now implement a toy workflow in both languages to introduce their syntaxes and compare how they work in practice. Like all toy examples, it'll have some contrived design choices that will be useful for illustration purposes. First, though, we'll mind the big picture and introduce our workflow's purpose, inputs, and outputs. Let's say we have a collection of books as text files grouped by genre, and we're interested in the distribution of word counts in each and how those distributions relate to each other, both within and between genres. We might even have a hypothesis that books in the same genre use more similar sets of words than books in different genres, and this analysis is our way of testing it.

The overall idea of our pipeline, then, is to count the words in each book, make all pairwise comparisons between these count distributions, and finally aggregate the results. As is typical in data science, though, we'll need to clean up the text files beforehand to remove metadata that shouldn't contribute to our word counts. We'll also add two steps to calculate some basic statistics from the word count distributions individually and aggregate them into a single file. In total, graphically our pipeline will look something like the following.

{{< figure src="pipeline_overview.svg" caption="Our pipeline is largely sequential with a single secondary branch. Most steps can be executed in parallel on independdent inputs, however." >}}

### Aside: The scatter-gather pattern
Although this example is a "toy" in terms of the size of the data and the computing power required in each step, it illustrates several instances of the scatter gather pattern, which is ubiquitous in pipeline design. Because big data processing is often [embarrassingly parallelizable](https://en.wikipedia.org/wiki/Embarrassingly_parallel), the scatter gather pattern splits large jobs into many independent pieces and merges the results together. Here, the pairwise comparisons of the word count distribution is a classic example since each comparison is independent of the others until a downstream process aggregates them together. Throughout this pipeline, individual books are used as the natural unit of work, and we won't subdivide its operations below that level.

It is possible in principle to parallelize some processes even further, however. For example, counting the distribution of words in a book can occur in parallel if the list of words is split into several chunks. Each scatter subprocess uses its chunk to creates its own sub-distribution of word counts and the gather process calculates the full distribution by simply adding the counts across each sub-distribution.[^2] In practice, this an over-engineered solution because once a text is split on words, or even lines, the process is essentially done. It does illustrate, though, that the "atoms" of work in a scatter gather pattern may be smaller than individual files.

[^2]: This works because the fundamental units and operations in this process are words and sums, respectively, the latter of which is both commutative and associative.

A more common scenario is instead scattering and gathering on files only. While in this example every book corresponds to a single file, that's mostly a reflection of how we received the data rather than anything inherent to the analysis. We could also have, for whatever reason, received each book in multiple files split into chapters or at a maximum size. In that case, the word counting process would gather across multiple files. The practical implementation of scatter gather processes is therefore highly dependent on the organization of the input data within and between files, how the "atoms" of work are conceptualized, and the computational requirements of those "atoms".[^3] As a result, it's impossible to make generalizations about the best way of splitting work in workflows, and in practice these decisions will depend on a mixture of design and engineering considerations.

[^3]: The computational requirements of an atom of work can even be a key factor of its definition!

By the way, for the bioinformaticians out there, if all this seems completely unrelated to anything in the real-world, mentally swap "counting words" with "mapping reads," "books" with "samples," and "genres" with "experimental condition."

## Implementing the business logic in Python
Before diving into the specifics of Nextflow and Snakemake, we'll first write the core components of our pipeline as Python scripts. The division of labor will be the Python scripts will handle all the logic of cleaning the text files, counting the words, making the pairwise comparisons, *etc.*, and the workflow managers will handle executing those scripts on the appropriate inputs. Deciding the exact breakdown between the two is a bit of an art and will depend on the flexibility of the pipeline's design, but in general scripts take care of all the actual computations, and the workflow manager is only responsible for running those scripts at the right time.

Furthermore, we'll generally write our Python scripts agnostic to the genres and titles of the files they're operating on; that is, most won't explicitly handle this information and will only work with input and output file paths. We'll instead have to encode this metadata in the names of the files themselves. This will introduce some complications down the line for both Nextflow and Snakemake, but it will also simulate how metadata is often handled in practice, especially when working with tools or formats that can't encode it in the file itself.

### Exploring the data
However, before we can even begin to think about writing code, we first need to understand what the data are. The goal of this pipeline is to calculate various statistics derived from the counts of words in books, so I've selected 13 books in the public domain, downloaded their plain text files from [Project Gutenberg](https://www.gutenberg.org/), and grouped them into three "genres"[^4] under the `data/` directory in the project's root.

[^4]: Take these groupings with a grain of salt, especially since Shakespeare is an author.

```
workflow_tutorial/
├── data/
│   ├── childrens/
│   │   ├── alices-adventures-in-wonderland.txt
│   │   ├── peter-pan.txt
│   │   ├── the-jungle-book.txt
│   │   ├── the-wonderful-wizard-of-oz.txt
│   │   ├── through-the-looking-glass.txt
│   │   └── winnie-the-pooh.txt
│   ├── scifi/
│   │   ├── frankenstein.txt
│   │   ├── the-strange-case-of-dr-jekyll-and-mr-hyde.txt
│   │   ├── the-time-machine.txt
│   │   └── the-war-of-the-worlds.txt
│   └── shakespeare/
│       ├── hamlet.txt
│       ├── macbeth.txt
│       └── romeo-and-juliet.txt
⋮
```

By the way, these files and all code we'll write throughout this tutorial are available in this GitHub [repo](https://github.com/marcsingleton/workflow_tutorial). Good taste limits the amount of code I'm willing to show in one block, but the structure of the scripts and project will make much more sense when viewed together, so I highly recommend periodically referring to it while reading this post.

It's always a good idea to look at the beginning, middle, and end of some of the raw data as a sanity check, so let's do that now. For example, the beginning of `romeo-and-juliet.txt` is:

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

Clearly, this file has a header declaring it as a Project Gutenberg eBook along with licensing information and some other metadata. Likewise, it also has a footer, which begins at line 5299 and continues for another few hundred lines.

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

In general, not all data files contain headers, and even fewer contain footers, but when they do, the pipeline must account for them. If it doesn't, at best the pipeline will crash because something unexpected happened. At worst, though, the pipeline won't notice and will continue chugging along, happily returning incorrect results. That's why it's essential to spot check a few input files at both the beginning and end. This is where it's also helpful to have some domain knowledge. For example, being remotely acquainted with Shakespeare (and literature in general) makes it obvious the text at the end was part of a license. However, it's usually not practical to check every input manually, so a better overall strategy is to program defensively. Incorporate checks to verify any assumptions made about the data during its processing and throw errors liberally! If the data has the expected structure, the code should still run without any issues, but if not, the user should know!

### Cleaning the data: Scope
We're now ready to start writing some code. Our first task is to create a script that removes the header and footer from an input file and saves the result to disk. The pipeline will then feed these cleaned files into a subsequent script that counts the words. Strictly speaking, we could combine these two steps into a single script since it's simple to count only the words after the header and before the footer when processing a file line by line. However, we won't do that here for two reasons. The first is pedagogical. Since the primary purpose of this post is to illustrate how to implement a pipeline in Nextflow and Snakemake, we'll keep the individual steps simple to focus our attention more on how workflow managers express the relationships between steps and less on the details of their computations.

The second is philosophical. In computing, particularly in the Unix ecosystem, there's an idea that programs should do one thing and do it well since this encourages developers to write clear and reusable code. For example, though our data has a uniform structure with the same header and footer in each file, we may in the future want to adapt the pipeline to handle different formats. By separating the two steps, we ensure we would only have to change the pre-processing code to support a new format, which makes the pipeline both easier to modify and maintain. As final note, if we were really following every tenet of the Unix philosophy, we would write our scripts to handle data streams rather than files where possible. While this design would be more efficient from a storage and memory perspective, we'll save the intermediates to disk for simplicity and ease of validating the results.

### Aside: Boilerplate for command line scripts
As our workflow managers will effectively run these scripts from the command line, they'll need to handle accepting arguments for the input and output paths as well as creating any directories for the output if necessary.[^5] Since this code is boilerplate that won't change much, if at all, between the scripts in this pipeline, I'll introduce it once here, so afterwards we can focus on the business logic of each script. In our actual scripts, we'll of course replace the placeholder comments with any necessary code, and the argument definitions may differ, but they'll all follow this same overall format.

[^5]: Scripts run with Snakemake can sidestep any argument parsing in Python scripts by accessing arguments through the `snakemake` object and running the command with a [script guard](https://snakemake.readthedocs.io/en/stable/snakefiles/rules.html#python). I avoid this approach, though, because it makes the underlying scripts less portable. Additionally, Snakemake automatically creates directories for its outputs, but we won't depend on that behavior for the same reason.

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

The first thing of note is the argument parsing block, which uses Python's built-in argument parsing module, `argparse`. It supports an extensive set of features, but fortunately its basic usage is simple. Positional arguments are defined by name with `add_argument` calls to an instance of an `ArgumentParser` object. These arguments are then read into an object (called `args` here) using the `parse_args` method where they are available as attributes. The second non-placeholder block then extracts the path of the output directory and creates it if necessary. If the output path is just a file name, `output_dir` will be an empty string, so the if statement checks for that possibility first.

Finally, all code that isn't imports, function definitions, or constants is wrapped in an `if __name__ == '__main__':` statement. This isn't strictly necessary, but it's a common idiom in Python scripts. There are many resources diving deep into the purpose of this statement on the internet, but the basic idea is to allow the code to execute only when it's run as a script and not when it's imported as a module. Would anyone ever try to import this script as a module and then be surprised when it crashes their program because tries to parse input arguments and execute other code? Not likely to be honest, but it's good practice to include it anyway since it's only a single line.

### Cleaning the date: Implementation
With the boilerplate out of the way, let's write the code to remove the header and footer and store the result in a file:

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

The idea here is simple. We read the input file line by line and only return the lines after the line marking the start of the text and stopping after the line marking its end. This is written as a generator to not needlessly store the complete text in memory before writing to disk, but it would work just the same if `get_text_lines` returned a list of lines.

The final script is saved as `code/remove_pg.py` in the workflow repository.

### Counting words
The next step of the pipeline is to count the words in each cleaned file. The idea here is also simple. We process the files line by line, first splitting words on whitespace and then processing those words to standardize them. Counts of the processed words are stored in a `Counter` object, available from the `collections` module of the standard library and subsequently are written to file in count then alphabetical order.

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

The most finicky part of this script is extracting words from each line since there are a few edge cases. The first of these is in splitting the words. While most words are separated by whitespace, some authors in our texts also use em dashes or double hyphens, so these are also included in the regular expression that defines word delimiters. This splitting, however, does not remove punctuation marks at the start or end of words. The built-in `strip` method of strings and `punctuation` constant from the `string` module take care of this easily, though. The latter doesn't include curly quotes by default, which are separate characters, so we include them manually. Finally, we convert all words to lowercase since for our purposes a word is the same regardless of its capitalization.

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

A side effect of stripping punctuation marks is that it can sometimes result in empty words. For example, *Winnie the Pooh* contains lines of spaced asterisks to mark sections within the text. Because the splitting on whitespace yields words that are "naked" asterisks, stripping them will create empty strings. As a result, in the first code block, the list of words derived from each line is filtered for empty strings.

The above code was the result of several rounds of iteration, and it was only by carefully examining the results that I identified the edge cases in the line and word processing steps. This is a general feature of data analysis, particularly in pipeline prototyping. It's difficult to know all the idiosyncrasies of a data set in advance, so it's important to perform sanity checks and exploratory analyses on intermediate results to ensure their validity.

This script is saved under `coding/count_words.py`.

### Calculating statistics from word counts
Before continuing to the main goal of comparing these word count distributions within and between genres, let's take a brief detour to calculate some summary statistics from each distribution individually. This will not only give us an interesting look into the text of each book, but it's also an important part of the iterative approach to pipeline design mentioned previously. The full script, `coding/basic_stats.py`, calculates eleven statistics, but for brevity I'll only show six below.

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

Since the data is stored as a table, pandas provides an efficient interface for manipulating the count distributions. As a result, most of these are self-explanatory or easily understood from their definitions except `vocab_size_L90` and possibly `entropy`. The former is inspired by a similar statistic for measuring the contiguity of a genome assembly and is defined as the number of words that account for 90% of the total number when ordered by frequency. It effectively counts the number of unique words excluding the 10% most uncommon. Entropy, on the other hand, is a measure of a distribution's "randomness" and is calculated using a function from SciPy's `stats` module.

Finally, notice that the book's title and genre are not stored directly alongside the calculated statistics. We'll instead encode this information in the output file names. This decision will make our lives a bit more complicated when it comes to aggregating the statistics from each book into a single file in the workflow managers. However, this is a common constraint for many tools and file formats, so while somewhat artificially imposed here, it will illustrate the strengths and weaknesses of Nextflow and Snakemake when handling this issue.

### Pairwise comparisons of counts
We've at last reached the main event: calculating the similarity between pairs of count distributions. To do this, we'll use the Jensen-Shannon (JSD) divergence, which, like entropy, is a measure from information theory. For those familiar with the topic, it's based on the Kullback-Leibler (KL) divergence. To quickly review, the KL divergence between two probability distributions \(P\) and \(Q\) over a sample space \(X\) is defined as:

$$
D_{KL}(P||Q) = \sum_{x \in X} P(x) \log \frac{P(x)}{Q(x)}
$$

Mathematically, this expression isn't symmetric with respect to \(P\) and \(Q\), so in general \(D_{KL}(P||Q) \ne D_{KL}(Q||P)\). Since \(D_{KL}(P||Q) = 0\) when \(P = Q\) and \(P\) appears outside the logarithm, the KL divergence is usually interpreted as \(Q\)'s distance from \(P\). This asymmetry, while useful in many applications of information theory, is more of a nuisance for us since we're mostly interested in the similarity between pairs of count distributions without having to explicitly privilege one as the reference. Fortunately, this issue is solved by the JSD divergence, which is defined as:

$$
JSD(P||Q) = \frac{1}{2} D_{KL}(P||M) + \frac{1}{2} D_{KL}(P||M)
$$

where \( M = \frac{1}{2}(P+Q) \) is a pointwise mean of \(P\) and \(Q\).

We'll implement parsing the count tables and calculating the JSD between them directly in Python as:

```python
from math import log


def read_counts(input_path):
    counts = {}
    with open(input_path) as file:
        file.readline()
        for line in file:
            fields = line.rstrip('\n').split('\t')
            word, count = fields[0], int(fields[1])
            counts[word] = count
    return counts


counts1 = read_counts(args.input_path_1)
counts2 = read_counts(args.input_path_2)

vocab = set(counts1) | set(counts2)
n1 = sum(counts1.values())
n2 = sum(counts2.values())

jsd = 0
for word in vocab:
    p1 = counts1.get(word, 0) / n1
    p2 = counts2.get(word, 0) / n2
    m = 0.5 * (p1 + p2)
    jsd += p1 * log(p1 / m)  # p1 as reference
    jsd += p2 * log(p2 / m)  # p2 as reference
jsd /= 2

print(jsd, end='')
```

Though we could in principle write the output JSD to an intermediate file, that adds up to a lot of disk IO for saving a single value over every single pair of books. Like with the summary statistics before, we'll instead impose an arbitrary restriction on ourselves by printing the results to standard output and later see how both workflow managers handle it.

### Aggregating the results
In the last step of our pipeline, we'll take the output from the JSD calculations and comparing them within and between genres to test whether books in the same genre use more similar sets of words than books between genres. We'll do this using pandas to group and aggregate the results accordingly. This will, however, require a small leap of the imagination since the previous script only prints a naked JSD to standard output. Let's assume for the moment, though, that using the workflow managers we've somehow recorded these results in a table saved to disk. Each pairwise comparison is a row in this table with fields for the JSD as well as the title and genre for each book in the pair. The fields for the titles and genres are designated as `title1`, `genre1`, `title2`, and `genre2` depending on which book is arbitrary designated as the first or second when the pairs are generated in our pipeline. While this kind of order instability is somewhat atypical for tabular data, we can handle it gracefully by grouping on an additional field that is `True` if the genres are the same and `False` otherwise as shown below.

```python
from textwrap import dedent

import pandas as pd
from scipy.stats import mannwhitneyu

df = pd.read_table(args.input_path)

df['intra'] = df['genre1'] == df['genre2']
intra = df.loc[df['intra'] & (df['title1'] != df['title2']), 'jsd']  # Exclude self comparisons
inter = df.loc[~df['intra'], 'jsd']
result = mannwhitneyu(intra, inter)

output = dedent(f"""\
inter_mean: {inter.mean()}
inter_median: {inter.median()}
inter_var: {inter.var()}

intra_mean: {intra.mean()}
intra_median: {intra.median()}
intra_var: {intra.var()}

mannwhitneyu_statistic: {result.statistic}
mannwhitneyu_pvalue: {result.pvalue}
""")

with open(args.output_path, 'w') as file:
    file.write(output)
```

Besides this trick, the script is a straightforward application of pandas' built-in aggregation methods. The only other calculation of note is the Mann-Whitney *U* test, a standard non-parametric test for the equality of central tendency of two distributions, which is supplied by the SciPy `stats` module.

## Linking the pieces with Nextflow
### Basic Nextflow syntax
At this point we've written the core pieces of our pipeline, so now we're finally ready to use our first workflow manager, Nextflow, to automate executing these scripts on the right inputs in the right order. Before implementing writing any code specific for our analysis, though, let's look at some prototypes of Nextflow objects. As discussed in the [overview on each manager's process model](#process-model), the building blocks of a Nextflow workflow are processes and channels where processes represent operations on streams of data carried by channels. In Nextflow syntax, this is formally written as:

```groovy
process process_name_1 {
  input:
  input_type_1 input_name_1
  input_type_2 input_name_2
  ...

  output:
  output_type_1 output_name_1
  output_type_2 output_name_2
  ...
  
  script:
  """
  command_1
  command_2
  ...
  """
}
```

This structure is largely self-explanatory. Processes declare their inputs, a script that operates on those inputs, and the expected outputs of that script. The details of how these pieces interact in practice will be clear when we see an example without any placeholders. A potentially unintuitive component are the input and output type qualifiers that precede their names. These will also become clear shortly, but for now they are essentially like type declarations which will influence how Nextflow interprets and manipulates those variables.

Processes are somewhat like functions, where the inputs and output are still placeholders for some literal values. Accordingly, Nextflow defines another structure called a workflow that links processes together by applying them to data.

```groovy
workflow {
  p0_results = process_name_0()
  p1_results = process_name_1(p0_results[0], p0_results[1])
}
```

Here `process_name_0` is some hypothetical process that can generate two output channels from scratch, and treating everything like functions and variables, we can capture the output of the called `process_name_0` as a variable `p0_results` and feed it directly into `process_name_1`. Though we store the outputs of `process_name_0` in a single variable, it's more of a tuple of two separate channels, so we have to access them individually by index to match the call signature of `process_name_1`.[^6]

[^6]: Nextflow offers a few different syntaxes for passing channels between processes. For example, while here we selected the different channels by index, it's also possible to access them by name with the `emit` keyword. Additionally, it's not strictly necessary to assign the outputs to variable since they are also available via the `out` attribute of a process, *e.g.* `process_name_0.out`. Finally, Nextflow permits [Unix-style pipes](https://www.nextflow.io/docs/latest/workflow.html#special-operators) to compose processes with single input and output channels.

### Defining a process
We'll now implement a process and workflow for the first step of our pipeline. As in any well-organized script, we'll start with a docstring at the top that describes its purpose as well as some constants we'll use throughout, which are conventionally stored as attributes under the `params` object.[^7]

[^7]: Any attribute of the `param` object is implicitly a configuration setting, meaning Nextflow can set its value from multiple locations in a [predetermined order](https://www.nextflow.io/docs/latest/config.html).

```groovy
// Nextflow pipeline for book text analysis

// Paths
params.output_path = "$projectDir/results_nf/"
params.data_path = "$projectDir/data/"
params.code_path = "$projectDir/code/"
```

These constants are the paths to various directories in our workflow, so if we ever want to change the location of the outputs, for example, we only need to change it in one place. In Nextflow, strings can be stored with either double or single quotes, but the former allows interpolation of the `projectDir` variable marked with the dollar sign. (`projectDir` is a convenience variable which is available in every Nextflow runtime environment that corresponds to the directory of the main script.)

With the constants out of the way, let's define our first Nextflow process, which will run the `remove_pg.py` script on an input file to remove the Project Gutenberg header and footer.

```groovy
process remove_pg {
    publishDir "$params.output_path/"

    input:
    tuple val(meta), path(input_path)
    
    output:
    tuple val(meta), path("${meta.genre}/${meta.title}_clean.txt")
    
    script:
    """
    python $params.code_path/remove_pg.py $input_path ${meta.genre}/${meta.title}_clean.txt
    """
}
```

Like many Nextflow processes, this example is largely a direct substitution from the previous template. The input block defines the input variables which are then interpolated into a string that is executed on the command line, using brackets where necessary to delimit any ambiguous names. The expected outputs, including the name of the cleaned output file specified as an argument to the script, are declared in the output block. Finally, the script block contains the script executed on the command line, using triple quotes to allow for a possibly multiline string.

Two details deserve further explanation, however. First is the `publishDir` directive. Recall that in Nextflow every process is executed in an isolated working directory (named with a unique hash stored under the `work/` directory created when Nextflow runs a workflow). While it's possible to scour the `work/` directory for these outputs, `publishDir` exposes outputs in a public directory for human use. Specifically, Nextflow links any declared output files under the publication folder, directory structure and all, so scripts are free to write their outputs "in-place." This mechanism effectively creates a distinction between a workflow's public interface and its implementation, allowing developers to hide any intermediate files which aren't relevant to its human end users.

The second detail is the type qualifiers. As mentioned previously, these type qualifiers function similarly to type declarations in other programming languages, yielding different behaviors for different [input types](https://www.nextflow.io/docs/latest/process.html#inputs). For example, the `path` qualifier indicates a file or folder, so Nextflow will automatically link inputs and outputs to and from their working directories as necessary. In contrast, the `val` qualifier is a variable whose value is available by name in the process script. Here, it's applied to a map object named `meta` containing title and genre metadata which we'll discuss in more detail shortly. Finally, the `tuple` qualifier bundles values together into a single channel. If we didn't apply this qualifier on the outputs or inputs, the process would accept and generate two separate channels of metadata and files. Using our previous metaphor of channels as pneumatic tubes, we can represent this distinction graphically.

{{< figure src="tuple_channel.svg" caption="Inputs to processes are matched but not ordered, so tuple channels are used to package multiple associated inputs into a single message." >}}

Because Nextflow matches messages from incoming channels like Python's `zip` function but doesn't guarantee their order, the `tuple` qualifier is necessary to ensure the metadata are correctly paired with their corresponding files.

As a final note, Nextflow takes a flexible approach to parentheses, allowing their omission in certain cases. Thus, in the previous process, `tuple val(meta), path(input_path)` is equivalent to `tuple(val(meta), path(input_path))`. This pattern is common in Nextflow, so the parentheses in simple type qualifiers are typically omitted.

### Defining a workflow
Processes only define rules for obtaining outputs from some inputs, so to apply the `remove_pg` process to our input data, we need to use it in a workflow Notice, though, that `remove_pg` doesn't contain any references to the input data and, moreover, depends on an existing channel that emits tuples of a metadata map and a path. To kickstart workflows with this kind of information, Nextflow provides channel factories that can create channels from various inputs, including Unix-style glob patterns. For example, in the workflow snippet below, `channel.fromPath` matches all files in the `data/` directory, and the following line manipulates the channel to produce a new channel of tuples containing a file and its associated metadata. The resulting `file_records` are then passed directly into the `remove_pg` which effectively acts as a function applied to each tuple in the incoming stream.

```groovy
workflow {
    // Find paths to data and convert into tuples with metadata
    file_paths = channel.fromPath("$params.data_path/*/*.txt")
    file_records = file_paths.map({
        tuple([title: it.baseName,genre: it.parent.baseName], it)
        })

    // Remove header and footer
    clean_records = remove_pg(file_records)
}
```

The definition of `file_records` may at first seem a little cryptic, but it corresponds to the following construction in Python if `parent` and `basename` were functions that generated the titles and genres appropriately by extracting the path components free of extensions and trailing separators.

```python
file_records = map(
    lambda x: tuple({'title': basename(x),'genre': basename(parent(x))}, x),
    file_paths
    )
```

In contrast to Python, Groovy uses a terser syntax for defining anonymous functions called [closures](https://groovy-lang.org/closures.html), providing an implicit parameter `it`. Additionally, [map literals](https://groovy-lang.org/groovy-dev-kit.html#Collections-Maps), Groovy's version of Python dictionaries, are delimited with square brackets, and string keys don't require quotes. However, other than these cosmetic differences, the two are equivalent.

### Aggregating the count statistics
The remaining implementation largely follows a similar pattern where each script has a corresponding process which is applied to the proper channel in the workflow definition. For brevity, I'll leave those details for the full workflow file hosted on this post's associated GitHub [repo](https://github.com/marcsingleton/workflow_tutorial/blob/main/workflow.nf).

There are, however, two steps that require some finesse. The first of these is when the individual word count statistics are gathered into a single file. Alone, the `basic_stats` process (which runs `basic_stats.py`) produces a TSV of statistics derived from the word count distribution of each book that looks something like the following, using `romeo-and-juliet.txt` as an example again.

| vocab_size | longest_word | most_common_word | entropy |
| --- | --- | --- | --- |
| 3762 | serving-creature’s | and | 6.432 |

(For brevity, only a subset of the full output is shown here.)

Looking at 13 TSVs individually is tedious, so we'd like to combine them by essentially stacking the rows. Nextflow fortunately has a method for manipulating channels (an [operator](https://www.nextflow.io/docs/latest/operator.html) in Nextflow jargon) to do exactly this called `collectFile`. Accordingly, we can expand our workflow definition to calculate and aggregate these statistics with the following lines.

```groovy
// Count words and calculate basic stats of counts
count_records = count_words(clean_records)
basic_records = basic_stats(count_records)
    .collectFile({it[1].text}
                 name: "$params.output_path/basic_stats.tsv",
                 keepHeader: true, skip: 1)
```

The closure selects the text from each file in the incoming tuples (a convenience offered by Nextflow for inputs marked with `path` qualifiers), and the options `keepHeader` and `skip` work together to keep the header of the first file while skipping the first line of the remaining files. Additionally, Groovy is more flexible in allowing method calls over line breaks than Python, so chained methods are commonly started on new lines.

There is a small problem though---the individual TSVs don't have columns for the title and genre of their books, so when they're combined, we have no way of knowing which lines came from which files. To solve this, we'll introduce an intermediate process that does a little surgery on our files. Nextflow's ability to capture terminal output in a channel and the standard Unix utility `paste` make this a simple one-liner.

```groovy
process paste_ids {
    input:
    tuple val(meta), path(input_path)

    output:
    stdout

    script:
    """
    echo -n 'genre\ttitle\n${meta.genre}\t${meta.title}\n' | paste - ${input_path}
    """
}
```

For anyone unfamiliar with these commands or their options, `echo -n` prints the argument to output without a newline character since we've already included it. `paste` concatenates tabular data from multiple files, handling the line endings appropriately. Here `-` is common Unix convention indicating the first argument refers to the `stdin` from the pipe operator rather than a file name.

We'll now modify the workflow to incorporate this new process and the `sort` option on `collectFile` to order the lines by genre:

```groovy
// Count words and calculate basic stats of counts
count_records = count_words(clean_records)
basic_records = basic_stats(count_records)
basic_merged = paste_ids(basic_records)
    .collectFile(name: "$params.output_path/basic_stats.tsv",
                  keepHeader: true, skip: 1, sort: true)
```

yielding the following output (again truncated for brevity).

|genre| title | vocab_size | longest_word | most_common_word | entropy |
| --- | --- | --- | --- | --- | --- |
| childrens | alices-adventures-in-wonderland | 2671 | bread-and-butter | the | 6.023 |
| ⋮ | ⋮ | ⋮ | ⋮ | ⋮ | ⋮ |
| shakespeare | romeo-and-juliet | 3762 | serving-creature’s | and | 6.432 |

### Calculating and aggregating pairwise similarities
The next difficulty comes when calculating and aggregating the pairwise similarities between books. The main conceptual leap is in generating the pairs in the first place, but this is also the easiest because Nextflow has a channel operator `combine` that produces all combinations of items between two source channels. Thus, we can simply combine `count_records` with itself to create a channel of pairs. However, because this is a self combination, it will generate *permutations*, meaning the resulting channel will include both (`hamlet.txt`, `peter-pan.txt`) and (`peter-pan.txt`, `hamlet.txt`) as distinct pairs, for example. Because our similarity metric, the JSD, is symmetric, this is an unnecessary recalculation, so we'll remove the duplicates with the `unique` operator called on a closure that generates a unique key for each pair by sorting their titles alphabetically.

```groovy
count_pairs = count_records
    .combine(count_records)
    .map({
        meta1 = it[0].collectEntries((key, value) -> [key + '1', value])
        meta2 = it[2].collectEntries((key, value) -> [key + '2', value])
        meta = meta1 + meta2
        tuple(meta, it[1], it[3]) // Last line of a closure is its return value
        })
    .unique({[it[0].title1, it[0].title2].sort()})
```

Before, though, we apply the `map` operator to combine the metadata from each item in the pair for readability purposes. This is largely an exercise in manipulating maps (the data structure, not the function) in Groovy, so I'll link directly to the documentation for the [`collectEntries`](https://docs.groovy-lang.org/latest/html/groovy-jdk/java/lang/Iterable.html#collectEntries()) method.

We'll next call the `jsd_divergence` process on the pairs of count distributions, aggregate them into a single file, and finally compare the JSD between genres with `group_jsd_stats`.

```groovy
jsd_records = jsd_divergence(count_pairs)
jsd_merged = jsd_records
    .map({
        data = it[0].clone()  // Copy meta object to not modify
        data['jsd'] = it[1]
        keys = ['genre1', 'title1', 'genre2', 'title2', 'jsd']
        header = keys.join('\t') + '\n'
        values = keys.collect({data[it]}).join('\t') + '\n'
        header + values
        })
    .collectFile(name: "$params.output_path/jsd_divergence.tsv",
                  keepHeader: true, skip: 1, sort: true)
group_jsd_records = group_jsd_stats(jsd_merged)
```

The aggregation step here uses constructions similar to the previous two code blocks, so I won't discuss it further besides linking to the documentation for the [`join`](https://docs.groovy-lang.org/latest/html/groovy-jdk/java/lang/Iterable.html#join(java.lang.String)) and [`collect`](https://docs.groovy-lang.org/latest/html/groovy-jdk/java/lang/Iterable.html#collect(groovy.lang.Closure)) methods. Fortunately, these are the last steps of our workflow. We should be able to run it from start to finish now, so download the repo and try for yourself!

## Linking the pieces with Snakemake
### Basic Snakemake syntax
Having seen the Nextflow implementation of our pipeline, let's see how Snakemake expresses the same relationships between the inputs and outputs of our analysis steps. Before getting into specifics, however, we'll quickly review Snakemake's workflow model and introduce its syntax. In contrast to Nextflow, which builds workflows from processes, Snakemake is based on files and the rules that create those files. For example, the hypothetical process we used in the Nextflow syntax introduction would be written as:

```python
rule rule_name_1
    input:
        'input_path_1',
        'input_path_2',
        ...
  
    output:
        'output_path_1',
        'output_path_2',
        ...
    
    shell:
        '''
        command_1
        command_2
        ...
        '''
```

in Snakemake.

Snakemake rules are analogous to Nextflow's processes both in terms of function and structure, so there are many similarities between the two. There are also some key differences, however. First, both inputs and outputs are strings for names of files (or patterns with wildcards to match names of files). In contrast, for Nextflow processes, inputs are more like argument names of functions, though outputs marked with `path` qualifiers blur the distinction somewhat. I should also note that Snakemake's syntax is derived from Python, so the indentation level is a necessary part of a properly formed rule. Additionally, unlike in Nextflow, inputs and outputs are separated by commas.

The second major difference is Snakemake does not have a distinct workflow object. Whereas in Nextflow, processes are templates for generating outputs that must be applied to inputs in a workflow, in Snakemake rules can encompass patterns containing wildcards as well as specific files. In fact, a workflow file needs at least one rule whose inputs and outputs don't have any wildcards, as this allows Snakemake to transform an abstract collection of rules into a concrete chain of operations. This difference will be clearer when we implement our pipeline, though, so let's jump right in!

### Defining rules
As in Nextflow, we'll include a docstring and some path constants at the top.[^8] Snakemake is a little fussier about using double separators in its paths, so we'll exclude the trailing slashes here and instead include them when we write any paths in our rules.

```python
"""Snakemake pipeline for book text analysis."""

# Paths
output_path = 'results_smk'
data_path = 'data'
code_path = 'code'
```

[^8]: Unlike Nextflow, constants aren't stored under a `params` object, and we can't directly modify them from the command line. Snakemake does offer a similar feature for parameters stored in a [configuration file](https://snakemake.readthedocs.io/en/stable/snakefiles/configuration.html), however.

Let's now write a rule for running `remove_pg.py` on an input file.

```python
rule remove_pg:
    input:
        f'{data_path}/{{genre}}/{{title}}.txt'
    output:
        f'{output_path}/{{genre}}/{{title}}_clean.txt'
    shell:
        f'''
        python {code_path}/remove_pg.py {{input}} {{output}}
        '''
```

In Snakemake, placeholders in file names and shell commands are delimited with double sets of curly brackets, so `genre`, `title`, `input`, and `output` are all placeholders for values that will be filled in during execution. `input` and `output` are "simple" placeholders in that Snakemake directly replaces their occurrences in the shell block with their values from the input and output blocks, joining the different entries in each with whitespace. In contrast, `genre` and `title` are wildcards which will allow Snakemake to pattern match file names across rules and build the chain of operations. This distinction is apparent in how shell blocks do not permit the direct use of the wildcard names defined in input blocks; they are instead accessed as attributes of the `wildcards` object, *e.g.* `wildcards.genre`.

Usually, placeholders are delineated with single sets of curly brackets. However, in this example the file names are given as [f-strings](https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals), so we can substitute the constants we defined earlier. To distinguish these cases, we double the braces for the Snakemake placeholders. The difference between the two can be confusing at first, but it's helpful to think of Snakemake as processing a workflow file in two passes. In the first, it substitutes the value of all expressions in single brackets in f-strings. In the second, any remaining names delimited by single brackets in normal strings and double brackets in f-strings are iteratively matched against any needed inputs and outputs until all wildcards are resolved into a concrete chain of operations. 

The rule for the second script in the pipeline, `count_word.py`, is written similarly, though we can avoid duplicating the pattern for the output of `remove_pg` by directly referencing it via the `rules` object.

```python
rule count_words:
    input:
        rules.remove_pg.output
    output:
        f'{output_path}/{{genre}}/{{title}}_counts.tsv'
    shell:
        f'''
        python {code_path}/count_words.py {{input}} {{output}}
        '''
```

### Aggregating count statistics
Many of the remaining rule definitions follow a similar pattern, so I'll again link to the [full workflow file](https://github.com/marcsingleton/workflow_tutorial/blob/main/workflow.smk) on GitHub instead of covering them in detail here. As in Nextflow, though, aggregating the count statistics requires some additional tricks we haven't covered yet since in Snakemake these kinds of "gather" steps are typically where wildcards are replaced with literal names. 

First, though, we need to tell Snakemake where to find the data and how to extract the metadata from the file paths. Fortunately, Snakemake has a built-in function `glob_wildcards` that does exactly this.

```python
# Collect metadata
GENRES, TITLES = glob_wildcards(f'{data_path}/{{genre}}/{{title}}.txt')
META = list(zip(GENRES, TITLES))
```

We've also gone ahead and zipped together the `GENRE` and `TITLE` lists into metadata tuples since this will make generating pairwise combinations easier. These lines together play a role like the first two commands in the Nextflow workflow. However, as Snakemake doesn't have an explicit workflow definition, we'll instead write these lines immediately under the path constants at the top of the workflow file since they effectively act as a different set of constants within the workflow. Now we can write the rule that aggregates the count statistics into a single file.

```python
rule merge_basic_stats:
    input:
        expand(rules.basic_stats.output, zip,
               genre=GENRES, title=TITLES)
    output:
        f'{output_path}/basic_stats.tsv'
    shell:
        '''
        read -a files <<< "{input}"
        echo -n "genre\ttitle\t" > "{output}"
        head -n 1 ${{files[0]}} >> "{output}"
        for file in "${{files[@]}}"
        do
            base=$(basename $file)
            title=${{base%%_*}}
            genre=$(basename $(dirname $file))
            echo -n "$genre\t$title\t"
            tail -n +2 $file
        done | sort >> "{output}"
        '''
```

We'll tackle the input block first. `expand` is another Snakemake convenience function that fills in wildcards using lists of values provided by matching keyword arguments. For example, `rules.basic_stats.output` is the string `'f'results_smk/{genre}/{title}_stats.tsv'`, so Snakemake will use the `GENRE` and `TITLE` lists to generate the path to the count statistics for every book. (By default, `expand` yields every combination of the provided wildcard values, but we can specify matched inputs by providing `zip` as the second argument).

Now let's look at the shell block. In contrast to its counterpart in Nextflow, this script for merging the TSVs is considerably more involved. Because Snakemake only models the relationship between files, it lacks features for directly manipulating metadata and file contents. Instead, we must extract this information from the file paths themselves using a variety of bash scripting tricks. Most of the commands use familiar idioms like redirection and command substitution, but some involve less common syntax. For example, the first line reads the input into an [array variable](https://tldp.org/LDP/abs/html/arrays.html) using a [here string](https://tldp.org/LDP/abs/html/x17837.html). Because the `read` command splits its input using whitespace, this single line forces the pipeline to disallow spaces in its input file names. This is generally good practice anyway, but it does illustrate how using bash for data manipulation can introduce unexpected constraints. Another piece of advanced syntax is the line `title=${{base%%_*}}`, which uses a bash feature for [trimming substrings from variables](https://tldp.org/LDP/abs/html/string-manipulation.html) to extract the title from the input file.

### Calculating and aggregating pairwise similarities
Likewise, calculating and aggregating the pairwise similarities present additional challenges. As before, we'll save explicitly enumerating the input files until the "gather" step, so the rule for running `jsd_divergence.py` will use wildcards. We can't directly use the output of the `count_words` rule, though. `jsd_divergence.py` accepts two file paths, which in this case are produced by the same rule and have the same wildcard names (`genre` and `title`). As a result, there's no way to distinguish the two when constructing the output file path. However, because rule inputs and outputs are strings, we can easily modify the wildcard names with built-in Python methods.

```python
rule jsd_divergence:
    input:
       file1 = rules.count_words.output[0].replace('genre', 'genre1').replace('title', 'title1'),
       file2 = rules.count_words.output[0].replace('genre', 'genre2').replace('title', 'title2')
    output:
        temp(f'{output_path}/jsd_divergence/{{genre1}}|{{title1}}|{{genre2}}|{{title2}}.temp')
    shell:
        f'''
        python {code_path}/jsd_divergence.py {{input.file1}} {{input.file2}} > "{{output}}"
        '''
```

This rule also demonstrates a few other features of Snakemake rule syntax. For example, if a specific input or output is needed from multiple options, it can be selected by index or [as an attribute](https://snakemake.readthedocs.io/en/stable/snakefiles/rules.html#the-expand-function) by assigning names. Additionally, unlike in Nextflow, in Snakemake we can't directly capture terminal output, so we need to redirect it to a temporary file.[^9] Fortunately, Snakemake workflows can mark outputs as `temp`, which are automatically deleted after all rules that use them as input are completed.

[^9]: While each output file is uniquely identified by its combination of titles, making the genre information unnecessary, Snakemake requires that all wildcards in the input files of a rule are also used in its output files.

We're now ready to merge these temporary files, so as before we'll use `expand` to generate the literal file names that will kickstart the rule resolution process. The unique pairwise combinations themselves are easily created with the `combinations_with_replacement` function from Python's `itertools` module, though there is some additional massaging needed to separate the wildcard values into individual lists.

```python
from itertools import combinations_with_replacement

META1, META2 = zip(*combinations_with_replacement(META, 2))
GENRES1, TITLES1 = zip(*META1)
GENRES2, TITLES2 = zip(*META2)
rule merge_jsd_divergence:
    input:
        expand(rules.jsd_divergence.output, zip,
               genre1=GENRES1, title1=TITLES1,
               genre2=GENRES2, title2=TITLES2)
    output:
        f'{output_path}/jsd_divergence.tsv'
    shell:
        '''
        read -a files <<< "{input}"
        echo "genre1\ttitle1\tgenre2\ttitle2\tjsd" > "{output}"
        for file in "${{files[@]}}"
        do
            base=$(basename $file)
            meta=${{base%%.*}}
            jsd=$(cat $file)
            echo "$meta\t$jsd" | tr "|" "\t"
        done | sort >> "{output}"
        '''
```

The shell block has a similar structure to that of `merge_basic_stats`; the only additional trick I'll note here is `echo "$meta\t$jsd" | tr "|" "\t"` constructs each record from the file names themselves, replacing the field separators with tabs. This also introduces coupling between this rule and `merge_jsd_divergence`, though in principle we could replace the literal instances with a workflow constant.

As a final note in this section, I should mention `expand` doesn't create any special links between rules; it's only a convenience function that generates 91 different file paths as a one-liner. The computational graph is instead inferred via Snakemake's pattern matching rules after all f-strings and other function calls in the input and output blocks are resolved. Snakemake doesn't even require consistent names for the wildcards between rules, as this example illustrates, though it does recommend that each rule saves its output files into a unique directory to accelerate the resolution of rule dependencies.
  
### Targets and default rules
A strength of Snakemake over Nextflow is that its invocation on the command line can accept a specific rule as an argument to generate only the outputs needed by or created by that rule. In the absence of an input rule, Snakemake will use the first rule in the workflow file as its default. As a result, it's common to define a "run everything" rule conventionally called `all` as the first rule. However, if we want to access the outputs of previous rules to avoid duplicating file names, our `all` rule will need to appear after its dependencies. Fortunately, we can manually designate it as the default with the `default_target` directive as shown below.

```python
rule group_jsd_stats:
    input:
        rules.merge_jsd_divergence.output
    output:
        f'{output_path}/grouped_jsd.txt'
    shell:
        f'''
        python {code_path}/group_jsd_stats.py {{input}} {{output}}
        '''

rule all:
    default_target: True
    input:
        rules.merge_basic_stats.output,
        rules.group_jsd_stats.output
```

Here the `all` rule uses the output of `merge_basic_stats` and `group_jsd_stats` (as also shown in the above code block) for its inputs. As these are the two "terminal" computations in our workflow, they are the minimum inputs needed to trigger Snakemake to run the complete analysis pipeline. If we were to add any subsequent calculations or new branches to the pipeline, we would have to update the inputs accordingly, however.

With this final rule, the workflow is complete, so try running it and compare the results with the Nextflow ones!

## Discussion
### Are the genres really any different?
Though the question about whether the word distributions of books in the same genre are more similar than those between genres was mostly an excuse to write a pipeline, I feel that after all this, it would be a letdown to not look at the results. The relevant output is produced by `group_jsd_stats.py` and stored in `grouped_jsd.txt` by both pipelines.

```
inter_mean: 0.2178663166067625
inter_median: 0.221169948428903
inter_var: 0.0010582306153500438

intra_mean: 0.15474885919172832
intra_median: 0.15262520771867927
intra_var: 0.000475221996664538

mannwhitneyu_statistic: 46.0
mannwhitneyu_pvalue: 7.418770284720211e-11
```

The inter-group and intra-group JSD means are 0.218 and 0.155, respectively. Furthermore, this difference is highly significant, with a *p*-value of 7.42 x 10<sup>-11</sup>. Since JSD is a measure of distance, we can say with a high degree of confidence that in this data set, books in the same genre have more similar word count distributions than books between genres.

Of course, our conclusions are fairly limited since our data set contains only 13 texts whose groupings are at least a little suspect. Additionally, this analysis doesn't tell us if a particular genre was more responsible for this result than the others. For example, it's possible that we observe a significant increase in intra-genre similarity only because the "shakespeare" genre exclusively contains books written by a single author. This wouldn't mean our analysis is wrong *per se*, but it is in some senses a less interesting result. These questions, however, are beyond the scope of this post, though they would make a great project for an applied statistics course. 😉

### Is one tool better than the other?
Having implemented toy pipeline (but a sophisticated one) using both workflow managers, we're now in a good position to judge their relative strengths and weaknesses. Though I know it'll disappoint anyone looking for a definitive answer, I believe both tools have their use cases. Of the two, Nextflow is the more powerful and an overall better fit for productionizing pipelines. Part of this advantage derives from Nextflow's fundamentally more flexible abstraction for representing and organizing computations. By conceptualizing pipelines as composed of channels (streams) of data and processes that operate on those channels, Nextflow workflows can efficiently manipulate data and order operations regardless of their underlying representation or any dependence on explicit "outputs." Furthermore, Nextflow includes many utilities for easily accessing and manipulating file contents or metadata, particularly in commonly used bioinformatics formats like FASTA. In contrast, in Snakemake everything is a file, so every step in a pipeline is tied to an object in the file system, which can force the use of temporary files or other *ad hoc* features to emulate stream-like behavior.

On the other hand, I prefer Snakemake for prototyping and development. Snakemake's rules-based model facilitates rapid iteration since it's easy to extend or add branches of computation without needing to organize them into an explicit workflow. This more implicit organization also allows users to selectively execute certain portions of their pipeline by targeting specific rules or output files. When I'm working on a project, I often frequently update certain branches of a pipeline in rapid succession while leaving others untouched, so this feature is essential for avoiding unnecessarily re-running computationally intensive steps. While Nextflow can resume a workflow, its caching behavior is [complex](https://www.nextflow.io/blog/2019/demystifying-nextflow-resume.html), and there's no way to target specific processes.

Taking a step back to examine their workflow models from a broader perspective, I've seen some users contrast Nextflow and Snakemake as "forward" and "backward," respectively, but two fit squarely into existing programming paradigms. In Nextflow, the designer explicitly defines the relationship between processes and their order of execution by connecting their channels. This kind of step-by-step description of the operations used to compute a result is called imperative programming. In contrast, Snakemake takes a declarative approach where the user asks the program to compute a result, here a file output, and the program determines the operations needed to achieve that. In practice, many programming languages and problem-solving strategies incorporate elements from both paradigms, so learning to recognize and apply the common patterns across different domains is one of the most valuable skills a programmer can develop.
