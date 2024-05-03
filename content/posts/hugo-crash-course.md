+++
author = "Marc Singleton"
title = "A Crash Course in Hugo (draft)"
tags = ["hugo", "html", "css", "javascript", "crash-course", "explanation"]
draft = true
+++

## Links
https://zwbetz.com/make-a-hugo-blog-from-scratch/
https://www.thenewdynamic.com/article/hugo-data/

## Introduction: Why make a blog?
- Started developing this website for a few reasons
  - Pay it forward to community
    - Anyone who's written code for more than a minute knows Stack Exchange is an invaluable resource for debugging and troubleshooting
    - But I've also been helped by some outstanding long-form posts that offer a deeper dive via tutorials and how-to guides
  - Get experience with web development
    - In the past have been frustrated with the static visualizations created by matplotlib
    - Jupyter notebooks are more interactive but require a Python environment
      - Services like Binder or Colab host computing environments in the cloud, which can lower the barrier to entry
      - However, nothing beats the accessibility of a browser running JavaScript, especially for illustrating fundamental concepts in statistics and machine learning
- This launched me into a crash course on web development
  - The learning curve can be steep at first, but once you grasp the basics, making clean but attractive web pages and visualizations isn't too bad
- The rest of this post is divided into three parts
  - First covers some web development basics
  - Second describes static site generation
  - Third relates this ideas to how Hugo builds a website

## Web development basics
- Pillars of modern web development are: HTML, CSS, JavaScript
  - HTML: Structure and content
  - CSS: Presentation
  - JavaScript: Interaction and reaction
- Button analogy
  - HTML defines the existence of a button and the text it displays
  - CSS defines how the button looks
  - JavaScript defines what the button does
- Lines are blurred by frameworks like Tailwind that allow styling directly in HTML and CSS pseudo-classes that allow styling changes in response to user actions

## Static site generators
- No one writes a full website completely by hand
- Instead use code to write HTML, i.e., constructing websites from smaller pieces
  - How a web developer can efficiently re-use portions and achieve a consistent look without copying and pasting code
- Static site generators generate web sites before hand
  - Web pages are largely fixed in the content they can display
  - Great for blogs and documentation where content doesn't need to be adjusted to individual users
    - There are some tricks with CSS and JavaScript to make pages feel more dynamic
  - In contrast, dynamic web pages which are constructed on the fly and sent to the browser for display
    - Allows pages that are tailored to individual users, like online shopping carts or account configuration
  - Though the pages on a static site are pre-generated, the HTML pages that display the content are still constructed using code
    - This is called building the site and is distinct from writing that code (development) and making the site's pages available on a server (deployment)

## Hugo concepts
- Hugo builds websites from smaller pieces
- Its power comes from relying on a reasonable set of defaults encoded by the directory structure of the project
- It's not necessarily to manually specify for every page how exactly to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in your project
- This means the learning curve for customizing the structure of a site or the layout of pages can be extremely steep at first because many things in Hugo are done implicitly
- Hugo's documentation is a solid reference, but it's missing explanations that give a big picture understanding of how Hugo projects are structured and how the various pieces fit together
- In this post, I'll try to fill that gap by highlighting the important pieces of documentation and linking them together in narrative format

### Directory structure
- The directory structure of a project is the first place I like to start since it's essentially a roadmap
- The documentation has a [complete description of the structure](https://gohugo.io/getting-started/directory-structure/), but below I want to focus on the most important subdirectories

```
my-site/
  ├── assets/
  ├── content/
  ├── data/
  ├── layouts/
  ├── static/
  ├── themes/
  └── hugo.toml
```

- Structure and content directories
  - layout/: Custom layouts (HTML templates)
  - content/: Written content (words consumed by readers written in a lightweight markup language like Markdown)
- Resource directories
  - Includes assets/, static/, data/
  - Generally a place to store any additional resources that contribute to the content, structure, behavior, or presentation
  - Have overlapping functions and reflect evolution of Hugo framework
  - Historically used for files that are copied into the top-level directory of the built site, like ...
    - Modern method is to put these in assets/, which offers greater control for how these files are incorporated into the build with asset pipelines
  - Data is for specifically JSON, TOML, YAML, or XML files
    - Automatically parsed and fields are directly available in Hugo's templating language
- Theme directory
  - Place where external themes are installed
  - Not necessary for a project using a custom layout, but I'm including it here for any users looking to transition from an external theme to a custom, or vice-versa

### Content-layout relationship
- Folders in content have a corresponding template in layout
- Hugo defines a series of fallbacks to try to find a matching template
  - Makes Hugo robust and flexible, but also very confusing at first

### Single and list
- Some pages display content (singles); others display collections of those singles (lists)

## Development Tricks
- Use Chrome inspect to examine generated pages
  - Be sure to check "Disable cache"
  - Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the `hugo serve` process
