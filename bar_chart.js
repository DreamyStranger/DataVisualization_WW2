import { createPieChart } from './pie_chart.js';

export function createBarChart(country, data, color) {

    // Update the title and subtitle
    Initialize(country);

    // Get data for the selected country
    const selectedCountry = data.filter(d => d.Country === country)[0];
    const dataForCountry = [{ type: "Military", value: selectedCountry.Military_Casualties }, { type: "Civilian", value: selectedCountry.Civilian_Casualties }];

    // Define dimensions for the chart
    const { containerWidth, containerHeight, width, height, innerWidth, innerHeight } = SetDimensions();

    // Set up scales for the chart
    const x = d3.scaleBand()
        .range([0, innerWidth])
        .padding(0.1)
        .domain(dataForCountry.map(d => d.type));
    const y = d3.scaleLinear()
        .range([innerHeight, 0])
        .domain([0, d3.max(dataForCountry, d => d.value)]);

    const svg = d3.select("#center-graph")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // Add viewBox attribute
        .append("g")
        .attr("transform", `translate(${(containerWidth - width) / 2}, ${(containerHeight - height) / 2})`);

    // Add rectangle elements for each data point
    const bars = AddBars(svg, dataForCountry, x, y, color);

    // Add axes to the bar chart
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    AddXAxis(svg, innerHeight, xAxis);
    AddYAxis(svg, yAxis);

    FadeInText("h1", `WW2 Casualties - ${country}`, () => {
        FadeInText("h2", `Can you guess an event?`)
    })

    FadeIn(bars, y, innerHeight);

    // Create a button or clickable element to transition back to the pie chart
    const backButton = AddBackButton(svg);

    // Add click event listener to the back button to transition back to the pie chart
    backButton.on("click", () => {
        FadeOutText("h2", () => {
            FadeOutText("h1")
        });
        FadeOut(bars, innerHeight, () => {
            RemoveBars(bars);
            createPieChart(data);
        });
    });
}

// HelperFunctions

function Initialize(country) {
    d3.select("#center-graph svg").remove();
    d3.select("#tooltip").remove();
    d3.select("h1").selectAll("tspan").remove();
    d3.select("h2").selectAll("tspan").remove();
}

function SetDimensions() {
    let containerWidth = document.getElementById('center-graph').clientWidth - 20; // Subtract padding
    let containerHeight = document.getElementById('center-graph').clientHeight - 20; // Subtract padding
    let width = 0.8 * containerWidth;
    let height = 0.8 * containerHeight;
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

function AddBars(svg, dataForCountry, x, y, color) {
    return svg.selectAll("rect")
        .data(dataForCountry)
        .enter().append("rect")
        .attr("x", d => x(d.type))
        .attr("y", y(0)) // Set initial y value to y(0)
        .attr("width", x.bandwidth())
        .attr("height", 0) // Set initial height to 0
        .style("fill", d => color);
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
                if (index === tspans.length - 1) {
                    onEnd();
                }
            });
    });
}

//Transition In
function FadeIn(bars, y, innerHeight, callback = null) {
    // Add a transition effect to make the bars grow in height gradually
    bars.transition()
        .duration(2300)
        .attr("y", d => y(d.value))
        .attr("height", d => innerHeight - y(d.value));
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