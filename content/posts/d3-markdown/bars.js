export function draw(container){
// Declare data
const data = [
    {"letter": "A", "frequency": 0.08167},
    {"letter": "B", "frequency": 0.01492},
    {"letter": "C", "frequency": 0.02782},
    {"letter": "D", "frequency": 0.04253},
    {"letter": "E", "frequency": 0.12702},
    {"letter": "F", "frequency": 0.02288},
    {"letter": "G", "frequency": 0.02015},
    {"letter": "H", "frequency": 0.06094},
    {"letter": "I", "frequency": 0.06966},
    {"letter": "J", "frequency": 0.00153},
    {"letter": "K", "frequency": 0.00772},
    {"letter": "L", "frequency": 0.04025},
    {"letter": "M", "frequency": 0.02406},
    {"letter": "N", "frequency": 0.06749},
    {"letter": "O", "frequency": 0.07507},
    {"letter": "P", "frequency": 0.01929},
    {"letter": "Q", "frequency": 0.00095},
    {"letter": "R", "frequency": 0.05987},
    {"letter": "S", "frequency": 0.06327},
    {"letter": "T", "frequency": 0.09056},
    {"letter": "U", "frequency": 0.02758},
    {"letter": "V", "frequency": 0.00978},
    {"letter": "W", "frequency": 0.02360},
    {"letter": "X", "frequency": 0.00150},
    {"letter": "Y", "frequency": 0.01974},
    {"letter": "Z", "frequency": 0.00074}
]

// Declare the chart dimensions and margins.
const width = 500;
const height = 250;
const marginTop = 50;
const marginRight = 0;
const marginBottom = 50;
const marginLeft = 50;

// Declare the x (horizontal position) scale.
const x = d3.scaleBand()
    .domain(d3.groupSort(data, ([d]) => -d.frequency, (d) => d.letter)) // descending frequency
    .range([marginLeft, width - marginRight])
    .paddingInner(0.4)
    .paddingOuter(0.4);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.frequency)])
    .range([height - marginBottom, marginTop]);

// Create the SVG container.
const svg = d3.select(container)
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

// Add a rect for each bar.
svg.append("g")
    .attr("fill", "#4e79a7")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.letter))
    .attr("y", (d) => y(d.frequency))
    .attr("height", (d) => y(0) - y(d.frequency))
    .attr("width", x.bandwidth());

// Add the x-axis and label.
svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.append("text")
        .attr("x", (marginLeft + width - marginRight) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .text("Letter"));

// Add the y-axis and label.
svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
    .call(g => g.append("text")
        .attr("x", -(marginTop + height - marginBottom) / 2)
        .attr("y", -25)
        .attr("transform", `rotate(-90)`)
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .text("Frequency (%)"));
}
