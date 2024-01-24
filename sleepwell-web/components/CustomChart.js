"use client";

import React from 'react';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Themes } from './ChartThemes';

function CustomChart({ data, height, width, title, type, theme, accessabilityText }) {
    /*  
        Default data set used to reduce code repetition in non-components, and to provide a working
        example without requiring any setup. Just throw this component into a page to see how it works.
    */
    const defaultData = {
        // These are the the x axis groups that the datasets will be bound to
        // If a dataset steps outside the label length, the overflow will be ignored
        labels: ['example 1', 'example 2', 'example 3'],
        datasets: [
            {
                data: [12, 19, 3, 4],
            }
        ],
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title || 'Custom Chart Title'
                }
            },
            responsive: true
        }
    };

    const defaultTheme = theme || Themes.purpleShapeGradient;

    // Overwrites the above data object with anything that may exist in the newData object
    // If the newData object is empty or undefined, no changes will be made to the example data set
    for (const property in data) {
        defaultData[property] = data[property];
    }

    for (const dataset in defaultData.datasets) {
        // Override dataset colours with a theme if no background colours are provided
        if (defaultData.datasets[dataset].backgroundColor == undefined) {
            for (const themeAttribute in defaultTheme) {
                defaultData.datasets[dataset][themeAttribute] = defaultTheme[themeAttribute];
            }
        }

        // Ensuring all data sets have a label
        defaultData.datasets[dataset].label = defaultData.datasets[dataset].label || "Dataset " + (Number(dataset) + 1);
    }

    return (
        <div
            className="chart-container"
            style={{
                position: "relative",
                height: height || "40vh",
                width: width || "80vw",
                backgroundColor: "white"
            }}
        >
            <Chart
                type={type || "line"}
                data={defaultData}
                aria-label={accessabilityText}
                role="img"
            >
                <p>Your browser does not support the canvas element.</p>
            </Chart>
        </div>
    )
}

export default CustomChart;