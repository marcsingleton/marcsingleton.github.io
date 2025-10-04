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
By far the hardest part of this project was implementing the GUI and user interactions. Displaying a GUI on a terminal screen is fundamentally a low-level operation, as the cursor is not much more than a digital pen that's moved from cell to cell to write characters.[^2] Finding the right abstractions to bridge the gap between this low-level control and the high-level interactivity we expect from programs (even terminal-based ones) took careful attention to the separation of concerns and interface design. Ultimately, the main loop is less than two dozen lines of code. 

```
while (1)
{
    input_read_key(&input_buffer, STDIN_FILENO);

    code = input_parse_keys(&input_buffer, &count, &cmd);
    switch (code)
    {
    case 0:
        input_execute_command(count, cmd);
        input_buffer.len = 0;
        break;
    case 1:
        break;
    case 2:
        input_buffer.len = 0;
        break;
    }

    display_refresh(&output_buffer);
    input_buffer_flush(&output_buffer);
    }
```

The overall idea is that the program first reads a key press into a buffer. It then attempts to parse these keys into a known command. If it's successful, a function corresponding to that command is executed. Otherwise, the buffer is cleared or left unchanged depending on if it matches the prefix of a recognized sequence of keys. Finally, the changes to the display are written to an output buffer and flushed to the terminal in two separate steps, which prevents visual artifacts like flashing by writing only complete updates to the terminal.

Of course, each of these functions hides significant complexity. For example, the command executions themselves don't modify the display. Instead they change internal values, for example the position of the cursor in the window or the window's offsets from the first row and column. When these are modified, the program in turn sets flags indicating if certain panes need to be redrawn, and `display_refresh` uses this information to write the necessary updates to the output buffer. But even this explanation hides many details, as the command executions only calculate the new values of the program's internal state and delegate updating them to dedicated setters.

The design of interfaces always involves a tension between efficiency and abstraction. For example, once a command to move the cursor one cell left is written, a command to move the cursor to the start of the line can be implemented by repeating it as many times as the cursor's current column. While this simplifies the calculations by delegating them to a another function, it's also less efficient than calculating the new position and offset directly. In general, these choices will depend on a combination of factors, including the relative importance of speed and maintainability for a particular use case as well as stylistic tastes. In this case, speed and a preference for independence won out, so in the initial release, no command is implemented in terms of another.

[^2]: While the curses library provides a standard interface that hides some details, the programmer is still responsible for constructing their GUI from primitives like moving the cursor to a certain cell or clearing a line.

