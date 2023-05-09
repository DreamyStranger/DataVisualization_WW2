import { createPieChart } from './pie_chart.js';

export function createBarChart(country, data, color) {

    //remove old graph and tooltip
    d3.select("#center-graph svg").remove();
    d3.select("#tooltip").remove();

    // Update the title and subtitle
    d3.select("h1").text(`WW2 Casualties - ${country}`);
    d3.select("h2").text("Military vs Civilian Casualties");

    // Get data for the selected country
    const selectedCountry = data.filter(d => d.Country === country)[0];
    const dataForCountry = [
        { type: "Military", value: selectedCountry.Military_Casualties },
        { type: "Civilian", value: selectedCountry.Civilian_Casualties }
    ];

    // Define dimensions for the chart
    const containerWidth = document.getElementById('center-graph').clientWidth - 20; // Subtract padding
    const containerHeight = document.getElementById('center-graph').clientHeight - 20; // Subtract padding
    const width = 0.8 * containerWidth;
    const height = 0.8 * containerHeight;
    const innerWidth = width;
    const innerHeight = height;


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
    svg.selectAll("rect")
        .data(dataForCountry)
        .enter().append("rect")
        .attr("x", d => x(d.type))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.value))
        .style("fill", d => color);

    // Add axes to the bar chart
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    svg.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);
    svg.append("g")
        .call(yAxis);

    // Create a button or clickable element to transition back to the pie chart
    const backButton = svg.append("text")
        .attr("x", width - margin.right - 70)
        .attr("y", margin.top)
        .attr("class", "back-button")
        .text("Back to Pie Chart")
        .style("fill", "black")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .style("cursor", "pointer");

    // Add click event listener to the back button to transition back to the pie chart
    backButton.on("click", () => {
        d3.select("#center-graph svg").remove(); // Remove the bar chart
        createPieChart(data); // Recreate the pie chart
    });
}

