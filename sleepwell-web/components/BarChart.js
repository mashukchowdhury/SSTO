import React from "react";
import { Chart, CategoryScale, BarElement, LinearScale } from "chart.js/auto";
import { Bar, Line, defaults } from "react-chartjs-2";

const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      data: [12, 12, 12, 12, 12, 12],
    },
  ],
};

// Chart.register(CategoryScale, BarElement, LinearScale);
const BarChart = (props) => {
    var noDataGiven = props.data == null;
    return (
        <div>
            <div class="text-hex-1aa7ec">Checking Your Progress</div>
            <Line data={noDataGiven ? data : props.data} />
        </div>
        );
};

export default BarChart;
