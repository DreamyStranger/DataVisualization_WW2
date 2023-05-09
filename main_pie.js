/**
 * Creates a pie chart using D3.js and adds tooltips and click effects to each slice.
 * @param {Array} data - An array of objects representing the data to be visualized. Each object should contain a "Country" property and a "Total_Casualties" property.
 */
function createPieChart(data) {
    // Set up dimensions and radius for the chart
    const width = document.getElementById('center-graph').clientWidth;
    const height = document.getElementById('center-graph').clientHeight;
    const radius = 0.8 * Math.min(width, height) / 2;

    // Set up color scale for the chart
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.Total_Casualties))
        .range(d3.schemeCategory10);

    // Set up the pie layout and arc generator for the chart
    const pie = d3.pie()
        .value(d => d.Total_Casualties)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Create SVG element and group for the chart
    const svg = d3.select("#center-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create group elements for each pie slice and bind data to them
    const g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    // Add tooltip element to the page
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip");

    tooltip.append("div")
        .attr("id", "country")
        .style("font-weight", "bold");

    tooltip.append("div")
        .attr("id", "total-casualties");

    // Add mouseover and click event listener to each pie slice
    g.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.Total_Casualties))
        .on("mouseover", function (event, d) {
            // Calculate tooltip position relative to mouse cursor
            const tooltipWidth = parseFloat(tooltip.style("width"));
            const tooltipHeight = parseFloat(tooltip.style("height"));
            const mouseX = event.pageX;
            const mouseY = event.pageY;
            const tooltipX = Math.min(mouseX + 10, window.innerWidth - tooltipWidth - 10);
            const tooltipY = Math.min(mouseY + 10, window.innerHeight - tooltipHeight - 10);

            // Update tooltip content with country and casualty information
            tooltip.select("#country").text(d.data.Country);
            tooltip.select("#total-casualties").text(`Total casualties: ${d.data.Total_Casualties.toLocaleString()}`);

            // Position and display tooltip
            tooltip.style("left", `${tooltipX}px`)
                .style("top", `${tooltipY}px`)
                .style("display", "block");

            // Highlight pie slice and add volume effect
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
        .on("mousemove", function (event) {
            // Update tooltip position with mouse cursor
            const tooltipWidth = parseFloat(tooltip.style("width"));
            const tooltipHeight = parseFloat(tooltip.style("height"));
            const mouseX = event.pageX;
            const mouseY = event.pageY;
            const tooltipX = Math.min(mouseX + 10, window.innerWidth - tooltipWidth - 10);
            const tooltipY = Math.min(mouseY + 10, window.innerHeight - tooltipHeight - 10);

            tooltip.style("left", `${tooltipX}px`)
                .style("top", `${tooltipY}px`);
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout
            tooltip.style("display", "none");

            // Remove highlight and volume effect from pie slice
            d3.select(this)
                .style("stroke", "none")
                .style("filter", "brightness(100%)")
                .transition()
                .duration(200)
                .attr("d", arc);
        })
    /*.on("click", function (event, d) {
        // Toggle selection on click
        const selected = d3.select(this).classed("selected");
        d3.selectAll(".arc path").classed("selected", false);
        d3.select(this).classed("selected", !selected);

        // Highlight selected pie slice with golden color
        d3.selectAll(".arc path.selected")
            .style("stroke", "goldenrod")
            .style("stroke-width", "4px")
            .style("filter", "brightness(150%)");

        // Remove highlight and volume effect from non-selected pie slices
        d3.selectAll(".arc path:not(.selected)")
            .style("stroke", "none")
            .style("filter", "brightness(100%)")
            .transition()
            .duration(200)
            .attr("d", arc);
    });*/
}

//Parse the data and create a chart
d3.json("main_pie.json").then(data => {
    createPieChart(data);
});
