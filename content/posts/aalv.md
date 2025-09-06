+++
author = "Marc Singleton"
title = "Lessons from a first project in C"
date = "2025-12-01"
summary = "Reflections on learning my first compiled language."
tags = ["C", "reflections"]
showTableOfContents = true
draft = true
+++

## Introduction
Nowadays packages and programs used for bioinformatics and data science are written in interpreted languages or available pre-built from repos like PyPI or the conda ecosystem. As a result, it's less necessary to know the gory details of developing and building software with a compiled language. Still, it's a useful skill set when working with less supported software or when something inevitably goes wrong with an installation. I had some experience with this (cue the thousand-yard stare) and knew the incantation `./configure; make; make install`, but it still seemed like black magic. This inspired me to develop a non-trivial project in C, both to understand the language as well as the associated toolchain. While I could have chosen a higher level or more modern language like C++ or Rust, I went with C for two reasons. First, as the mother of all languages and one that I encounter not infrequently in my day-to-day work, it pays to know C even if I never programmed in it again. Second, as a small and lean language, learning C would teach me the low-level programming skills I was after rather than a different set of names for the same concepts I already knew in Python.
  
To stay motivated, I knew I needed to build something that I could in theory use day-to-day. I mostly work from the command line and often analyze sequence data, so I on occasion need to view sequence alignments. There's no shortage of options with point-and-click GUIs, and historically I used Aliview, but switching between my terminal window and my desktop environment was always at best clunky and at worst impossible, *e.g.* when working on a remote machine. There are several command line based ones, including some Python packages and at least one shell script that cleverly use other command line programs to colorize and view the sequences. While these get the job done, I was looking for a fast and portable program that I could run as a single executable with no dependencies other than the libraries available in a typical Unix-like environment. As a practical matter, this project was probably not the most broadly useful since there's little functionality here that's not available. But as a personal motivator, it worked very well!

## Thoughts
### What do you mean no data structures?
I was more than a little surprised to discover the C standard library doesn't contain implementations of standard data structures like dynamic arrays and hashmaps (lists and dictionaries in Python world). Now knowing more about C's history, its prioritization of backwards compatibility, and the niche it fills relative to C++, this absence makes more sense to me. Simply put, C is language where if you need those things, you should be able to write them yourself. Still, I was a little put-off by this. I knew early on that I couldn't get by without a dynamic array, so I wrote one myself. It wasn't so bad, but I still feel my implementation is a toy compared to the robust and highly optimized versions found in any modern language.[^1] Given that hashmaps are far more complicated, I refused to sink any time into reinventing that particular wheel, which made some instances of mapping a string to something else a little more involved. On one hand, I now have a far deeper appreciation of the engineering that goes into making a good hashmap as well as the implicit cost of computing the hash function for every lookup, especially compared to just iterating over a short list of options. But on the other hand, being able to quickly index by a human-readable label is such a common task, it's a massive quality of life improvement to express those directly in the language rather than fussing around with loops and enums. I'm glad I learned C first to get a handle on low-level concepts before layering on the complexity of C++, but for any future projects of this size I'll probably go with C++ (or learn Rust).

[^1]: C's lack of built-in support also makes extracting an element needlessly verbose.

### GUIs from scratch is hard
    - The hardest part was making the GUI and interactions
    - Display text on a terminal screen is very low-level
      - At its core, the cursor is digital pen that's moved cell to cell to paint the display
    - At the same time, integrating this low-level control with the interactivity we expect from windowed programs (even terminal-based ones) took careful attention the overall flow of the program and the interfaces between different modules
      - How should the interface react to re-sizing?
    - Finding the right abstractions and "primitives" that bridged this gap effectively took a lot of trial and error
    - Inherent tension between efficiency and abstraction
      - Should a move to start of the line use the move left or calculate the indices directly?

### The standard library is a mess
    - C is old and developed organically in its early years
    - As fundamental computational infrastructure, it prioritizes backwards compatibility above almost all else
    - That said the standard library is full of footguns
      - Unsafe functions
      - Disorganized headers
      - Lack of namespaces makes finding where a function is defined a scavenger hunt

### Pointers aren't so bad (once you get used to them)
    - Pointers are infamous for causing confusion, and it's true that C's lack of bounds checking can make working with pointers tricky
    - That said, pointers are at the core a more explicit syntax for the pass-by-reference semantics found in many higher level languages
    - Coming from a Python background, I was already familiar with concept that names are references to underlying objects
      - Common introductory example of appending to lists from different names
      - In C, you have to explicitly opt into this behavior with pointers, and my biggest gotcha was forgetting that struct assignment copies the data rather than moves it from one variable to another
    - It does take some time to get used to the multiple levels of indirection and for something like char **argv to feel as natural as an array of strings

### Understanding memory layout is necessary
    - Unlike memory managed languages where memory is an abstract resource magically pops in and out of existence as needed, in C memory is managed explicitly
    - This is the common textbook description, but it extends beyond using malloc/free to get more memory for variable-sized data
    - I can't imagine writing more complex programs in C without at least a solid understanding of how programs work at a machine level
    - Without it, you may try to return pointers to stack variables or take the address of a returned value without first storing it in a variable

### Tools and resources
    - Make
    - otool
    - ld
    - nm
    - objdump
    - readelf
    - ldd
    - leaks
    - -fsanitize=address
    - lldb
    - Links to coding tutorials

## Conclusions
  - The heyday of C is over, but it will certainly outlive me (and any hypothetical children of mine)
    - Its longevity is a testament to its design
  - For coders and even data scientists trying to interact with and understand their computers at a deeper level, learning a bit of C will continue to pay off
  - That said, C has many sharp edges
  - For new projects that don't require squeezing every drop of performance or support for ancient architectures, use Rust
    - It provides mechanisms for low-level control like C, as well as modern features like standard collection types, namespaces, generics
    - Its borrow checker can also eliminate many types of memory errors at compile-time
    - These features have won Rust endorsements from the biggest names in software
      - The Linux kernel accepted code written in Rust in 2023
        - Previously the kernel had only contained code written in C
      - Even the US government recommended memory-safe languages like Rust for new projects in a recent report
  - Thoughts on 