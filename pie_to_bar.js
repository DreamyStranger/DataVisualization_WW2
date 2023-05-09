/**
 * Transitions the pie chart to a bar chart for the given country.
 * @param {string} country - The name of the country to transition to a bar chart for.
 * @param {Array} data - The original data array.
 * @param {Function} arc - The arc generator function.
 * @param {Function} color - The color scale function.
 * @param {Function} transitionToPieChart - The function to transition back to the pie chart.
 */
export function transitionToBarChart(country, data, arc, color, transitionToPieChart) {
    // Get data for the selected country
    const selectedCountry = data.filter(d => d.Country === country)[0];
    const dataForCountry = [    { type: "Military", value: selectedCountry.Military_Casualties },    { type: "Civilian", value: selectedCountry.Civilian_Casualties }  ];
  
    // Define dimensions for the chart
    const width = document.getElementById('center-graph').clientWidth;
    const height = document.getElementById('center-graph').clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    // Set up scales for the chart
    const x = d3.scaleBand()
      .range([0, innerWidth])
      .padding(0.1)
      .domain(dataForCountry.map(d => d.type));
    const y = d3.scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(dataForCountry, d => d.value)]);
  
    // Create SVG element and group for the chart
    const svg = d3.select("#center-graph svg");
    const g = svg.select("g");
  
    // Animate the pie slices turning into bars
    g.selectAll(".arc path")
      .transition()
      .duration(750)
      .attrTween("d", d => {
        const i = d3.interpolate(d.endAngle, d.startAngle);
        return t => {
          d.startAngle = i(t);
          return arc(d);
        }
      })
      .remove();
  
    // Add rectangle elements for each data point
    const rects = g.selectAll(".rect")
      .data(dataForCountry);
  
    // Remove existing rectangle elements
    rects.exit().remove();
  
    // Append new rectangle elements
    rects.enter().append("rect")
      .attr("class", "rect")
      .attr("x", d => x(d.type))
      .attr("y", innerHeight)
      .attr("height", 0)
      .merge(rects)
      .transition()
      .duration(750)
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.value))
      .style("fill", d => color(d.type));
  
    // Add circle element to transition back to pie chart
    const circle = g.append("circle")
      .attr("class", "circle")
      .attr("cx", innerWidth - 30)
      .attr("cy", 20)
      .attr("r", 15)
      .style("fill", "white")
      .style("stroke", "black");
  
    // Add click event listener to circle element to transition back to pie chart
    circle.on("click", () => {
      transitionToPieChart(data);
    });
  }
  