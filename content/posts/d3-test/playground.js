function makeChange(attr, label) {
    function change() {
        circle.attr(attr, this.value)
        label.text(this.value)
    }
    return change
}

function makeSlider(id, description, min, max, value, attr) {
    var sliderControls = d3.select("#slider-controls")
    var sliderLabel = sliderControls.append("div").attr("id", id + "-label")
    var labelDescription = sliderLabel.append("span").text(description)
    var labelValue = sliderLabel.append("span").text(value)
    var slider = sliderControls.append("input")
        .attr("id", id + "-slider")
        .attr("type", "range")
        .attr("min", min)
        .attr("max", max)
        .attr("value", value)
        .on("change", makeChange(attr, labelValue))
    return slider
}

var initials = {x: 100, y: 70, r: 50}
var width = 400
var height = 200

var container = d3.select("#canvas")
var svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
var circle = svg.append("circle")
    .attr("cx", initials.x)
    .attr("cy", initials.y)
    .attr("r", initials.r)
    .attr("stroke", "black")

makeSlider("x", "x position: ", 0, width, initials.x, "cx")
makeSlider("y", "y position: ", 0, height, initials.y, "cy")
makeSlider("r", "radius: ", 0, 100, initials.r, "r")
