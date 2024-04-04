+++
author = "Marc Singleton"
title = "A Crash Course in Hugo (draft)"
tags = ["hugo", "html", "css", "javascript", "crash-course"]
draft = true
+++

## Links
https://zwbetz.com/make-a-hugo-blog-from-scratch/
https://www.thenewdynamic.com/article/hugo-data/


## Introduction: Why make a blog?
- Started developing this website for a few reasons
  - Pay it forward to community
    - Anyone who's written code for more than a minute knows Stack Exchange is an invaluable resource for debugging and troubleshooting
    - But I've also been helped by some outstanding long-form posts that offer a deeper dive via how-to guides and tutorials
  - Get experience with web development
    - In the past have been frustrated with the static nature of visualizations created by matplotlib
    - Jupyter notebooks are more interactive, require a Python environment, which can be a barrier
    - Wanted to explore visualizing data and statistics directly in the browser
- This launched me into a crash course on web development
  - Learning curve can be steep at first, but once you grasp the basics, making clean but web pages and visualizations isn't too bad

## Web development basics
- Pillars of modern web development are: HTML, CSS, JavaScript
  - HTML: Structure and content
  - CSS: Presentation
  - JavaScript:
- Button analogy
  - HTML defines the existence of a button and the text it displays
  - CSS defines how the button looks
  - JavaScript defines what the button does
- Lines are blurred by frameworks like Tailwind that allow styling directly in HTML and CSS pseudo-classes that allow styling changes in response to user actions

## Static site generators
- No one writes a full website completely by hand
- Instead use code to write HTML, i.e. constructing websites from smaller pieces
  - How a web developer can efficiently re-use portions and achieve a consistent look without copying and pasting code
- Static web generators generate web sites before hand
  - Web pages are largely fixed in the content they can display
  - Great for blogs and documentation where content doesn't need to be adjusted to individual users
    - There are some tricks with CSS and JavaScript to make pages feel more dynamic
  - In contrast to dynamic web pages which are constructed on the fly and sent to your browser for display
    - Allows pages that are tailored to individual users, like online shopping carts or account configuration

## Hugo concepts
- Hugo builds websites from smaller pieces
- Its power is based on a relying on a reasonable set of defaults encoded by the directory structure of the project
- You don't have to manually specify for every page how exactly to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in your project
- This means the learning curve is extremely steep at first because many things in Hugo are done implicitly

### Hugo concepts: directory structure
- Overview of Hugo directory structure

### Hugo concepts: content-layout relationship
- Folders in content have a corresponding template in layout
- Hugo defines a series of fallbacks to try to find a matching template
  - Makes Hugo robust and flexible, but also very confusing at first

### Hugo concepts: single and list
- Some pages display content (singles); others display collections of those singles (lists)

## Development Tricks
- Use Chrome inspect to examine generated pages
  - Be sure to check "Disable cache"
  - Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the `hugo serve` process
