+++
author = "Marc Singleton"
title = "Using D3 in Markdown Posts (draft)"
date = "2024-03-18"
tags = ["d3", "visualization", "interactive"]
display_toc = true
+++

{{< d3_library >}}

## Introduction: When PNGs aren't enough
I've created a lot of data visualizations in my life, but up to this point, most have them have been very static. A lot of this has to do with my training in a particularly *academic* flavor of data science. The product of research is always knowledge, but depending on the industry and use case, that knowledge can presented in a variety of different forms, for example as presentations, reports, dashboards, or even curated data sets. In academia, the primary measure of research output is papers, *i.e.*, relatively neat summaries of a series of experiments or analyses that combine a visual presentation of the data with textual narration. (I'm not going to wade into the broader philosophical issues on whether this is a useful measure of impact, but it suffices to say that [not everyone agrees.](https://www.theguardian.com/books/2022/apr/11/the-big-idea-should-we-get-rid-of-the-scientific-paper)) Historically, these were distributed as articles in physical journals, but in my experience most people use PDFs nowadays. On one hand, this approach has its benefits, as PDFs are a single objects that are easily stored and viewed. The format has also been around for over 30 years and has become a sort of lingua franca of digital documents, so it doesn't seem likely to go away any time soon. On the other hand, it's also surprising that in an age of digital displays and 3D graphics, we've settled on a medium for data communication that is trying its hardest to simulate a simple piece of paper.

Today's data is often highly multivariate and organized in hierarchies or networks, so trying to understand the complex relationships between sets of variables using simple plots of X vs Y is at best inefficient and at worst missing the forest for the trees. I've also encountered these pitfalls of trying to operate in the static paradigm, and I'm glad no one can tally the number of hours I've spent clumsily toggling between various plots trying to get a handle on a data set. A few years ago, though, I came across [Distill](https://distill.pub/about/) whose goal was to create an alternate model of scientific publishing that fully embraced the interactivity of modern web pages. Unfortunately, it's now on indefinite hiatus, but its articles still set a high-water mark for scientific communication and have inspired me to incorporate interactive visualizations in my own work.

## Libraries and platform for interactive visualizations
There's no shortage of libraries and platforms for creating interactive visualizations.

Brief discription of options
- d3
- plotly (built over d3)
- matplotlib
- Tableau

Decided to start with D3 for this project as it offers the most control
Most of the work involved integrating D3 into development workflow rather than working with d3 library directly, so steps will likely be similar for plotly.js

## Inserting D3 plots into Markdown with Hugo
This website is built with Hugo, so steps necessarily reflect some Hugo and Go specifics for stitching together the pieces, but I'll point these out as we go.

### Importing the D3 Library
- Modern browsers can run Javascript out of the box, but they don't automatically load the D3 library
- There are mechanisms for loading the library into your page roughly like Python's import system
- The simplest of these is to include a script tag whose src is the URL to the D3 library
- If you inspect the page source (right click on Chrome and click "Inspect" on the resulting context menu), you should see a line that looks something like 

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

- A Hugo-specific is that it builds HTML pages from Markdown files
- It does offer a mechanism for inserting raw HTML, but I instead wrote a "shortcode" which is essentially a function that will generate the script tags when Hugo builds the page
- For something so simple, using a shortcode is mostly for aesthetic reasons, but later we'll see where these shortcodes are useful for customizing the HTML depending on the conditions

### Inserting a simple D3 plot
- [Example](https://observablehq.com/@d3/bar-chart/2) is a bar graph of the relative frequencies of letters in the English language taken from D3 example library
- Observable is a notebook-style frontend for D3, and its syntax differs slightly from the same plot would be generated in an HTML page
- Luckily it's straightforward to adapt it
- The Javascript code is available [here](https://github.com/marcsingleton/marcsingleton.github.io/blob/main/content/posts/d3-markdown/bars.js)
- Highlights are
  - Move code and data into body of `draw` function
  - Make the div element that holds the graph an argument
- Following HTML inserts into page (in practice done with Hugo shortcode to dynamically generate the correct paths)

```html
<div id="bars_div"></div>
<script type="module">
    import { draw } from "\/posts\/using-d3-in-markdown-posts\/bars.js"
    draw("#bars_div")
</script>
```

- Script type module is necessary for the import statements to be allowed
- Modules also have their own scope, which allows us to use the same name draw for different drawing functions without collisions 

{{< d3_plot script_path="bars.js" div_id="bars_div" >}}

### A more complex example
- That's a nice starting point, but it's something I could have put together in a few lines of Python using matplotlib.
- This next example is also taken from the [D3 gallery](https://observablehq.com/@d3/force-directed-graph/2) and shows the network of character co-occurence in *Les Misérables*
- Converting the code from the D3 gallery follows similar steps as before
- Largest difference is data relatively large (over 1000 lines), so is stored in separate file
- Data is also passed as second function argument
- Loading this data into the runtime requires a few extra steps

```html
<div id="network_div"></div>
<script type="module">
    import { draw } from "\/posts\/using-d3-in-markdown-posts\/network.js"
    fetch("\/posts\/using-d3-in-markdown-posts\/network.json")
        .then(response => response.json())
        .then(data => draw(data, "#network_div"))
</script>
```

- Javascript has built-in functionality for asynchronous execution of its code (you don't want your entire page to stall while a resource is loading from a server)
- Must use fetch then idiom to ensure data is loaded before draw function is called
- Again in practice accomplished with a Hugo shortcode to correctly generate the correct paths to the script and data

{{< d3_plot script_path="network.js" data_path="network.json" div_id="network_div" >}}

Finally! An interactive visualization! You can grab the nodes and move them around by clicking and dragging. 

## Conclusion
