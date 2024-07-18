+++
author = "Marc Singleton"
title = "A Crash Course in Hugo"
date = "2024-06-05"
tags = ["hugo", "html", "crash-course", "explanation"]
showTableOfContents = true
draft = false
+++

## Introduction: Why make a blog?
I started developing this website for a few reasons. First, I wanted to pay it forward to the community. Anyone who's written code for more than a minute knows the internet is an invaluable resource. While Stack Exchange is great for debugging and troubleshooting, I've also been helped by some outstanding long-form posts that offer a deeper dive via tutorials or in-depth discussions, so this blog is my platform for communicating the how and why of various topics in coding, statistics, and biology.

Second, I wanted to gain experience in web development. Data, especially in academia, is often visualized with static images. While Jupyter notebooks have exploded in popularity over the past years and offer some tools for creating basic interactive dashboards, they still require a Python environment. Services like [Binder](https://mybinder.org/) or [Colab](https://colab.research.google.com/) partially solve this issue by hosting notebook-style computing environments in the cloud. However, nothing beats the accessibility of a browser running JavaScript, especially for illustrating fundamental concepts in statistics and machine learning in a narrative format as opposed to the more coding-focused tutorials commonly seen in notebooks. I was especially inspired by the articles from [Distill](https://distill.pub/) on machine learning topics that combined clear explanations with interactive visualizations. The [*t*-SNE article](https://distill.pub/2016/misread-tsne/) in particular did more to help me intuitively understand how the algorithm represents high-dimensional data than any number of derivations or figures.

These two goals launched me into a crash course on web development, starting with making a blog using a popular development framework called [Hugo](https://gohugo.io/). The learning curve was steep at first, but once I grasped the basics, building this site was straightforward. The rest of this post, then, tries to flatten this curve by introducing the big ideas of Hugo. Accordingly, the first part sets the foundation by covering some web development basics, and the remainder takes a tour of Hugo's model for site generation by using the directory structure of a typical project as a framework.

## Web development basics
### Web technologies
The pillars of modern web development are three interrelated but distinct technologies: HTML, CSS, and JavaScript. Each handles different facets of a web page as shown in the following table.

| Technology | Function |
| --- | --- |
| HTML | content and structure |
| CSS | presentation |
| JavaScript | interaction |
  
A good example that illustrates these ideas more concretely is a standard button. HTML defines the existence of a button and the text it displays, CSS describes how the button looks, and JavaScript controls what the button does. While these are the basic differences in the role of each technology, the lines have been blurred by the addition of subsequent features to their specifications or the creation of frameworks to ease web development. For example, CSS contains a feature called pseudo-classes that allow styling changes in response to user actions, and Tailwind is a CSS framework that allows styling directly in HTML code. There are many resources for learning the basics of HTML, CSS, and JavaScript, but the [Mozilla Developer Network](https://developer.mozilla.org/) is a great place to start.

### Static site generators
As websites are collections of HTML pages, it is possible to create a complete site by hand, though it would be an inefficient, bug-ridden nightmare. Instead developers use code to write HTML, allowing them to divide a site into distinct parts and build the final page from these smaller pieces. Similar to subroutines or functions, this is how they can efficiently re-use code and achieve a consistent look without copying and pasting. Servers can in turn use this code to create pages on the fly, enabling them to tailor those pages to individual users with data that are specific to them or frequently change, like account configuration details or shopping cart information.

While these dynamic pages are a good fit for these use cases, they're also overkill for sites like blogs and documentation where the content doesn't change from user to user. Instead a common approach is to render the pages statically, *i.e.* entirely beforehand, using a program called a static site generator. Even though these pages are created in advance, static site generators still use code to construct the HTML pages that display the content. The main difference is content delivery occurs in two distinct steps where the HTML files are first created and stored (building) and then made available on a server (deployment). The advantage of this style of content delivery is that it greatly simplifies development since the server only has to deliver stored files to users which are addressed by specific URLs. Furthermore, although the content itself is fixed, that doesn't mean the site isn't interactive, as modern CSS and JavaScript have plenty of tricks to make pages dynamic using only the browser.

## Hugo introduction
Like other static site generators, Hugo is a framework for building websites, but its main claim to fame is its use of the highly performant Go language to build its pages. However, another strength is that it renders and organizes pages using a reasonable set of default templates encoded by the directory structure of the project. As a result, it's not necessary to manually specify for every page how to build common elements like the navigation bar because Hugo will automatically apply a default layout specified in the project. This means the learning curve for customizing the structure of a site or the layout of pages can be extremely steep at first because many things in Hugo are done implicitly. The official documentation is an excellent reference, but it's missing explanations that give a big picture understanding of how Hugo projects are structured and how the various pieces fit together. This is further confused by large amounts of Hugo-specific jargon scattered throughout which is never defined in context. So, in the rest of this post, I'll fill the gap by highlighting the important pieces of documentation and linking them together in a narrative format.

### An overview of Hugo's directory structure
The directory structure of a project is the first place I like to start, as it's essentially a roadmap to the codebase. The documentation has a [complete description of the structure](https://gohugo.io/getting-started/directory-structure/), but below I focus on the most important parts.

```
my-site/
  ├── content/
  ├── layouts/
  ├── assets/
  ├── data/
  ├── static/
  ├── themes/
  └── hugo.toml
```

The first two entries `content/` and `layouts/` roughly correspond to the content and structure of a site's HTML files, respectively. More specifically, the `content/` directory contains files of words consumed by readers, usually written in a lightweight markup language like Markdown, though Hugo supports [other formats](https://gohugo.io/content-management/formats/). The `layouts/` directory, on the other hand, contains HTML templates. When Hugo builds a site, it combines these templates with content to create the final web pages that are ultimately displayed in a browser. This structure decouples content from its presentation, allowing writers to focus on writing rather than fiddling with HTML. Furthermore, the appearance of a site can be easily modified by swapping one set of templates for another.

Next are the "resource directories": `assets/`, `static/`, and `data/`. Although they work a little differently, they are all generally a place to store any additional files that contribute to a site's content, structure, behavior, or presentation. This broad overlap in function results partly from the specialization of each and partly from maintaining backwards compatibility as the Hugo framework has evolved. For example, all files in the `static/` directory are copied to the root directory of the built site. This is still useful for simple cases where utility files like `robots.txt` or a CSS stylesheet only need to be copied without additional manipulations. However, a more modern method is placing resources in `assets/`, which offers greater control for how they are incorporated into the build. Files in `assets/` are only copied into the built site if they are explicitly published via certain commands in an HTML template. Additionally, [asset pipelines](https://gohugo.io/hugo-pipes/introduction/) can manipulate resources and make the processed files available in the build as well. Finally, `data/` is specifically for JSON, TOML, YAML, or XML files. In contrast to resources in the other directories, these files are automatically parsed, and their fields are directly available in HTML templates.

The last elements are the `themes/` directory and the `hugo.toml` file. The former is where external themes, *i.e.* collections of template and other resource files, are installed. It's not necessary for a site developed from scratch, but I'm including it here for any users looking to transition from an external theme to a custom one or vice-versa. The latter is a configuration file for settings that control how Hugo builds a site. I'll cover its contents in greater depth after first taking a closer look at both the `content/` and `layouts/` directories.

## The content directory in-depth
The web is a tangled collection of HTML documents which is impossible to navigate without search engines. Individual sites, though, are smaller corners of that vast network which should be intuitively organized, allowing the user to build a mental model of where to find information. There are several [common structural prototypes](https://webstyleguide.com/wsg3/3-information-architecture/3-site-structure.html), but hierarchies are especially popular and the model that Hugo largely imposes as well. Accordingly, the organization of the `content/` directory largely determines the organization of the rendered site. The ideas are straightforward and similar to how a file system uses folders to organize files, but Hugo has some jargon that can confuse its basic principles. I'll use the following example [adapted from the documentation](https://gohugo.io/content-management/sections/) to illustrate these concepts more concretely.

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
As suggested by its Markdown files, this `content/` directory corresponds to a site that has an about page and pages of content on articles and products. For example, `about.md` would contain the text used for this company's about page. The first major concept for understanding how Hugo creates a site is the relationship between the structure of the `content/` directory and the URLs of the rendered pages. In short, the path of a file in `content/` determines the URL for its corresponding page where each level in the path becomes a segment in the URL. To illustrate this, let's assume our Hugo project is configured to build our site at `www.example.org`. Then `about.md` is mapped to `www.example.org/about` and `content/articles/2023/article-3.md` to `www.example.org/articles/2023/article-3`.[^1]<sup>,</sup>[^2]

[^1]: Both pages actually exist as HTML files, for example the latter as `www.example.org/articles/2023/article-3/index.html`. However, the convention for many servers is to provide the index file located at the requested URL.
[^2]: These examples illustrate the default method Hugo uses to map URLs to pages, but it's possible to change this behavior by configuring the [URL management settings](https://gohugo.io/content-management/urls/).

We'll cover the contents of these Markdown files and how Hugo renders them into HTML in a later section, but for now let's focus on the directories in this hierarchy. It's often convenient to navigate a site exactly like a file system and have pages that correspond to the directories as well. For example, we may want a page at `www.example.org/products/` that contains information about all the products. Hugo supports (and encourages!) this structure and has mechanisms for converting directories into pages. By default Hugo creates a page for any top-level directory in `content/`, so Hugo will make a page for both articles and products. However, for more nested directories we have to explicitly tell Hugo to do this by including an `_index.md` file under that directory. Since the `product-1/` directory has a hierarchical structure with each level containing an `_index.md` file, Hugo will create pages at `www.example.org/products/product-1/`, `www.example.org/products/product-1/benefits/`, and `www.example.org/products/product-1/features/`. In contrast, the `2022/` and `2023/` directories don't have these files, so Hugo won't make pages at `www.example.org/articles/2022/` and `www.example.org/articles/2023`.

In Hugo's jargon, top-level directories or directories with an `_index.md` file are called [sections](https://gohugo.io/content-management/sections/). However, these `_index.md` files are more than just for marking directories as sections. They can also contain content that is displayed in those section pages. For example, `products/product-2/_index.md` could have a description of the product as a whole. Accordingly, it's common for the `content/` directory to contain an `_index.md` file that acts as the site's homepage as shown here.

### Bundles
Interestingly, there's also a similarly named `index.md` file located under the `article-1/` directory. Though it looks like `index.md` is marking `article-1/` as a section (with an associated page), something slightly different is going on here. Sometimes it's convenient to associate additional resources with a page, for example image, video, or script files. (Hugo has extensions to Markdown called shortcodes that allow the easy inclusion of these resources when the HTML files are generated, and templates can access these files as [page resources](https://gohugo.io/content-management/page-resources/) to manipulate them more programmatically.) However, to keep the project structure tidy, it's convenient to group these files together under a directory while still having Hugo treat it as a content file. To do this, we mark `article-1/` as a leaf bundle by including `index.md` which contains the Markdown text for the article itself. Under the URL creation scheme we discussed earlier, this yields an HTML file located at `www.example.com/articles/2022/article-1/`

Incidentally, when directories contain `_index.md` and other resources, this creates branch bundles, which work similarly as leaf bundles.[^3] What's the point, then, of having the two types of bundles that are distinguished by files differing by a single underscore? As their name suggests, leaf bundles are intended to be terminal directories in the project hierarchy, so there [are some minor differences](https://gohugo.io/content-management/page-bundles/#comparison) in how Hugo associates resources with them as opposed to branch bundles. The more important distinction, however, is Hugo treats leaf and branch bundles as having single- and list-type layouts, respectively. We'll cover this in more detail in the section on the `layouts/` directory, but Hugo associates different templates with the two layout types. The motivation for this is that leaf bundles correspond to terminal entries in the site structure and should primarily display **single** pieces of content. In contrast, branch bundles and, more generally, sections link different levels of the hierarchy together and should display **lists** of content. This relationship between single- and list-type pages is illustrated in the following diagram taken from Hugo's [documentation](https://gohugo.io/templates/lists/).

[^3]: Because `_index.md` files mark sections, all branch bundles are also sections. The converse isn't true, however, since not all sections contain `_index.md` or additional resources.

{{< figure src="site-hierarchy.svg" caption="Pages are either <b>single</b> pieces of content or <b>lists</b> of other content." >}}

### Content files
Finally, at the bottom of our hierarchy are content files themselves. Hugo supports a variety of markup formats, but [Markdown](https://commonmark.org/) is the most common. Regardless of format, though, all content can have [front matter](https://gohugo.io/content-management/front-matter/) at the top of the file. This front matter is essentially metadata about the content, preferably including `title` and `date` fields at a minimum. However, Hugo supports a variety of fields out of the box that control how the content is displayed or organized. It's possible to define custom parameters in the front matter as well, though these are [accessed differently](https://gohugo.io/content-management/front-matter/#parameters) than the builtin fields. As far as for the format of this front matter, Hugo supports JSON, TOML, or YAML. I won't go into the differences here as the Hugo documentation has plenty of examples, but they all can convey the same information. The choice between them is really a matter of taste. However, of the three, I lean towards TOML. It uses three plus signs to delimit the front matter and equals signs to assign key-value pairs. The content then follows the front matter as shown below.

```
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
Now that we've covered the basics of the `content/` directory, let's turn to the other pillar of the Hugo framework, the `layouts/` directory. I've mentioned a few times that Hugo uses templates in `layouts/` to convert the content files into HTML files, and the general idea is the correspondence between the two directory structures identifies the template for a content file. Taken to an extreme, it's possible to specify a template for each content file. However, Hugo defines [a series of fallbacks](https://gohugo.io/templates/lookup-order/) that depend on both the structure and front matter to find a matching template. This makes Hugo robust and flexible but also a bit opaque at first since the template used to build a page is rarely explicitly stated. To illustrate this more concretely, below is a possible structure of a `layouts/` directory for the previous `content/` directory example.

```
layouts/
├── _default/
│   └── baseof.html
├── articles/
│   ├── list.html
│   └── single.html
├── products/
│   ├── list.html
│   └── single.html
├── partials/
├── shortcodes/
├── index.html
└── 404.html
```

Beginning with the most intuitive elements, this `layouts/` directory contains two top-level directories `articles/` and `layouts/` that directly correspond to those in the `content/` directory. These in turn both contain two HTML files that serve as templates for different kinds of content. As mentioned before, Hugo categorizes pages as either singles or lists where singles display individual pieces of content and lists display collections of content. In this case, we want all pages created from the `articles/` and `products/` directories in `content/` to use different templates, so they have separate `single.html` and `list.html` files. More specifically, Hugo will use the single templates to create pages for content files or leaf bundles, so `article-1/` templates from `articles/single.html` and `benefit-2.md` from `products/single.html`. In contrast, Hugo will use the list templates to create pages for sections, so `articles/` templates from `articles/list.html` and `features/` from `products/list.html`.[^4] Because these templates might share parts in common, like a site header and footer, `layouts/` also contains a `_default/` subdirectory with a `baseof.html` file that defines a [base template](https://gohugo.io/templates/base/) for the site. Thus, the single and list templates work together with the base template to create the final rendered page.

[^4]: Although the products section contains several subsections, there's no way to specify templates with similarly nested directories in the `layouts/` directory, so all subsections use the template of their root section.

The `layouts/` directory contains two additional subdirectories `partials/` and `shortcodes/` that are empty in this example but included for illustration purposes. Both have similar roles in storing templates for smaller, re-usable elements that appear throughout a website. In other words, they're essentially functions which can be called from other files. However, they differ in where they're used. [Partials](https://gohugo.io/templates/partials/) are used in templates to extend their capabilities or abstract the details of a more complex template component. As a result, they are generally concerned with common structural elements of a site. For example, a `cards.html` partial could create a "card-style" list of content. [Shortcodes](https://gohugo.io/content-management/shortcodes/), on the other hand, are used in content files themselves to extend them with additional templates without cluttering the Markdown files with the actual messy HTML code. Hugo contains several embedded shortcodes for utility operations like creating a figure with a caption or displaying a YouTube video. It's also possible to create custom shortcodes, though, which are stored in the corresponding subdirectory in `layouts/`.

Finally, there are two top-level templates, `404.html` and `index.html`, both with special purposes. The first corresponds to the dreaded 404 error message that is displayed when the requested page is not found by the server. The second is the template for the home page of the site and is used to render the `content/_index.md` file. Though this file is named like other `_index.md` files marking sections, it has a unique template to reflect its special role as the index file for the site as a whole.

### Kinds, types, and layouts, oh my!
While the previous example illustrated the basic structure of a simple `layouts/` directory, the details of how Hugo selects a template depend on three values associated with a page called its `Kind`, `type`, and `layout`. The definitions of these terms are scattered throughout the documentation, so in this section, I want to clarify their meaning and how they interact to specify a template. The first of these page attributes, `Kind`, is one of the following pre-defined categories:[^5]

[^5]: There are also `RSS`, `sitemap`, `robotsTXT`, and `404` page kinds, but these are special templates with purposes outside of displaying content for humans.

- `home`
- `page`
- `section`
- `taxonomy`
- `term`

Most of these have already been informally introduced, with regular content pages confusingly being assigned the `Kind` of `page`. The exceptions are the `taxonomy` and `term` kinds, which are a feature in Hugo for aggregating pages according to some criteria, like the tags in their front matter. Since Hugo defines a [separate lookup order](https://gohugo.io/templates/lookup-order/) for each `Kind`, it is the first determinant of a page's template. It also determines whether the page is considered a single or a list, as pages of `Kind` `page` are singles whereas all others are lists. These distinctions don't matter in the previous example, but in the absence of more specific templates, single and list pages are ultimately derived from global `single.html` and `list.html` templates in `_default/` if they exist.

Next are the `type` and `layout` page attributes. All pages have a `type`, which defaults to the name of the root section if it's not set in the front matter. For example, in the previous example `benefit-1.md` has a `type` of "products." In contrast, the `layout` attribute is only determined by the front matter. Together the three attributes determine a page's template in the lookup table of its `Kind` where the general pattern is the `type` sets the top-level directory of the template in `layouts/` and the `layout` specifies the HTML file. However, the exact rules are complex, so refer to the documentation for examples and a complete listing of the lookup orders.

### Templates
Finally, let's briefly turn to the templates themselves. I won't go over specific examples of templates or in-depth on Hugo's templating language because there are other dedicated resources that do the topic justice. For example, check out the [Hugo documentation](https://gohugo.io/templates/introduction/) for an overview of the syntax and major concepts and this [series of blog posts](https://www.thenewdynamic.com/article/hugo-data/) for more examples, ranging from simple loops to complex data transformations. If I had to summarize the two main ideas that were most helpful to me when parsing templates, though, the first would be distinguishing the parts that are HTML from the parts that are in the templating language. The difference may seem obvious if you're already familiar with HTML, but when first starting templates can look like a nested mess of angle and curly brackets. Fortunately, there's a simple rule: anything in double curly brackets `{{ }}` is template code, and everything else is HTML.

A basic function of the template code is to "silently" execute statements that don't have a return value. For example, the following defines a string which can be referenced later.

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

Though straightforward in principle, this can be difficult to parse in practice since in Hugo many blocks can rebind the context to different objects. A common example is a loop like the following

```html
{{ range slice "foo" "bar" }}
  <p>{{ . }}</p>
{{ end }}
```

where the context is rebound to each element in the slice, *i.e. array, in each iteration of the loop. This is another place where Hugo takes an implicit approach, and while confusing at first, it does cut down on boilerplate code. The best way to understand this is by looking at plenty of examples. For brevity, I'll leave our discussion here, but this [blog post](https://www.regisphilibert.com/blog/2018/02/hugo-the-scope-the-context-and-the-dot/) is a good place to start.

## The config file in-depth
The final element introduced in the directory structure overview that we haven't touched on yet is the config file, `hugo.toml`.[^6] This name is a more recent convention, so other projects may have a `config.toml` or a variant in one of the other supported formats, like JSON or YAML. Unsurprisingly, this file contains configuration settings for building and displaying a site. Its structure is hierarchical where the top-level contains the most global settings as well as a set of keys that divide more specific ones into categories. The complete root [settings](https://gohugo.io/getting-started/configuration/#all-configuration-settings) and [keys](https://gohugo.io/getting-started/configuration/#configuration-directory) are extensive, but I'll briefly review an example to give a sense of each.

[^6]: Though in this simple example, the configuration settings are in a single file, more complex projects may split them into multiple files in a [configuration directory](https://gohugo.io/getting-started/configuration/#configuration-directory).

```toml
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'ABC Widgets, Inc.'

[params]
  subtitle = 'The Best Widgets on Earth'
  [params.contact]
    email = 'info@example.org'
    phone = '+1 202-555-1212'

[menus]
  [[menu.main]]
    name = "Articles"
    url = "/articles/"
    weight = 10

  [[menu.main]]
    name = "Products"
    url = "/products/"
    weight = 20
```

This configuration file contains three root settings and two root keys with additional settings under each. The root settings define generic site-wide parameters, in this case the base URL, language, and title. Hugo allows using only its pre-defined root settings, so additional settings that are specific to a site are stored under the `params` key. Finally, the `menu` key contains entries that are used to construct navigation menus.

Even though the config file contains the configuration data, none of it will appear in the site unless it's used in a template. These can be accessed with the global `site` function or as a property of the current context `.Site`. Confusingly, the built-in configuration settings are accessed via methods written in camel case, so the `title` parameter is found at `site.Title` or `.Site.Title`. These small naming differences abound in Hugo, so check the [documentation](https://gohugo.io/methods/site/) of the `Site` object if you encounter any issues. However, this convention does not apply to any custom parameters defined under the `params` root key, so the `params.subtitle` setting is found at `site.Params.subtitle`. Easy, right?

## Conclusion and additional tips
Having covered the main pieces that make up a minimal Hugo project, this brings us to the end of this post. However, Hugo is a powerful framework for web development, so we've only scratched the surface of what it can do. Hopefully, you'll now be better equipped to wade into the documentation yourself to begin exploring Hugo on your own. Though in this post I focused on high-level concepts, I highly recommend this [post](https://zwbetz.com/make-a-hugo-blog-from-scratch/) from Zachary Betz for a detailed walkthrough of building a site from scratch with Hugo. While our posts cover similar topics, they do it from different perspectives and complement each other well.
  
My final tip for embarking on a web development journey is to make ample use of Hugo's speed to view changes on the fly. Use `hugo serve` to host a site locally and open the returned URL in the browser. Hugo will automatically re-build the site when it detects changes; however, it might be necessary to force the browser to request the site rather than load it from the cache. In Chrome, this is done by opening the page's context menu (typically with a right click), selecting the "Inspect" option, opening the Network tab in the resulting menu, and checking the "Disable cache" box.[^7] A browser's developer menu also provides a wealth of other information, including inspections of the raw HTML for a page as well as tools for interacting with and modifying page elements. They're essentially like debuggers for web development, so take advantage of them and save yourself the frustration of the guess and check approach.

[^7]: Hugo also doesn't always automatically rebuild assets like images, however, so it's sometimes necessary to stop and re-start the `hugo serve` process.

It's also possible to build a site and inspect its outputs directly with the `hugo` command. I sometimes find it's easier to look at the files themselves to understand how exactly Hugo arranges the various parts of a project in the final site. That said, between the previous discussion, these tips, and the other resources linked throughout, you're in great shape to make your own site. Good luck!
