import { createBarChart } from './bar_chart.js';

export function createPieChart(data) {

    Clear();

    const { width, height, radius } = createPieChartDimensions();

    const color = createColorScale(data);

    const pie = createPieGenerator();

    const arc = createArcGenerator(radius);

    const { svg, tooltip } = createSvgAndTooltip(width, height);

    const pieSlices = createPieSlices(svg, data, pie, arc, color);

    FadeInText("h1", "WW2 Casualties", () => FadeInText("h2", "Can you guess a country by the color?"));
    FadeIn(pieSlices);

    handleTouchEvents(pieSlices, arc, tooltip, 500, createBarChart, data, color, radius, pieSlices);
}

//Helper Functions

function Clear() {
    d3.select("#center-graph svg").remove();
    d3.select("#tooltip").remove();
    d3.select("h1").selectAll("tspan").remove();
    d3.select("h2").selectAll("tspan").remove();
}

function createPieChartDimensions() {
    let width = document.getElementById('center-graph').clientWidth;
    let height = document.getElementById('center-graph').clientHeight;
    let radius = 0.8 * Math.min(width, height) / 2;

    return { width, height, radius };
}

function createColorScale(data) {
    let color = d3.scaleOrdinal()
        .domain(data.map(d => d.Total_Casualties))
        .range(d3.schemeCategory10);

    return color;
}

function createPieGenerator() {
    let pie = d3.pie()
        .value(d => d.Total_Casualties)
        .sort(null);

    return pie;
}

function createArcGenerator(radius) {
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    return arc;
}

function createSvgAndTooltip(width, height) {
    let svg = d3.select("#center-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    let tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip");

    tooltip.append("div")
        .attr("id", "country")
        .style("font-weight", "bold");

    tooltip.append("div")
        .attr("id", "total-casualties");

    tooltip.append("div")
        .attr("id", "hint");

    return { svg, tooltip };
}

function createPieSlices(svg, data, pie, arc, color) {
    let g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")
        .style("opacity", 0); // Set initial opacity to 0

    return g;
}

function FadeInText(selector, text, onEnd = null) {

    const textDuration = 35; // duration for each letter's transition
    let textSelection = d3.select(selector);
    let lastIndex = text.length - 1;
    textSelection.text("");

    text.split("").forEach((letter, index) => {
        textSelection.append("tspan")
            .text(letter)
            .style("opacity", 0)
            .transition()
            .delay(index * textDuration)
            .duration(textDuration)
            .style("opacity", 1)
            .on("end", function () {
                if (index === lastIndex && onEnd) {
                    onEnd();
                }
            });
    });
}

function FadeOutText(selector, onEnd = null) {
    const textDuration = 35; // duration for each letter's transition
    let textSelection = d3.select(selector);
    let tspans = textSelection.selectAll("tspan").nodes().reverse();
  
    tspans.forEach((tspan, index) => {
      d3.select(tspan)
        .transition()
        .delay(index * textDuration)
        .duration(textDuration)
        .style("opacity", 0)
        .on("end", function () {
          if (index === tspans.length - 1 && onEnd) {
            onEnd();
          }
        });
    });
  }

  function FadeIn(pieSlices, onEnd = null) {
    let sliceDuration = 200; // duration for each slice's transition

    pieSlices.each(function (d, index) {
        d3.select(this)
            .transition()
            .delay(index * sliceDuration)
            .duration(sliceDuration)
            .style("opacity", 1)
            .on("end", function () {
                if (index === pieSlices.size() - 1 && onEnd) {
                    onEnd();
                }
            });
    });
}


function FadeOut(pieSlices, onEnd = null) {
    const sliceDuration = 200; // duration for each slice's transition

    pieSlices.each(function (d, index) {
        d3.select(this)
            .transition()
            .delay(index * sliceDuration)
            .duration(sliceDuration)
            .style("opacity", 0)
            .on("end", function () {
                if (index === pieSlices.size() - 1 && onEnd) {
                    onEnd();
                }
            });
    });
}

function handleTouchEvents(g, arc, tooltip, TOUCH_THRESHOLD, createBarChart, data, color, radius, pieSlices) {

    let touchStartTime = 0;
    let touchEndTime = 0;
    g.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.Total_Casualties))
        .on("mouseenter touchstart", function (event, d) {

            touchStartTime = new Date().getTime();
            tooltip.select("#country").text(d.data.Country);
            tooltip.select("#total-casualties").text(`Total casualties: ${d.data.Total_Casualties.toLocaleString()}`);
            tooltip.select("#hint").text(`Want to see more? Press HARD!`);
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this)
                .style("stroke", "goldenrod")
                .style("stroke-width", "4px")
                .style("filter", "brightness(125%)")
                .transition()
                .duration(200)
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius * 1.1)
                );

        })
        .on("mousemove touchmove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

        })
        .on("mouseleave touchend", function () {
            tooltip.style("left", "9999px");
            d3.select(this)
                .style("stroke", "none")
                .style("filter", "brightness(100%)")
                .transition()
                .duration(200)
                .attr("d", arc);
        })
        .on("click touchend", function (event, d) {
            event.stopPropagation(); // Prevent triggering other touchend listeners
            touchEndTime = new Date().getTime();
            let touchDuration = touchEndTime - touchStartTime;
            if (touchDuration > TOUCH_THRESHOLD) {
                FadeOutText("h2", () => {
                    FadeOutText("h1")
                });
                FadeOut(pieSlices, () => {
                    createBarChart(d.data.Country, data, color(d.data.Total_Casualties));
                });
            }
            touchStartTime = new Date().getTime();

        });

    // Close tooltip on touchend event outside the pie chart
    d3.select("body")
        .on("touchend", function (event) {
            if (!event.target.closest(".arc")) {
                tooltip.style("left", "9999px");

                // Remove highlight and volume effect from pie slice
                g.selectAll("path")
                    .style("stroke", "none")
                    .style("filter", "brightness(100%)")
                    .transition()
                    .duration(200)
                    .attr("d", arc);
            }
        });
}