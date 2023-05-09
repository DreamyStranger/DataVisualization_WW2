import { createPieChart } from './pie_chart.js';

export function createBarChart(country, data, color) {

    Clear();

    // Replace spaces with underscores and load the appropriate JSON file
    const fileName = country.replace(/ /g, '_') + '.json';
    d3.json(fileName).then(newData => {

        // Define dimensions for the chart
        const { containerWidth, containerHeight, width, height, innerWidth, innerHeight } = SetDimensions();

        // Set up scales for the chart
        const x = d3.scaleBand()
            .range([0, innerWidth])
            .padding(0.1)
            .domain(newData.map((d, i) => i)); // Use index for the x-axis domain
        const y = d3.scaleLinear()
            .range([innerHeight, 0])
            .domain([0, d3.max(newData, d => d.Total_Casualties)]);

        const svg = d3.select("#center-graph")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // Add viewBox attribute
            .append("g")
            .attr("transform", `translate(${(containerWidth - width) / 2}, ${(containerHeight - height) / 2})`);

        // Add rectangle elements for each data point
        const bars = AddBars(svg, newData, x, y, color);

        //ToolTip
        const tooltip = createTooltip(width, height);

        // Add axes to the bar chart
        const xAxis = d3.axisBottom(x).tickFormat(''); // Remove tick labels
        const yAxis = d3.axisLeft(y);

        AddXAxis(svg, innerHeight, xAxis);
        AddYAxis(svg, yAxis);

        FadeInText("h1", `WW2 Casualties - ${country}`, () => {
            FadeInText("h2", `Can you guess an event?`)
        })

        FadeIn(bars, y, innerHeight);
        handleTouchEvents(bars, tooltip, 300, data, innerHeight);

    });
}

// HelperFunctions 

function Clear() {
    d3.select("#center-graph svg").remove();
    d3.select("#tooltip").remove();
    d3.select("h1").selectAll("tspan").remove();
    d3.select("h2").selectAll("tspan").remove();
}

function SetDimensions() {
    let containerWidth = document.getElementById('center-graph').clientWidth - 20; // Subtract padding
    let containerHeight = document.getElementById('center-graph').clientHeight - 20; // Subtract padding
    let width = 0.6 * containerWidth;
    let height = 0.6 * containerHeight;
    let innerWidth = width;
    let innerHeight = height;
    return { containerWidth, containerHeight, width, height, innerWidth, innerHeight };
}

function AddXAxis(svg, innerHeight, xAxis) {
    svg.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);
}

function AddYAxis(svg, yAxis) {
    svg.append("g")
        .call(yAxis);
}

function AddBackButton(svg) {
    const backButton = svg.append("text")
        .attr("x", 400)
        .attr("y", 400)
        .attr("class", "back-button")
        .text("Back to Pie Chart")
        .style("fill", "black")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .style("cursor", "pointer");

    return backButton;
}

function AddBars(svg, newData, x, y, color) {
    // Create a stack generator for the data
    const stack = d3.stack()
        .keys(["Military_Casualties", "Civilian_Casualties"])
    const stackedData = stack(newData);

    // Add a group for each event
    const groups = svg.selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", (d, i) => i === 1 ? d3.rgb(color).brighter(1) : color);

    // Add a rectangle for each value in the stack
    const bars = groups.selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

    return bars;
}




function RemoveBars(bars) {
    bars.transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", d => innerHeight)
        .style("opacity", 0)
        .remove();
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

function FadeIn(bars, y, innerHeight, callback = null) {
    // Calculate the total height of each bar using the difference between the top and bottom y-values
    bars.attr("height", d => 0).attr("y", innerHeight);

    // Add a transition effect to make the bars grow in height gradually
    bars.transition()
        .duration(2300)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]) || 1) // add a minimum height of 1 to prevent negative height
        .on("end", callback);
}

//Transition Out
function FadeOut(bars, innerHeight, callback = null) {
    bars.transition()
        .duration(2300)
        .ease(d3.easeCubicInOut)
        .attr("height", 0)
        .attr("y", d => innerHeight)
        .on("end", callback);
}

function createTooltip(width, height) {

    let tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip");

    tooltip.append("div")
        .attr("id", "event")
        .style("font-weight", "bold");

    tooltip.append("div")
        .attr("id", "total-casualties");

    tooltip.append("div")
        .attr("id", "civilian_casualties");

    tooltip.append("div")
        .attr("id", "military_casualties");

    tooltip.append("div")
        .attr("id", "hint");

    return tooltip;
}

function handleTouchEvents(bars, tooltip, TOUCH_THRESHOLD, data, innerHeight) {
    // Define variables to track touch start and end times
    let touchStartTime = 0;
    let touchEndTime = 0;

    bars
        .on("mouseenter touchstart", function (event, d) {
            touchStartTime = new Date().getTime();

            // Get the stack index of the hovered/touched bar
            const stackIndex = d3.select(this.parentNode).datum().index;

            // Update the tooltip with the event name and the respective casualty count
            tooltip.select("#event").text(d.data.Event);

            if (stackIndex === 1) {
                tooltip.select("#civilian_casualties").text(`Civilian casualties: ${d.data.Civilian_Casualties.toLocaleString()}`);
                tooltip.select("#military_casualties").text("");
            }
            else if (stackIndex == 0) {
                tooltip.select("#military_casualties").text(`Military casualties: ${d.data.Military_Casualties.toLocaleString()}`);
                tooltip.select("#civilian_casualties").text("");
            }

            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            tooltip.select("#hint").text(`Want to go back? Press me HARD!`);
            d3.select(this)
                .style("stroke", "goldenrod")
                .style("stroke-width", "4px")
                .style("filter", "brightness(105%)");

        })
        .on("mousemove touchmove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

        })
        .on("mouseleave touchend", function () {
            tooltip.style("left", "9999px");

            d3.select(this)
                .style("stroke", "none")
                .style("filter", "brightness(100%)");
        })
        .on("click touchend", function (event, d) {
            event.stopPropagation(); // Prevent triggering other touchend listeners

            // Get the duration of the touch event
            touchEndTime = new Date().getTime();
            const touchDuration = touchEndTime - touchStartTime;

            if (touchDuration > TOUCH_THRESHOLD) {
                // Fade out the chart and transition back to the pie chart
                FadeOutText("h2", () => {
                    FadeOutText("h1")
                });

                FadeOut(bars, innerHeight, () => {
                    createPieChart(data);
                });
            }

            touchStartTime = new Date().getTime();
        });

    // Close tooltip on touchend event outside the bars
    d3.select("body")
        .on("touchend", function (event) {
            if (!event.target.closest(".tooltip")) {
                tooltip.style("left", "9999px");

                // Remove highlight effect from bars
                bars
                    .style("stroke", "none")
                    .style("filter", "brightness(100%)");
            }
        });
}