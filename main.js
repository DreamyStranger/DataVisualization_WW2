import { createPieChart } from './pie_chart.js';

// Parse the data and create a chart
d3.json("main_pie.json").then(data => {
    createPieChart(data);
});
