export function draw(data, container) {
// Specify the dimensions of the chart.
const width = 350;
const height = 350;

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeTableau10);

// The force simulation mutates links and nodes, so create a copy
// so that re-evaluating this cell produces the same result.
const links = data.links.map(d => ({...d}));
const nodes = data.nodes.map(d => ({...d}));

// Create a simulation with several forces.
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX())
    .force("y", d3.forceY());

// Create the SVG container.
const svg = d3.select(container)
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

// Add a line for each link, and a circle for each node.
const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
.selectAll("line")
.data(links)
.join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

const node = svg.append("g")
.selectAll("circle")
.data(nodes)
.join("circle")
    .attr("r", 5)
    .attr("fill", d => color(d.group));

node.append("title")
    .text(d => d.id);

// Add a drag behavior.
/*
# NOTES
- Effectively binds dragging behavior to each element in a selection
- This is an idiomatic construct of D3, so don't take it too literally
- call on a selection accepts a function and applies that function to the selection as its first argument
- drag produces a function that on being called binds event listeners to each element in the selection
- Internally it uses the on method of the selection to do this binding, similar to how it would be done for other events
- Dragging is a complicated behavior involving clicks and moves, so this idiom simplifies the DOM events into a convenient default behavior
*/
node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

// Set the position attributes of links and nodes each time the simulation ticks.
/*
# NOTES
- The simulation automatically runs on the data structure passed to it, updating the records' positions
- This command links those updates that run on each "tick" to the positions of the links and nodes on the screen
*/
simulation.on("tick", () => {
link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
});

/*
# NOTES
- Drag events are different from DOM events since they're explicitly a D3 concept
- Subjects are typically the datum joined to that element (not the element itself)
- These events are then modifying the data records and not the links and nodes on the screen
- fx and fy are special values in these structures that the simulation uses to "fix" the positions
- If they're null, the dynamic positions (x, y) are free to vary; otherwise they're fixed to (fx, fy)
*/
// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}
}