### The standard library is a mess
C is old and developed organically in its early years. Moreover, as fundamental piece of computational infrastructure, its designers rightfully prioritize backwards compatibility above almost all else. That said the standard library is full of footguns, most notably the various "unsafe" functions. Safety is a sliding scale, so the list varies depending on the speaker and context,[^3] but it usually includes string manipulation functions that don't check bounds, like `strcpy` or `strlen`. Some aren't problematic when it can be guaranteed a buffer overflow can't occur, but when in doubt the truncated versions of these functions, *e.g.* `strncpy` and `strnlen`, are safer alternatives. In one case, the security vulnerabilities of a function, `gets`, were so irrevocable that it was deprecated in C99 and fully removed in C11. These are the worst offenders, but the library's overall organization also has its share of sharp edges. It makes sense once you get the hang of it, but for the newcomer keeping the differences straight between similar sounding headers can be maddening. (I'm looking at you, `stdint.h`, `limits.h`, and `inttypes.h`.) This isn't helped by the lack of namespaces, which makes finding where a function is defined a scavenger hunt. All I can say is thank god for Google--I don't know how anyone programmed without it.

[^3] Feel free to search "C unsafe functions" to get a sample of the Internet's opinions.

### Pointers aren't so bad (once you get used to them)
Pointers are infamous for causing confusion, and it's true that C's lack of bounds checking can make working with pointers tricky. At the same time, pointers are essentially a more explicit syntax for the pass-by-reference semantics found in many higher level languages. Coming from a Python background, I was already familiar with concept that names are references to underlying objects. Many introductory Python tutorials illustrate this behavior with the following example:

```
x = [1, 2, 3]
y = x
y.append(4)
print(x)
```

Because `x` and `y` refer to the same underlying object in memory, the `4` is appended to same list as `x` and the above code displays `[1, 2, 3, 4]`. In C, a similar example is written as:

```
#include <stdio.h>
#define N 4

int main()
{
    int x[N] = {1, 2, 3};
    int *y = x;
    y[N - 1] = 4;
    for (int i = 0; i < N; i++)
        printf("%d\n", x[i]);
}
```

The basic idea is the same, but C requires explicitly marking `y` as a kind of reference value. Admittedly, there are a few gotchas when working with structs, and it does take some time for something like `char **argv` to immediately parse as an array of strings, but with practice pointers become just another way of labeling and accessing data.

### Understanding memory layout is necessary
Unlike in garbage-collected languages where memory is an abstract resource that magically pops in and out of existence as needed, in C memory is managed explicitly. In practical terms, this means using `malloc` to accommodate data whose size isn't known in advance and releasing that memory back to the system with `free`. This is a common high-level description of manual memory management, but using memory properly in C involves much more than rote calls to `malloc` and `free`. Avoiding more subtle bugs and opaque compiler errors requires understanding a program's memory layout. For example, the following function will almost certainly cause incorrect results or segmentation faults.

```
int *increment(int x)
{
    int y = x + 1;
    return &y;
}
```

While it's easy to memorize "Don't return pointers except from `malloc`," the rule will never make sense without understanding what the stack is and how it differs from the heap.

Here's another tricky example.

```
int main(void)
{
    char s1[] = "Hello";
    char *s2 = "World!";
    int v[] = {0, 1, 2};
    
    s1[0] = 'h';
    s2[0] = 'w';
    v[0] = 1;
}
```

The problem is the assignment to `s2`. Because `s2` is a pointer rather than an array, C only makes space on the stack for a pointer. The string itself is stored elsewhere, typically in read-only memory, so attempting to modify it is an error.[^4] In contrast, `s1` is an array, so the string "Hello" is copied from the read-only segment onto the stack where it can be modified.

While these examples are artificial, it's easy to forget these nuances in practice. In the best cases, the program will crash, but sometimes it will silently corrupt memory or produce incorrect results. Unsurprisingly, these bugs can be extremely difficult to identify and fix, so the defense is to develop a mental model of how data is organized in a program.

[^4]: The C standard technically only specifies that string literals have static storage duration, but in practice most compilers put them in read-only memory segments.

### Tools and resources
Part of this journey was simply learning the ecosystem of tools and resources that make it possible to write compiled programs and probe their workings when things inevitably go wrong. Many of these are "obvious," but sometimes the most obvious information is the hardest to find, so here's a short list grouped by theme:

  - Build tools
    - Make: classic Unix program automating actions; commonly used for compiling executables
    - `ld`: linker--typically called by other programs like `gcc` or `clang`, so some options are documented in its manual entry
  - Inspecting binaries
    - `readelf`: displays information about ELF binaries (executable format on Linux); shows headers, sections, symbols, and more
    - `otool`: the macOS equivalent to `readelf`
    - `objdump`: cross-platform disassembler and object file analyzer
    - `ldd`: lists dynamic library dependencies of an executable; useful for tracking down missing shared libraries
    - `nm`: lists symbols from object files; helpful for finding function names and checking what's exported
  - Debugging
    - `gdb`: GNU Debugger--the classic option for debugging binaries
    - `lldb`: the LLVM alternative; included on macOS with Xcode
    - `leaks`: detects memory leaks; a macOS-friendly alternative to Valgrind
    - `fsanitize=address`: a compiler flag (for GCC/Clang) that instruments code to detect memory errors like buffer overflows and use-after-free at runtime

I also countless blogs, tutorials, and manuals, some good, some bad, some linked below. Of these, the Kilo tutorial is the highlight for its coverage of low-level terminal IO, and, more broadly, how to even start a project like this from scratch. I would have been lost without it.

- [Kilo: Build Your Own Text Editor](https://viewsourcecode.org/snaptoken/kilo/index.html): a step-by-step tutorial for writing a text editor from scratch
- [The GNU C Library Manual](https://sourceware.org/glibc/manual/): a good reference for Unix concepts
- [The POSIX Standard](https://pubs.opengroup.org/onlinepubs/9799919799/): the authoritative standard, including what exactly is in a the standard library header files
- [Learn Makefiles](https://makefiletutorial.com/): learning Make from scratch
- [Understanding and Using Makefile Flags](https://earthly.dev/blog/make-flags/): notes on some common Makefile flags for C programs

## Conclusions
The heyday of C is over, but it will certainly outlive all of us living in the year 2025. This longevity is a testament to its design, striking a balance between simplicity and expressivity.[^6] Vast portions of our computational infrastructure are still written in C or related languages, and while it's possible to make a living as a programmer without ever touching C, for those trying to interact with and understand their computers at a deeper level, learning a bit of C will continue to pay off.

That said, C has many sharp edges, and for new projects that don't require squeezing out every drop of performance or support for legacy architectures, Rust is rapidly gaining momentum as the industry standard. Like C, it provides mechanisms for low-level control but is also a fully modern language with builtin collection types, namespaces, and generics. Most significantly, its concept of ownership eliminates many types of memory errors at compile-time. This feature has won Rust endorsements from the biggest names in software, including the [US government](https://www.darpa.mil/news/2024/memory-safety-vulnerabilities). Rust has even made it into the Linux kernel, though not without some controversy. Time will tell if Rust is here to stay, but C will remain, diligently doing the essential but thankless work in computing--for those willing to tell it how.

[^6]: It's also a testament to lock-in and inertia, but the point that C got a lot of things right still applies.