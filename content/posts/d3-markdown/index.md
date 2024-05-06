+++
author = "Marc Singleton"
title = "Using D3 in Markdown Posts"
date = "2024-03-21"
summary = "A quick tutorial on inserting D3 plots into Markdown files with Hugo."
tags = ["d3", "hugo", "markdown", "html", "javascript", "visualization", "interactive"]
showTableOfContents = true
+++

{{< d3_library >}}

## Introduction: When PNGs aren't enough
I've created a lot of data visualizations in my life, but up to this point, most have them have been very static. A lot of this is from my training in a particularly *academic* flavor of data science. The product of research is always knowledge, but depending on the industry and use case, that knowledge can be presented in a variety of forms, for example as presentations, reports, dashboards, or even curated data sets. In academia, the primary format of research output is the paper, *i.e.*, a (relatively) neat summary of a series of experiments or analyses that combine a visual presentation of the data with textual narration. (I'm not going to wade into the broader philosophical issues on whether this is a useful measure of impact, but it suffices to say that [not everyone agrees.](https://www.theguardian.com/books/2022/apr/11/the-big-idea-should-we-get-rid-of-the-scientific-paper)) Historically, papers were distributed as articles in physical journals, but in my experience most people use PDFs nowadays. On one hand, this approach has its benefits, as PDFs are a single objects that are easily stored and viewed. The format has also been around for over 30 years and has become a sort of lingua franca of digital documents, so it doesn't seem likely to go away any time soon. On the other hand, it's shocking that in an age of digital displays and 3D graphics, we've settled on a medium for data communication that is trying its hardest to simulate a simple piece of paper.

Today's data is often highly multivariate and organized in hierarchies or networks, so trying to understand the complex relationships between sets of variables using fixed plots of X vs Y is at best inefficient and at worst missing the forest for the trees. I've regularly encountered the pitfalls of trying to operate in this static paradigm, and I'm glad no one can tally the number of hours I've spent clumsily toggling between various plots trying to get a handle on a data set. A few years ago, though, I came across [Distill](https://distill.pub/about/) whose goal was to create an alternate model of scientific publishing that fully embraced the interactivity of modern web pages. Unfortunately, it's now on indefinite hiatus, but its articles still set a high-water mark for scientific communication and have inspired me to incorporate interactive visualizations in my own work.

## Libraries and platforms for interactive visualizations
There's no shortage of libraries and platforms for creating interactive visualizations. I'm no expert in this area, but here's a small selection of the available options:

- D3
- Observable Plot
- Plotly
- Dash
- Tableau

D3 is the Matplotlib of data visualization on the web. Like Matplotlib, it offers a powerful library of graphical primitives, like shapes, axes, layouts, color utilities, and much more. Unlike Matplotlib, it has no pre-made chart types, so everything, including even simple bar and scatter plots, is made from scratch and can require dozens of lines of code. As a result, D3 shines when creating visualizations that require the highest levels of customization and control. For exploratory data analysis, other libraries like Observable Plot and Plotly are better fits. Observable Plot is from the same team that develops D3 and uses it as a foundation for a more concise and intuitive interface. Plotly fills a similar niche as Observable Plot and supports a variety of chart types out of the box. Unlike D3 and Observable Plot, which are exclusive to JavaScript, Plotly has bindings for several languages including JavaScript, Python, R, and Julia. There are also solutions specifically designed for creating dashboards, like Dash and Tableau, where the former uses a low-code Python interface and the latter a purely graphical one. Finally, I should give an honorable mention to Matplotlib, which does support, if at a rudimentary level, widgets and integration into some graphical user interfaces.

## Inserting D3 plots into Markdown with Hugo
For this exercise, I decided to use D3, as it offers the most control. Most of the work, though, involved integrating JavaScript code into my site generator, so the steps will likely be similar for other libraries. I use Hugo to build this site, so the steps necessarily reflect some Hugo and Go specifics for stitching together the pieces, but I'll point these out as we go.

### Importing the D3 Library
Modern browsers can run JavaScript out of the box, but they don't automatically load the D3 library. Fortunately, there are a few mechanisms for making it available to the JavaScript code running on a specific web page. The simplest of these is to include a script tag whose `src` is the URL to the D3 library. Inspecting this page's source in Chrome by right-clicking and selecting "Inspect" on the resulting context menu should show a line that looks something like:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

Static site generators typically build HTML files using content stored in plain-text formats like Markdown. Hugo does offer a mechanism for inserting raw HTML, but I instead wrote a "shortcode," which is essentially a function that generates the script tags when Hugo builds the page. I'll omit the details here for clarity, but for anyone who's interested the source is available the GitHub repo for this [site](https://github.com/marcsingleton/marcsingleton.github.io). Anyway, for a simple script tag, using a shortcode is mostly for aesthetic reasons, but in general shortcodes are incredibly useful for generating more complex and context-dependent HTML.

### Inserting a simple D3 plot
Now for the first [example](https://observablehq.com/@d3/bar-chart/2), which is a bar graph of the relative frequencies of letters in the English language taken from the D3 example gallery. Observable is a notebook-style frontend for D3, and its syntax differs slightly from the JavaScript needed to generate the same plot in an HTML page. Fortunately, the changes are minor. The final code is available [here](https://github.com/marcsingleton/marcsingletoxn.github.io/blob/main/content/posts/d3-markdown/bars.js), but the highlights are:
 
  - Moving code and data into the body of an exported `draw` function
  - Making the `id` attribute of the \<div\> element which holds the plot an argument to `draw`

For those new to HTML, \<div\> elements are generic containers. They're frequently used to group similar pieces of content and apply consistent styles to them.

The following HTML inserts the plot in the page, which in practice is done with a Hugo shortcode that dynamically generates the correct paths.

```html
<div id="bars_plot"></div>
<script type="module">
    import { draw } from "\/posts\/using-d3-in-markdown-posts\/bars.js"
    draw("#bars_plot")
</script>
```

Setting the `type` attribute to `"module"` is necessary for this code to work correctly. JavaScript code marked as modules are executed [a little differently](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#other_differences_between_modules_and_standard_scripts) than standard scripts. The key details, though, are modules allow import statements and they also have their own scope, which permits using the same name `draw` for different drawing functions without collisions. This latter property is a bit of a Hugo- and me-specific requirement, as it's needed for displaying multiple plots in the same page with my custom shortcode. Anyway, the code will produce the following plot.

{{< d3_plot script_path="bars.js" div_id="bars_plot" >}}

### A more complex example
That's a nice starting point, but it's also something I could have put together in a few lines of Python using Matplotlib. This next example shows much more of D3's ability to create interactive visualizations, though it's really just the tip of the iceberg. It's taken from the [D3 gallery](https://observablehq.com/@d3/force-directed-graph/2) as well and shows the network of character co-occurrences in *Les Misérables*. Adapting the code for use in a JavaScript runtime follows similar steps as before. The largest difference is the data that encodes the network structure is relatively large, spanning over 1000 lines, so I stored it in a separate JSON file. As a result, the data is loaded at runtime and passed as the second argument to the `draw` function, which requires a few extra steps shown below.

```html
<div id="network_plot"></div>
<script type="module">
    import { draw } from "\/posts\/using-d3-in-markdown-posts\/network.js"
    fetch("\/posts\/using-d3-in-markdown-posts\/network.json")
        .then(response => response.json())
        .then(data => draw(data, "#network_plot"))
</script>
```

The Fetch API is used for accessing resources over the network. Even though the data is stored on this web site, it's not directly saved in the page itself, so the browser needs to "fetch" it to make it available for the JavaScript code. Fetch is an asynchronous method, which is useful for ensuring code execution doesn't grind to a halt while a resource is loading from a server. This example, however, requires the data is fully loaded before passing it to the `draw` function, which is accomplished by chaining the return value to `then` method calls. Again, this is done in practice with a Hugo shortcode which correctly generates the correct paths to the script and data.

{{< d3_plot script_path="network.js" data_path="network.json" div_id="network_plot" >}}

Finally, an interactive visualization! You can grab the nodes and move them around by clicking and dragging. 

## Conclusion
This brings me to the end of this post, which has hopefully demonstrated that integrating D3 plots into Markdown documents with Hugo isn't too complicated. The hardest part was actually writing the shortcodes to generate the correct paths when Hugo builds the HTML files. I've deliberately omitted the details for clarity, but for anyone who's interested in diving deeper, the source code for these shortcodes is available [here](https://github.com/marcsingleton/marcsingleton.github.io/tree/main/layouts/shortcodes).
