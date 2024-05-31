+++
author = "Marc Singleton"
title = "A Crash Course in Hugo (draft)"
date = "2024-05-30"
tags = ["hugo", "html", "crash-course", "explanation"]
showTableOfContents = true
draft = false
+++

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
  - The learning curve can be steep at first, but once you grasp the basics, building your own website is straightforward
- The rest of this post is divided into three major parts
  - The first covers some web development basics
  - The second describes static site generation
  - The third and longest then relates these ideas to how Hugo builds a website

## Web development basics
### Web technologies
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

### Static site generators
- As websites are just collections of HTML pages, it is possible to create a complete website by hand, though it would be an inefficient, bug-ridden nightmare
- Instead web developers use code to write HTML, permitting them to divide a website into distinct parts and build the final page from these smaller pieces
  - Similar to subroutines or functions, this how they can efficiently re-use portions and achieve a consistent look without copying and pasting code
- Using code to create pages in turn allows servers to construct them on the fly, enabling it to tailor those pages to individual users with data that are specific to them or frequently change, like account configuration details or shopping cart information
- While these dynamic pages are a good fit for these use cases, they're also overkill for websites like blogs and documentation where the content doesn't change from user to user
- Instead a common approach is to render the pages statically, *i.e.* entirely beforehand, using a program called a static site generator
- Even though these pages are created in advance, static site generators still use code to construct the HTML pages that display the content
  - The main difference is content delivery occurs in two distinct steps where the HTML files are first created and stored (building) and then made available on a server (deployment)
- The advantage of this style of content delivery is that it greatly simplifies development since the server only has to deliver stored files to users which are addressed by specific URLs
  - Furthermore, although the content itself is fixed, that doesn't mean the website itself isn't interactive, as modern CSS and JavaScript have plenty of tricks to pages dynamic using only the browser

## Hugo introduction
- Like other static site generators, Hugo is a framework for building websites, but its main claim to fame is it uses the highly performant Go language to build its pages
- However, another strength is that it renders and organizes pages using a reasonable set of default templates encoded by the directory structure of the project
- As a result, it's not necessary to manually specify for every page how exactly to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in your project
- This means the learning curve for customizing the structure of a site or the layout of pages can be extremely steep at first because many things in Hugo are done implicitly
- The official documentation is an excellent reference, but it's missing explanations that give a big picture understanding of how Hugo projects are structured and how the various pieces fit together
- There's also a fair amount of Hugo-specific jargon scattered throughout which is never defined in context
- Thus in the rest of this post, I'll try to fill that gap by highlighting the important pieces of documentation and linking them together in narrative format

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
- Config file (or directory)
  - Sets various settings when Hugo builds the site
  - Can be a single TOML, YAML, or JSON file, but can also be a directory for more complex configurations
  - Formerly the prefix was config rather than hugo, so older projects may have a config.toml file
- Theme directory
  - Place where external themes are installed
  - Not necessary for a project using a custom layout, but I'm including it here for any users looking to transition from an external theme to a custom, or vice-versa

