+++
author = "Marc Singleton"
title = "Lessons from a first project in C"
date = "2025-12-01"
summary = "Reflections on learning my first compiled language."
tags = ["C", "reflections"]
showTableOfContents = true
draft = true
+++

## A personal project to learn C
Today packages and programs used for bioinformatics and data science are written in interpreted languages or available pre-built from repos like PyPI or the conda ecosystem. As a result, it's less necessary to know the gory details of developing and building software with a compiled language. Still, it's a useful skill set when working with less supported software or when something inevitably goes wrong with an installation. I had some experience with this and knew the incantation `./configure; make; make install`, but it still seemed like black magic. This inspired me to develop a non-trivial project in C, both to understand the language as well as the associated toolchain. I could have chosen a higher-level or more modern language like C++ or Rust, but I went with C for two reasons. First, as a foundational language and one that I encounter not infrequently in my day-to-day work, it would pay to know C even if I didn't program in it again. Second, as a small and lean language, C would teach me genuine low-level programming rather than familiar Python concepts under different names.
  
To stay motivated, I needed to build something that I could in theory use day-to-day. I mostly work from the command line and often analyze sequence data, which occasionally requires viewing sequence alignments. There's no shortage of options with point-and-click GUIs, and historically I used Aliview, but switching between my terminal window and my desktop environment was always at best clunky and at worst impossible when working on remote machines. There are several command-line options, including some Python packages and even a shell script that cleverly leverages other command line programs to colorize and display the sequences. While these get the job done, I was looking for a fast and portable program that I could run as a single executable, with no dependencies other than the libraries available in a typical Unix-like environment. As a practical matter, this project was probably not the most broadly useful since similar functionality already exists elsewhere. As a personal motivator, though, it worked very well!

That said, learning C was not an easy undertaking. Between preparation and execution, this project took nearly eight months of work in my spare time before it reached a level of polish that felt worthy of a version 1.0. As a way of reflecting on this journey from "Hello, world!" to an interactive terminal application, here are a few thoughts on making the leap to C.

## Lessons learned
### What do you mean no data structures?
I was surprised to discover the C standard library doesn't contain implementations of standard data structures like dynamic arrays and hashmaps (lists and dictionaries in Python world). Knowing more about C's history, its prioritization of backwards compatibility, and the niche it fills relative to C++, this absence makes more sense to me. Simply put, C is a language that expects you to implement those features yourself if you need them. Still, it was a steep learning curve. I knew early on that I couldn't get by without a dynamic array, so I wrote one myself. It wasn't so bad, but my implementation still feels like a toy compared to the robust, highly optimized versions[^1]. Given that hashmaps are far more complicated, I declined to invest any time into reinventing that particular wheel, which made string-keyed mappings more cumbersome. On one hand, I now have a far deeper appreciation of the engineering that goes into making a good hashmap as well as the implicit cost of computing the hash function for every lookup, especially compared to just iterating over a short list of options. On the other hand, quickly indexing by a human-readable label is such a common task that it's a massive quality of life improvement to express those directly in the language rather than manually managing loops and enums. I'm glad I learned C first to grasp low-level concepts before layering on the complexity of C++, but for any future projects of this size I'll probably go with C++ (or learn Rust).

[^1]: C's lack of built-in support also makes extracting an element needlessly verbose.

### GUIs from scratch are hard
By far the hardest part of this project was implementing the GUI and user interactions. Displaying a GUI on a terminal screen is fundamentally a low-level operation; the cursor is essentially a digital pen that moves from cell to cell, writing characters.[^2] Finding the right abstractions to bridge the gap between this low-level control and the high-level interactivity we expect from programs (even terminal-based ones) took careful attention to the separation of concerns and interface design. Ultimately, the main loop is only about twenty lines of code. 

```C
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

Each of these functions hides significant complexity. For example, the command themselves don't modify the display. Instead they change internal values--for example, the cursor position in the window or the window's offsets from the first row and column. When these are modified, the program in turn sets flags indicating if certain panes need to be redrawn, and `display_refresh` uses this information to write the necessary updates to the output buffer. Yet even this explanation hides many details, as the commands only calculate the new values of the program's internal state and delegate updating them to dedicated setters.

The design of interfaces always involves a tension between efficiency and abstraction. For example, a command to move the cursor by multiple cells can be implemented by repeating one that moves it only one. While this simplifies the calculations and checks by delegating them to another function, it's less efficient than doing them directly a single time. In general, these choices depend on a combination of contextual factors, including the importance of speed over maintainability as well as personal style. In this case, I prioritized speed and independence, so no command depends on another.

[^2]: While the curses library provides a standard interface that hides some details, the programmer is still responsible for constructing their GUI from primitives like moving the cursor to a certain cell or clearing a line.

### The standard library is a mess
C is old and developed organically in its early years. Moreover, as a fundamental piece of computational infrastructure, its designers rightfully prioritize backwards compatibility above almost all else. That said, the standard library is full of footguns, most notably its various "unsafe" functions. What counts as "unsafe" varies by context and speaker,[^3] but it usually includes string manipulation functions that don't check bounds, like `strcpy` or `strlen`. Some are safe when it's guaranteed that buffer overflow can't occur, but when in doubt, the truncated versions of these functions, `strncpy` and `strnlen`, are safer alternatives. In one case, the security vulnerabilities of a function, `gets`, were so severe that it was deprecated in C99 and fully removed in C11. These are the worst offenders, but the library's overall organization also has its share of sharp edges. The pieces come together with experience, but for the newcomer, keeping the differences straight between similar-sounding headers can be maddening.[^4] The lack of namespaces doesn't help, which turns finding a function's definition into a scavenger hunt. All I can say is I don't know how anyone programmed before Google.

[^3]: Feel free to search "C unsafe functions" to get a sample of the Internet's opinions.
[^4]: I'm looking at you, `stdint.h`, `limits.h`, and `inttypes.h`.

### Pointers aren't so bad
Pointers are notoriously confusing, and C's lack of bounds checking makes them trickier still. That said, pointers are essentially a more explicit syntax for the pass-by-reference semantics found in many higher level languages. Coming from a Python background, I was already familiar with the concept that names are references to underlying objects. For example:

```C
x = [1, 2, 3]
y = x
y.append(4)
print(x)
```

Because `x` and `y` refer to the same underlying object in memory, the `4` is appended to same list as `x` and the above code prints `[1, 2, 3, 4]`. In C, this looks like:

```C
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

