import { createBarChart } from './bar_chart.js';

export function createPieChart(data) {

    //useful constants
    let touched = 0;
    const TOUCH_THRESHOLD = 300; // milliseconds
    let touchStartTime = 0;
    let touchEndTime = 0;


    const width = document.getElementById('center-graph').clientWidth;
    const height = document.getElementById('center-graph').clientHeight;
    const radius = 0.8 * Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.Total_Casualties))
        .range(d3.schemeCategory10);

    const sliceColors = data.map(d => color(d.Total_Casualties));

    const pie = d3.pie()
        .value(d => d.Total_Casualties)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const svg = d3.select("#center-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    const tooltip = d3.select("body")
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

    d3.select("h1").text("WW2 Casualties");
    d3.select("h2").text("Can you guess a country by the color?");

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
            touched = 0;
        })
        .on("click touchend", function (event, d) {
            touchEndTime = new Date().getTime();
            let touchDuration = touchEndTime - touchStartTime;
            if (touchDuration > TOUCH_THRESHOLD) {
                event.stopPropagation(); // Prevent triggering other touchend listeners
                    createBarChart(d.data.Country, data, sliceColors[d.index]);
            }
        });

    // Close tooltip on touchend event outside the pie chart
    d3.select("body")
        .on("touchend", function (event) {
            // Hide tooltip on touchend event outside the pie chart
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
