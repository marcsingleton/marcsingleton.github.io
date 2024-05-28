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

### An overview of Hugo's directory structure
- The directory structure of a project is the first place I like to start since it's essentially a roadmap to the codebase
- The documentation has a [complete description of the structure](https://gohugo.io/getting-started/directory-structure/), but below I focus on the most important subdirectories

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
  - The `content/` directory contains (unsurprisingly) content, that is words consumed by readers, usually written in a lightweight markup language like Markdown, though Hugo supports [other formats](https://gohugo.io/content-management/formats/)
    - This allows you to focus on the content of your site when writing posts, articles, etc. rather than fiddling with HTML
    - Also allows the appearance web sites to be easily changed since the content is separated from its presentation
  - The way this content is rendered is determined by the `layout/` which contain HTML templates
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
- Config file (or directory)
  - Sets various settings when Hugo builds the site
  - Can be a single TOML, YAML, or JSON file, but can also be a directory for more complex configurations
  - Formerly the prefix was config rather than hugo, so older projects may have a config.toml file

### The `content/` directory in-depth
- The web is essentially a tangled collection of linked HTML documents which is impossible to navigate without search engines
- Web sites, though, are small pieces of that web that should be intuitively organized, allowing the user to build a mental model of where to find information
- There are several [common structural prototypes](https://webstyleguide.com/wsg3/3-information-architecture/3-site-structure.html), but hierarchies are especially common across the web and the model that Hugo largely imposes as well
- Accordingly, the structure of the `content/` directory largely determines the structure of the rendered website
- The ideas are straightforward and similar to how you would use folders to organize files, but Hugo uses a lot of jargon that can confuse its basic principles
- We'll use the following example to illustrate these concepts more concretely which is adapted from [this page](https://gohugo.io/content-management/sections/) in the documentation

```
content/
├── articles/             <-- section (top-level directory)
│   ├── 2022/
│   │   ├── article-1/
│   │   │   ├── cover.jpg
│   │   │   └── index.md
│   │   └── article-2.md
│   └── 2023/
│       ├── article-3.md
│       └── article-4.md
├── products/             <-- section (top-level directory)
│   ├── product-1/        <-- section (has _index.md file)
│   │   ├── benefits/     <-- section (has _index.md file)
│   │   │   ├── _index.md
│   │   │   ├── benefit-1.md
│   │   │   └── benefit-2.md
│   │   ├── features/     <-- section (has _index.md file)
│   │   │   ├── _index.md
│   │   │   ├── feature-1.md
│   │   │   └── feature-2.md
│   │   └── _index.md
│   └── product-2/        <-- section (has _index.md file)
│       ├── benefits/     <-- section (has _index.md file)
│       │   ├── _index.md
│       │   ├── benefit-1.md
│       │   └── benefit-2.md
│       ├── features/     <-- section (has _index.md file)
│       │   ├── _index.md
│       │   ├── feature-1.md
│       │   └── feature-2.md
│       └── _index.md
├── _index.md
└── about.md
```

- This is a website that has a home page, about page, pages of content on articles and products, and pages that list those article and product pages
- First major concept is that Hugo uses the directory structure in content to generate the URLs for the pages where each level in the path of the file or directory becomes a segment in its URL
- Let's assume our Hugo project is configured to build our website at www.example.org
  - about.md -> www.example.org/about
  - content/articles/2023/article-3.md -> www.example.org/articles/2023/article-3
  - Footnote: Actually exist as HTML file www.example.org/articles/2023/article-3/index.html, but convention for many servers is to provide the index HTML file
  - Footnote: Can set custom URLs for specific pages or globally: https://gohugo.io/content-management/urls/
- Clear that the Markdown content pages are converted into individual pages, but the directories can be turned into pages as well
  - For example, we may want a page at www.example.org/products/ that contains information about all the products
  - By default Hugo creates these for any top-level directory in content/, so Hugo will try to create a page for both articles and products
  - However, for more nested directories we have to explicitly tell Hugo to do this by including an _index.md file directly under that directory
  - You can see that product-1/ and product-2/ have these _index.md files, so Hugo will create pages at www.example.org/products/product-1/ and www.example.org/products/product-2/, respectively
  - In contrast, the 2022/ and 2023/ directories don't have these, so Hugo won't build pages at www.example.org/articles/2022/ and www.example.org/articles/2023
- In Hugo's jargon, directories with an _index.md file are called [sections](https://gohugo.io/content-management/sections/)
- These _index.md files are more than just for marking directories as sections
  - They can also contain content that is used for building those section pages
  - For example, products/product-2/_index.md can contain a description of the product as a whole
  - For this reason it's common for content/ to contain an _index.md file that acts as the site's homepage

#### Bundles
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

#### Anatomy of a content file
- Front matter in yaml or toml
  - Example of both
- Can set parameters
  - title
  - author
- Available as parameters in templates

#### Page kinds
- https://gohugo.io/templates/section-templates/#page-kinds
- An attribute associated with a page that determines its function and in turn how it's rendered
- Default kinds
  - home
  - page
  - section
  - taxonomy
  - term

### The layout directory in-depth
- Overview of structure
- _default, partials, sections, shortcodes

### Content-layout relationship
- Foundational concept in Hugo is the relationship between the content and layout directories
- The general idea is that every piece of content has a corresponding layout that is used to generate the HTML page
- Taken to an extreme, it's possible to specify a template for each content file
- However, Hugo defines [a series of fallbacks](https://gohugo.io/templates/lookup-order/) that depend on both the structure and content attributes to try to find a matching template
  - Makes Hugo robust and flexible, but also very confusing at first

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
- https://gohugo.io/templates/introduction/
- An overview of how Hugo converts templates to final HTML pages

### The config file
- Review some key parameters

### Development Tricks
- Use Chrome inspect to examine generated pages
  - Be sure to check "Disable cache"
  - Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the `hugo serve` process
- Build website to examine outputs directly