The basic idea is the same, but C requires explicitly declaring `y` as a pointer. Admittedly, there are a few gotchas when working with structs, and it takes practice before `char **argv` immediately registers as an array of strings, but with practice, pointers become just another way of labeling and accessing data.

### Understanding memory layout is necessary
In garbage-collected languages, memory is an abstract resource that appears and disappears as needed. In C, memory is managed explicitly. Practically speaking, this means using `malloc` to accommodate data whose size isn't known in advance and releasing that memory back to the system with `free`. This is a common high-level description of manual memory management, but using memory properly in C involves much more than mechanically calling `malloc` and `free`. Avoiding more subtle bugs and opaque compiler errors requires understanding a program's memory layout. For example, this function will almost certainly crash or produce incorrect results.

```C
int *increment(int x)
{
    int y = x + 1;
    return &y;
}
```

For these cases, memorizing "Don't return pointers except from malloc" isn't enough--the rule only makes sense once you understand the stack, the heap, and how they differ.

Here's another tricky example.

```C
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

The problem here is the assignment to `s2`. Because `s2` is a pointer rather than an array, C only allocates space on the stack for a pointer. The string itself is stored elsewhere, typically in read-only memory, so attempting to modify it is an error.[^5] In contrast, `s1` is an array, so the string "Hello" is copied from the read-only segment onto the stack where it can be modified.

These issues are quickly spotted in didactic examples, but in real code, it's easy to forget these nuances. At best, the program will crash, but sometimes it will silently corrupt memory or produce incorrect results. These bugs can be extremely difficult to identify and fix, so the best defense is developing a mental model of how data is organized in a program.

[^5]: The C standard technically only specifies that string literals have static storage duration, but in practice most compilers put them in read-only memory segments.

### Know the toolchain
Part of this journey was learning the ecosystem of tools that make it possible to write compiled programs and probe their workings when things inevitably go wrong. Many of these are obvious, but sometimes the most obvious information is the hardest to find. Here are the highlights, grouped by theme:

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

I also read countless blogs, tutorials, and manuals, some good, some bad. I've linked the best below. Of these, the Kilo tutorial stands out for its coverage of low-level terminal IO, and, more broadly, how to start a project like this from scratch. I would have been lost without it.

- [Kilo: Build Your Own Text Editor](https://viewsourcecode.org/snaptoken/kilo/index.html): a step-by-step tutorial for writing a text editor from scratch
- [The GNU C Library Manual](https://sourceware.org/glibc/manual/): a good reference for Unix concepts
- [The POSIX Standard](https://pubs.opengroup.org/onlinepubs/9799919799/): the authoritative standard, including what exactly is in the standard library header files
- [Learn Makefiles](https://makefiletutorial.com/): learning Make from scratch
- [Understanding and Using Makefile Flags](https://earthly.dev/blog/make-flags/): notes on some common Makefile flags for C programs

## C: Imperfect, but here to stay
The heyday of C is over, but it will certainly outlive all of us. This longevity is a testament to its design, striking a balance between simplicity and expressivity.[^6] Much of our computational infrastructure is still written in C or related languages, and while it's possible to program for years without ever touching C, for those trying to understand their computers at a deeper level, learning C will continue to pay off.

That said, C has many sharp edges, and for new projects that don't require maximum performance or support for legacy architectures, Rust is becoming an industry favorite. Like C, it provides mechanisms for low-level control but also supports modern features like built-in collection types, namespaces, and generics. Most significantly, its concept of ownership eliminates many types of memory errors at compile-time. This feature has won Rust endorsements from leading companies and even the [US government](https://www.darpa.mil/news/2024/memory-safety-vulnerabilities). Time will tell if Rust will stand the test of time, but C will remain, diligently doing the essential but thankless work in computing--for those willing to tell it how.

[^6]: It's also a testament to lock-in and inertia, but the point that C got a lot of things right still applies.