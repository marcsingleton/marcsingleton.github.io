+++
author = "Marc Singleton"
title = "A Hugo Crash Course"
draft = true
+++

# Basic concepts in web development
HTML, CSS, Javascript

No one writes HTML completely by hand
Use code to write HTML, i.e. constructing websites from smaller pieces
That's how a web developer can efficiently re-use portions and achieve a consistent look without copying and pasting code

static web generators generate web sites before hand
    web pages are largely fixed in the content they can display
    great for blogs and documentation where content doesn't need to be adjusted to individual users
    some tricks to make websites feel more dynamic
    This is in contrast to dynamic web pages which are constructed on the fly and sent to your browser for display
        Allows pages that are tailored to individual users, like online shopping carts or account configuration

# Hugo concepts
Hugo builds websites from smaller pieces
Its power is based on a relying on a reasonable set of defaults encoded by the directory structure of the project
You don't have to manually specify for every page how exactly to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in your project
This means the learning curve is extremely steep at first because many things in Hugo are done implicitly

# Tricks
Using chrome inspect to examine generated pages
Be sure to check Disable cache
Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the hugo serve process