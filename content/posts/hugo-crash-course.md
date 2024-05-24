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
- I started developing this website for a few reasons
  - First, I want to pay it forward to community
    - Anyone who's written code for more than a minute knows Stack Exchange is an invaluable resource for debugging and troubleshooting
    - But I've also been helped by some outstanding long-form posts that offer a deeper dive via tutorials and how-to guides, so I see this blog as my platform for communicating the how and why on various topics in coding, statistics, and biology
  - Second, I wanted to gain experience in web development
    - Data, especially in academia, is often visualized with static figures in the form of still images
    - While Jupyter notebooks have exploded in popularity over the past years and offer some tools for creating basic interactive dashboards, they still require a Python environment
      - Services like [Binder](https://mybinder.org/) or [Colab](https://colab.research.google.com/) partially solve this issue by hosting notebook-style computing environments in the cloud
      - However, nothing beats the accessibility of a browser running JavaScript, especially for illustrating fundamental concepts in statistics and machine learning in narrative format as opposed to more coding-focused tutorials
      - I was especially inspired by the articles from [Distill](https://distill.pub/) on machine learning topics that combined clear explanations with interactive visualizations
        - The [*t*-SNE article](https://distill.pub/2016/misread-tsne/) in particular did more to help me intuitively understand how the algorithm represents high-dimensional data more than any number of derivations or still images
- These two goals launched me into a crash course on web development, starting with how to make a blog using a popular development framework called Hugo
  - The learning curve can be steep at first, but once you grasp the basics, making clean and attractive web pages is straightforward
- The rest of this post is divided into three major parts
  - The first covers some web development basics
  - The second describes static site generation
  - The third and longest then relates these ideas to how Hugo builds a website

## Web development basics
- The pillars of modern web development are three interrelated but distinct technologies: HTML, CSS, JavaScript
- Each handles different facets of a web page
  - HTML: structure and content
  - CSS: presentation
  - JavaScript: interaction
- A good example that illustrates these ideas more concretely is a standard button
  - HTML defines the existence of a button and the text it displays
  - CSS defines how the button looks
  - JavaScript defines what the button does
- While these are the basic differences in the roles of each technology, the lines are blurred by the addition of subsequent features to their specifications or the creation of frameworks to ease the web development
  - For example, CSS contains a feature called pseudo-classes that allow styling changes in response to user actions, and Tailwind is a CSS framework that allows styling directly in HTML code
- There are many resources for learning the basics of each, but the [Mozilla Developer Network](https://developer.mozilla.org/) is a great place to start

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
- It's not necessary to manually specify for every page how exactly to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in your project
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
  - The `content/` directory contains (unsurprisingly) content, that is words consumed by readers, usually written in a lightweight markup language like Markdown
    - This allows you to focus on the content of your site when writing posts, articles, etc. rather than fiddling with HTML
    - Also allows the appearance web sites to be easily changed since the content is separated from its presentation
  - The structure of this content is determined by the `layout/` which contain HTML templates
    - When Hugo builds a site, it combines these templates with content to create the final web pages that are ultimately displayed in a browser
- Resource directories
  - Includes `assets/`, `static/`, `data/`
  - Generally a place to store any additional resources that contribute to the content, structure, behavior, or presentation
  - Have overlapping functions and reflect evolution of Hugo framework
  - Historically used for files that are copied into the top-level directory of the built site, like ...
    - Modern method is to put these in `assets/`, which offers greater control for how these files are incorporated into the build with asset pipelines
  - `data/` is for specifically JSON, TOML, YAML, or XML files
    - Automatically parsed and fields are directly available in Hugo's templating language
- Theme directory
  - Place where external themes are installed
  - Not necessary for a project using a custom layout, but I'm including it here for any users looking to transition from an external theme to a custom, or vice-versa

### Anatomy of the content directory
- Sections (https://gohugo.io/content-management/sections/)
  - Top-level directories in content/
  - Subdirectories containing _index.md
  - Create list pages
- Non-sections
  - Internal logical organizations
  - Don't create list pages
- Home page is _index.md

### Bundles
- https://gohugo.io/content-management/page-bundles/
- A concept for associating resources with content
  - A single may have some associated images
  - Want to organize these into a single unit
- Leaf bundle: a directory that contains an index.md file and zero or more resources
  - Instead of blog-post.md we have blog-post/ with index.md and image file as children
  - Convert to directory diagram
- Branch bundle: a directory that contains an _index.md file and zero or more resources
  - Note that a directory with an _index.md file is a section
  - Sections may also need additional resources

### Anatomy of a content file
- Front matter in yaml or toml
  - Example of both
- Can set parameters
  - title
  - author
- Available as parameters in templates

### Page kinds
- https://gohugo.io/templates/section-templates/#page-kinds
- An attribute associated with a page that determines its function and in turn how it's rendered
- Default kinds
  - home
  - page
  - section
  - taxonomy
  - term

### Content-layout relationship
- Foundational concept in Hugo is the relationship between the content and layout directories
- The general idea is that every piece of content has a corresponding layout that is used to generate the HTML page
- Taken to an extreme, it's possible to specify a template for each content file
- However, Hugo defines [a series of fallbacks](https://gohugo.io/templates/lookup-order/) that depend on both the structure and content attributes to try to find a matching template
  - Makes Hugo robust and flexible, but also very confusing at first

### Anatomy of the layout directory
- Overview of structure
- _default, partials, sections, shortcodes

### Single and list
- Some pages display content (singles); others display collections of those singles (lists)
- Page kinds that are lists
  - home
  - section
  - taxonomy
  - term
- Page kinds that are singles
  - page

### Templating
- An overview of how Hugo converts templates to final HTML pages

### The config file
- Review some key parameters

## Development Tricks
- Use Chrome inspect to examine generated pages
  - Be sure to check "Disable cache"
  - Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the `hugo serve` process
