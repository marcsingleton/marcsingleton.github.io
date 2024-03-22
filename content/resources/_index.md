+++
title = "Resources"
+++

This is a page where I want to give shout outs to other great resources for all things coding, statistics, machine, learning, biology, etc. that I've come across on the web or elsewhere. I've at one point another found all of these useful for something I was trying to learn about, so I want to do my part to promote their hard work here (or at least boost their search results by feeding the ranking algorithms). 

### Bioinformatics
#### [UCSC Data File Formats](https://genome.ucsc.edu/FAQ/FAQformat.html)
Half the battle in bioinformatics is often just parsing the data, and while there are plenty tools for the standard formats, there's no point in extracting a field from a file if it's not clear what it even *means*. This page from UCSC is a valuable reference for a variety of formats. Though UCSC is not the maintainer for most of them, the page does contain links and references to many of the offical specifications. The UCSC Genomics Institute is also a *de facto* authority for a variety of other genomics resources, so the site is well-worth exploring.

#### Genomics Tools
Tools for working with some of the major genomics file formats:
- [bedtools](https://bedtools.readthedocs.io/): A toolset for BED files, enabling fast and flexible arithmetic of data associated with genomic intervals
- [Samtools](https://www.htslib.org/): Tools for manipulating high-throughput sequencing data in SAM and BAM formats, among others
- [Picard](https://broadinstitute.github.io/picard/): Tools for manipulating high-throughput sequencing data in a variety of formats, including SAM and BAM; written in Java which may be a pro or con, depending on the available computing environment
- [UCSC utils](https://hgdownload.soe.ucsc.edu/admin/exe/): A suite of command-line tools for various genomics operations and format conversions; pre-compiled binaries are stored in subdirectories named by the corresponding platform

### Coding
#### [mCoding](https://www.youtube.com/@mCoding)
mCoding, by James Murphy, is a YouTube channel known for its practical and hands-on deep dives into Python's internals. I highly recommend its videos for intermediate Python users who are looking to level-up to experts.

#### [Reducible](https://www.youtube.com/@Reducible)
Reducible is a YouTube channel that covers a variety coding topics, ranging from algorithms to computer graphics. In many ways, it feels like the computer science equivalent of 3Blue1Brown for its use of animated visualizations.

#### [Semantic Versioning](https://semver.org/)
Everyone working with code eventually has to come to terms with versioning. Version control systems like git are sufficient or internal or private uses, but once software goes public, it becomes convenient (and often necessary) to attach human-readable version mumbers. Though they seem intuitive, version numbers are surprisingly easy to mess up in the absence of a clear standard. And when entire software ecosystems depend on a common language for managing dependecies, why re-invent a perfectly good wheel?

#### [Composing Programs](https://www.composingprograms.com/)
Composing Programs is the companion text to UC Berkeley's introductory computer science class, CS 61A. Though it uses Python for its examples, its focus is less on the specifics of that language and more on general concepts in computing, such as recursion and abstraction. While it's not the first or only resource I would use when learning Python, I would recommend it and the lecture materials from [previous iterations of the course](https://inst.eecs.berkeley.edu/~cs61a/archives.html) for those who already have a grasp of Python basics and are looking for a deeper understanding of computer science fundamentals.

#### [The Linux Command Line](https://linuxcommand.org/tlcl.php)
The Linux command line text

#### [Pro Git](https://git-scm.com/book/en/v2)
Git text

### Machine Learning
#### [Distill](https://distill.pub/)
Distill was an scientific journal for machine learning articles that fully embraced the interactivity of modern web pages. Its articles largely focused on the explanation and visualization of algorithms rather than the development of novel architectures or applications. Unfortunately, it’s now on indefinite hiatus, but its articles still set a high-water mark for scientific communication.

### Mathematics
#### [3Blue1Brown](https://www.youtube.com/@3blue1brown)
3Blue1Brown, by Grant Sanderson, is likely the most popular YouTube channel in the math education space right now. Its videos cover a variety of topics from the basics of calculus to theorems from complex analysis using a signature style that combines slick animations with a narrative emphasis on intuition and discovery.

#### [The Bright Side of Mathematics](https://www.youtube.com/@brightsideofmaths)
The Bright Side of Mathematics is a YouTube channel by Julian Großmann that features on Khan Academy style short video lectures with a digital chalkboard. Unlike Khan Academy, TBSoM focuses on more advanced topics that would typically be taught in upper division undergraduate or graduate courses. However, the channel has playlists that cover foundational concepts from logic and set theory as well.

#### [Desmos Graphing Calculator](https://www.desmos.com/calculator)
A simple but powerful graphing calculator! I've been using it for years, and throughout that time it's remained an intuitive and stable web app. Don't be fooled by the minimal interface. It supports a deep set of features, including a variety of coordinate systems, inequality graphing, parameter sliders, and more! 

### Scientific Writing and Presentation
Tools for compiling references with BibTex:
- [doi2bib](https://www.doi2bib.org/): Creating bibliography entries by hand is tedious and error-prone, and not all journals will generate references in the right format. Use this tool to get the right data 99% of the time.
- [BibTex Tidy](https://flamingtempura.github.io/bibtex-tidy/): BibTex databases can get chaotic if not properly managed. Use this tool to sort and consistently format the entries.

Tools for creating figures and diagrams:
- [Inkscape](https://inkscape.org/): Don't be the person with pixelated diagrams in papers and presentations. Use a vector graphics program to scale images to any size without loss of quality. Adobe Illustrator is the industry standard for digital artists, but Inkscape is a free alternative that is powerful enough for casual users.
- [diagrams.net](https://app.diagrams.net/): Inkscape is great for complex projects but sometimes too fine-grained for simpler diagrams. Use this free tool to easily create flowcharts and other schematics.