## The content directory in-depth
- The web is essentially a tangled collection of linked HTML documents which is impossible to navigate without search engines
- Web sites, though, are small pieces of that web that should be intuitively organized, allowing the user to build a mental model of where to find information
- There are several [common structural prototypes](https://webstyleguide.com/wsg3/3-information-architecture/3-site-structure.html), but hierarchies are especially common across the web and the model that Hugo largely imposes as well
- Accordingly, the organization of the `content/` directory largely determines the organization of the rendered website
- The ideas are straightforward and similar to how a file system uses folders to organize files, but Hugo uses a lot of jargon that can confuse its basic principles
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
├── _index.md
└── about.md
```

### Pages and sections
- As suggested by its collection of Markdown files, this `content/` directory corresponds to a website that has an about page and pages of content on articles and products
  - For example, `about.md` would contain the text used for this company's about page
- The first major concept for understanding how Hugo creates a website is that it uses the directory structure in `content/` to generate the URLs for the pages where each level in the path of the file becomes a segment in its URL
- To illustrate this, let's assume our Hugo project is configured to build our website at www.example.org
  - `about.md` -> `www.example.org/about`
  - `content/articles/2023/article-3.md` -> `www.example.org/articles/2023/article-3`
  - Footnote: This page actually exists as HTML file `www.example.org/articles/2023/article-3/index.html`, but the convention for many servers is to provide the index file located at that URL
  - Footnote: These examples illustrate the default method Hugo uses to map URLs to pages, but it's possible to change this behavior by configuring the [URL management settings](https://gohugo.io/content-management/urls/)
- We'll cover the contents of these Markdown files and how Hugo renders them into HTML in a later section, but for now let's turn to the directories in this hierarchy
- It's often convenient to navigate a website exactly like a file system and have pages that correspond to the directories as well
  - For example, we may want a page at `www.example.org/products/` that contains information about all the products
- Hugo supports (and encourages!) this structure and has mechanisms for converting directories into pages
  - By default Hugo creates a page for any top-level directory in `content/`, so Hugo will create a page for both articles and products
  - However, for more nested directories we have to explicitly tell Hugo to do this by including an `_index.md` file directly under that directory
  - You can see that `product-1/` has an hierarchical structure each with an `_index.md` file, so Hugo will create pages at `www.example.org/products/product-1/`, `www.example.org/products/product-1/benefits/`, and `www.example.org/products/product-1/features/`
  - In contrast, the `2022/` and `2023/` directories don't have these, so Hugo won't build pages at `www.example.org/articles/2022/` and `www.example.org/articles/2023`
- However, these _index.md files are more than just for marking directories as sections
  - They can also contain content that is used for building those section pages
  - For example, `products/product-2/_index.md` would contain a description of the product as a whole
  - For this reason, it's common for `content/` to contain an `_index.md` file that acts as the site's homepage as shown here
- In Hugo's jargon, top-level directories or directories with an `_index.md` file are called [sections](https://gohugo.io/content-management/sections/)

### Bundles
- Interestingly, there's also a similarly named `index.md` file located under the `article-1/` directory
- Though it looks like `index.md` is marking `article-1/` as a section (with an associated page), something slightly different is going on here
- Sometimes it's convenient to associate additional resources with a page, for example image, video, or script files
  - (Hugo has extensions to Markdown called shortcodes that allow the easy inclusion of these resources when the HTML files are generated)
  - The templates can access these files as [page resources](https://gohugo.io/content-management/page-resources/) to manipulate them more programmatically
- To keep the project structure tidy, it's convenient to group these files together under a directory but still have Hugo treat it as a content file
- To do this, we mark `article-1/` as a leaf bundle by including an `index.md` which contains the Markdown text for the article itself
  - Under the URL creation scheme we discussed earlier, this yields an HTML file located at `www.example.com/articles/2022/article-1/`
- Incidentally, when directories contain an `_index.md` and other resources, this creates a branch bundle, which work similarly as leaf bundles
  - Footnote: Because `_index.md` files mark sections, all branch bundles are also sections. The converse isn't true, however, since not all sections contain `_index.md` or additional resources.
- What's the point then of having the two types of bundles that are distinguished by files differing by a single underscore?
  - As their name suggests, leaf bundles are intended to be terminal directories in the directory tree, so there [are some minor differences](https://gohugo.io/content-management/page-bundles/#comparison) in how Hugo associates resources with them as opposed to branch bundles
  - The more important distinction, however, is Hugo treats leaf and branch bundles as having single- and list-type layouts, respectively
  - We'll cover this in more detail in the section on the `layout/` directory, but Hugo associates different templates with the two layout types
  - The motivation for this is that leaf bundles correspond to terminal entries in the site structure and should primarily display **single** pieces of content
  - In contrast, branch bundles and, more generally, sections link different levels of the hierarchy together and should display **lists** of content

### Content files
- Finally at the bottom of our hierarchy are content files themselves
- Hugo supports a variety of markup formats, but [Markdown](https://commonmark.org/) is the most common
- Regardless of content format, though, all content must have [front matter](https://gohugo.io/content-management/front-matter/) at the top of the file
- This front matter is essentially metadata about the content, preferably including `title` and `date` fields at a minimum
- However, Hugo supports a variety of fields out of the box that control how the content is displayed or organized
- It's possible to define custom parameters in the front matter as well, though these are [accessed differently](https://gohugo.io/content-management/front-matter/#parameters) than the builtin fields
- As far as the format of this front matter, Hugo supports JSON, TOML, or YAML
- I won't go into the differences here as the Hugo documentation has plenty of examples, but they all can communicate the same information
  - The choice between them is really a matter of taste
  - However, of the three, I lean towards TOML
- It uses three plus signs to delimit the front matter and equals signs to assign key-value pairs
- The content then follows the front matter as shown below

```toml
+++
date = 2024-02-02T04:14:54-08:00
draft = false
title = 'Example'
weight = 10
[params]
  author = 'John Smith'
+++

The content goes here!
```

## The layout directory in-depth
- Now that we've covered the basics of the `content/` directory, let's turn to the other pillar of the Hugo framework, the `layout/` directory
- I've mentioned a few times that Hugo uses templates in `layouts/` to convert the content files into HTML files, and the general idea is Hugo uses the correspondence between structure of the two directories to identify the right template for a content file
- Taken to an extreme, it's possible to specify a template for each content file
- However, Hugo defines [a series of fallbacks](https://gohugo.io/templates/lookup-order/) that depend on both the structure and content attributes find a matching template
  - This makes Hugo robust and flexible, but also very confusing at first since the template used to build a page is rarely explicitly stated
- Overview of structure
  - _default, partials, sections, shortcodes

### Page kinds, types, and layouts
- https://gohugo.io/templates/section-templates/#page-kinds
- Attributes associated with a page that determines its function and in turn how it's rendered
- Kind has higher priority
- Default kinds
  - home
  - page
  - section
  - taxonomy
  - term
- Types are user-defined categories?

### Single and list
- Some pages display content (singles); others display collections of those singles (lists)
- Page kinds that are lists
  - home
  - section
  - taxonomy
  - term
- Page kinds that are singles
  - page

### Templates
- I won't go in depth on Hugo's templating language here because there are other dedicated resources that do the topic justice
  - For example, check out the [Hugo documentation](https://gohugo.io/templates/introduction/) for an overview of the syntax and major concepts and this [series of blog posts](https://www.thenewdynamic.com/article/hugo-data/) for more examples, ranging from simple loops to complex data transformations
- If I had to summarize the two main ideas that were most helpful to me when parsing templates, though, the first would be distinguishing the parts that are HTML and the parts that are in the templating language
- The difference may seem obvious if you're already familiar with HTML, but when you're first starting out templates can look like nested mess of angle and curly brackets
- Fortunately, there's a simple rule. Anything in double curly brackets `{{ }}` is template code, and everything else is HTML. The template code can "silently" execute statements which don't have a return value. For example, the following defines a string which can be referenced later.

```go
{{ $address := "123 Main St."}}
```

However, expressions or functions with a return value are "printed" to the resulting HTML, so this code

```go
{{ $address }}
<br>
The sum of 1 and 2 is {{ add 1 2 }}
```

yields the following HTML.

```html
123 Main St.<br>The sum of 1 and 2 is 3
```

My final note on identifying template code is flow control structures like if statements or loops (initiated with the `range` keyword) are composed of multiple sets of brackets and closed with `{{ end }}`, as shown by the following if block.

```go
{{ if eq (add 1 2) 3 }}
  1 + 2 = 3 as expected!
{{ else }}
  1 + 2 != 3. Something is very wrong here!
{{ end }}
```

The second and likely more confusing main idea in Hugo templates is its concept of the context, also called "the dot." The context is essentially the data that's passed to a template and is represented by a dot (`.`). This is often an object called a `Page` that encapsulates data about the current page and functions to manipulate that data. For example, the following wraps a page's title defined in its front matter in an HTML heading tag.

```html
<h2>{{ .Title }}</h2>
```

While straightforward now, this can get confusing since in Hugo many blocks can rebind the context to different objects. A common example is a loop like the following

```html
{{ range slice "foo" "bar" }}
  <p>{{ . }}</p>
{{ end }}
```

where the context is rebound to each element in the slice, *i.e. array, in each iteration of the loop. This is another place where Hugo takes an implicit approach, and while confusing at first, it does cut down on boilerplate code. The best way to understand this is by looking at plenty of examples. For brevity, I'll leave our discussion here, but this [blog post](https://www.regisphilibert.com/blog/2018/02/hugo-the-scope-the-context-and-the-dot/) is a good place to start.

## The config file in-depth
- Review some key parameters

## Development tricks and other resources
- Use Chrome inspect to examine generated pages
  - Be sure to check "Disable cache"
  - Hugo also doesn't always rebuild assets automatically while serving, so sometimes necessary to stop and re-start the `hugo serve` process
- Build website to examine outputs directly
- https://zwbetz.com/make-a-hugo-blog-from-scratch/
- https://www.jakewiesler.com/blog/hugo-directory-structure/