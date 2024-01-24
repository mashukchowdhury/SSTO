import { diaryByWeeks, getDiaryByWeeks } from "../components/Firebase";
import React from "react";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";

import {
  Chart,
  BarElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import styles from '../styles/results.module.css';
import moment, { weekdays } from "moment";
import { sumArray } from "../modules/ResultsUtil";
import BarChart from "../components/BarChart"

moment().format();

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Converts time into 12 hour time? -- utility TODO: replace with moment?
var newHour;
function converter(hour, meriad) {
  if (meriad === "am") {
    if (hour === 12) {
      newHour = 0;
    } else {
      newHour = hour;
    }
  }
  if (meriad === "pm") {
    if (hour === 12) {
      newHour = 12;
    } else {
      newHour = hour + 12;
    }
  }

  return newHour;
}

// Reverse firebase db contents, parsers are reliant on this for everything to be in order.
//let diary = diaryByWeeks?.reverse() ?? [];
let diaryPromise = Promise.resolve(diaryByWeeks);
let diary = [];
diaryPromise.then((value) => {
    diary = value;
})

/*
if (diary.length === 0) {
  // make a fake diary entry
  diary = [
    [
      {
        toBed: {
          time: {
            hour: 12,
            minute: 0,
            merid: "am",
          },
        },
        outOfBed: {
          time: {
            hour: 12,
            minute: 0,
            merid: "am",
          },
        },
        fallAsleep: {
          time: {
            hour: 12,
            minute: 0,
            merid: "am",
          },
        },
        finalAwake: {
          time: {
            hour: 12,
            minute: 0,
            merid: "am",
          },
        },
        awokenLength: {
          time: {
            hour: 12,
            minute: 0,
            merid: "am",
          },
        },
        napDuration: {
          time: 12,
          minute: 0,
        },
        napCount: {
          number: 0,
        },
      },
    ],
  ];
}
*/

// Arrays for storing stat calculations
let timeNappingArray = [];
let daysWithNapsArray = [];

let timeInBedArray = [];
let timeAsleepArray = [];
let sleepEfficiencyArray = [];
let timeToFallAsleepArray = [];
let timeToGetOutOfBedArray = [];
let totalLengthOfAwakeningsArray = [];

let timeInBedArrayAvg = [];
let timeAsleepArrayAvg = [];
let sleepEfficiencyArrayAvg = [];
let toFallAsleepAvg = [];
let awakeningsAvg = [];
let getOutOfBedAvg = [];

let timeNappingArrayAvg = [];
let daysWithNapsArrayAvg = [];

/**
 * This is the function for calculating nap time, daily, over a period of days.
 *
 * @param {*} inputArray, an array with napDuration data in it.
 * @returns calcArray, an array where each element is the time spent napping for a day.
 */
function calcNappingTime(inputArray) {
  var calcArray = [];
  let temp1;

  let hoursNapping = [];
  let minutesNapping = [];

  inputArray.map((obj) => {
    hoursNapping.push(obj.napDuration.time.hour);
    minutesNapping.push(obj.napDuration.time.minute);
  });

  for (let i = 0; i < inputArray.length; i++) {
    var tot;
    temp1 = hoursNapping[i];
    tot = temp1 * 60 + minutesNapping[i];
    calcArray.push(tot);
  }

  return calcArray;
}

/**
 * This function counts how many naps in a day, over a period of days.
 *
 * @param {*} inputArray, an array with nap data in it.
 * @returns dailyCount, an array where each element is an int (the number of naps in a day).
 */
function calcDaysWithNaps(inputArray) {
  let dailyCount = [];

  inputArray.map((obj) => {
    dailyCount.push(obj.napCount.number);
  });

  return dailyCount;
}

/**
 * This function calculates the total time spent in bed, daily, over a period of days.
 *
 * @param {*} inputArray, an array with data about the time spent in bed.
 * @returns an array, where each element is the total time spent in bed in a day.
 */
function calcTimeInBed(inputArray) {
  // returned array
  var calcArray = [];

  // temporary variables?
  var temp1;
  var temp2;

  // time went to bed
  let hourToBedArray = [];
  let meridToBedArray = [];
  let minutesToBedArray = [];

  // time out of bed
  let hourOutOfBedArray = [];
  let meridOutOfBedArray = [];
  let minutesOutOfBedArray = [];

  // we can condense these probably
  inputArray.map((obj) => {
    hourToBedArray.push(obj.toBed.time.hour);
    minutesToBedArray.push(obj.toBed.time.minute);
    meridToBedArray.push(obj.toBed.time.merid);
  });

  inputArray.map((obj) => {
    hourOutOfBedArray.push(obj.outOfBed.time.hour);
    minutesOutOfBedArray.push(obj.outOfBed.time.minute);
    meridOutOfBedArray.push(obj.outOfBed.time.merid);
  });

  for (let i = 0; i < meridToBedArray.length; i++) {
    var tot;
    if (minutesToBedArray[i] + minutesOutOfBedArray[i] > 60) {
      temp1 = 23 - converter(hourToBedArray[i], meridToBedArray[i]);
    } else {
      temp1 = 24 - converter(hourToBedArray[i], meridToBedArray[i]);
    }
    temp2 = converter(hourOutOfBedArray[i], meridOutOfBedArray[i]);
    tot =
      temp1 * 60 + temp2 * 60 + minutesOutOfBedArray[i] - minutesToBedArray[i];
    calcArray.push(tot / 60);
  }

  return calcArray;
}

/**
 * This function calculates the total time spent sleeping, daily, over a period of days.
 *
 * @param {*} inputArray, an array with data about the time spent sleeping
 * @returns an array, where each element is the total time spent asleep in a day.
 */
function calcSleepTime(inputArray) {
  // returned array
  var calcArray = [];

  var temp1;
  var temp2;

  let hourFallAsleepArray = [];
  let meridFallAsleepArray = [];
  let minutesFallAsleepArray = [];

  let hoursFinalAwakeArray = [];
  let meridFinalAwakeArray = [];
  let minutesFinalAwakeArray = [];

  inputArray.map((obj) => {
    hourFallAsleepArray.push(obj.fallAsleep.time.hour);
    minutesFallAsleepArray.push(obj.fallAsleep.time.minute);
    meridFallAsleepArray.push(obj.fallAsleep.time.merid);
  });

  inputArray.map((obj) => {
    hoursFinalAwakeArray.push(obj.finalAwake.time.hour);
    minutesFinalAwakeArray.push(obj.finalAwake.time.minute);
    meridFinalAwakeArray.push(obj.finalAwake.time.merid);
  });

  for (let i = 0; i < meridFallAsleepArray.length; i++) {
    var tot;

    if (minutesFallAsleepArray[i] + minutesFinalAwakeArray[i] > 60) {
      temp1 = 23 - converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
    } else {
      temp1 = 24 - converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
    }
    temp2 = converter(hoursFinalAwakeArray[i], meridFinalAwakeArray[i]);
    tot =
      temp1 * 60 +
      temp2 * 60 +
      minutesFallAsleepArray[i] +
      minutesFinalAwakeArray[i];
    calcArray.push(tot / 60);
  }
  return calcArray;
}

/**
 * This function calculates the total time spent trying to fall asleep, daily, over a period of days.
 *
 * @param {*} inputArray, an array with data about the time spent trying to fall asleep.
 * @returns an array, where each element is the total time spent trying to fall asleep, in a day.
 */
function toFallAsleep(inputArray) {
  // returned array
  var calcArray = [];

  var temp1;
  var temp2;

  let hourToBedArray = [];
  let meridToBedArray = [];
  let minuteToBedArray = [];

  let hourFallAsleepArray = [];
  let meridFallAsleepArray = [];
  let minuteFallAsleepArray = [];

  inputArray.map((obj) => {
    hourToBedArray.push(obj.toBed.time.hour);
    minuteToBedArray.push(obj.toBed.time.minute);
    meridToBedArray.push(obj.toBed.time.merid);
  });

  inputArray.map((obj) => {
    hourFallAsleepArray.push(obj.fallAsleep.time.hour);
    minuteFallAsleepArray.push(obj.fallAsleep.time.minute);
    meridFallAsleepArray.push(obj.fallAsleep.time.merid);
  });

  for (let i = 0; i < meridToBedArray.length; i++) {
    var tot;

    temp1 = converter(hourToBedArray[i], meridToBedArray[i]);
    temp2 = converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
    tot =
      temp2 * 60 -
      temp1 * 60 +
      (minuteFallAsleepArray[i] - minuteToBedArray[i]);
    calcArray.push(tot / 60);
  }
  return calcArray;
}

/**
 * This function calculates the total time spent to get out of bed, daily, over a period of days.
 *
 * @param {*} inputArray, an array with data about the time spent to get out of bed.
 * @returns an array, where each element is the total time spent to get out of bed in a day.
 */
function timeToGetOutOfBed(inputArray) {
  // returned array
  var calcArray = [];

  var temp1;
  var temp2;

  let hoursArray1 = [];
  let meridArray1 = [];
  let minutesArray1 = [];

  let hoursArray2 = [];
  let meridArray2 = [];
  let minutesArray2 = [];

  inputArray.map((obj) => {
    hoursArray1.push(obj.outOfBed.time.hour);
    minutesArray1.push(obj.outOfBed.time.minute);
    meridArray1.push(obj.outOfBed.time.merid);
  });

  inputArray.map((obj) => {
    hoursArray2.push(obj.finalAwake.time.hour);
    minutesArray2.push(obj.finalAwake.time.minute);
    meridArray2.push(obj.finalAwake.time.merid);
  });

  for (let i = 0; i < meridArray1.length; i++) {
    var tot;

    temp1 = converter(hoursArray1[i], meridArray1[i]);
    temp2 = converter(hoursArray2[i], meridArray2[i]);

    if (minutesArray1[i] + minutesArray2[i] > 60) {
      tot = temp1 * 60 - temp2 * 60 + (minutesArray2[i] - minutesArray1[i]);
      calcArray.push(tot / 60);
    } else if (minutesArray1[i] < minutesArray2[i]) {
      tot =
        temp1 * 60 -
        temp2 * 60 +
        (60 - minutesArray2[i] + minutesArray1[i] - 60);
      calcArray.push(tot / 60);
    } else {
      tot = temp2 * 60 - temp1 * 60 + (minutesArray2[i] - minutesArray1[i]);
      // change here
      calcArray.push(-(tot / 60));
    }
  }
  return calcArray;
}

/**
 * This function returns the time awoken, for each day over a period of days.
 *
 * @param {*} inputArray, an array with data about the time awoken.
 * @returns an array, where each element is the time awoken for that day.
 */
function timeAwakeAfterSleep(inputArray) {
  // returned array
  var calcArray = [];

  var temp1;
  var tot;
  let hourAwokenArray = [];
  let meridAwokenArray = [];
  let minuteAwokenArray = [];

  inputArray.map((obj) => {
    hourAwokenArray.push(obj.awokenLength.time.hour);
    minuteAwokenArray.push(obj.awokenLength.time.minute);
    meridAwokenArray.push(obj.awokenLength.time.merid);
  });

  for (let i = 0; i < meridAwokenArray.length; i++) {
    tot = hourAwokenArray[i] * 60 + minuteAwokenArray[i];
    calcArray.push(tot / 60);
  }

  return calcArray;
}

/**
 * This function calculates the daily sleepEffiency for a period of days.
 *
 * @param {*} inBedArray
 * @param {*} asleepArray
 * @returns calcArray, an array where each element is the sleep effenciency for a day.
 */
function sleepEfficiency(inBedArray, asleepArray) {
  var calcArray = [];

  for (let index = 0; index < inBedArray.length; index++) {
    calcArray.push((asleepArray[index] / inBedArray[index]) * 100);
  }

  return calcArray;
}

/**
 * This function formats a value into real time.
 * Used for displaying data properly.
 *
 * @param {*} tot
 * @returns
 */
function toRealTime(tot) {
  var temp = tot - parseInt(tot);

  min = tot - parseInt(tot);
  var hour = parseInt(tot);
  var min = parseInt(temp * 60);

  // if hour and min is NaN
  // replace them with 0
  if (isNaN(hour)) {
    hour = 0;
  }
  if (isNaN(min)) {
    min = 0;
  }

  return hour + "Hrs " + min + "min";
}

/**
 * This function gets the average value for an array.
 *
 * @param {*} targetArray
 * @returns the average value.
 */
function getAverage(targetArray) {
  let sum = 0;

  for (let i = 0; i < targetArray.length; i++) {
    sum += targetArray[i];
  }

  return sum / targetArray.length;
}


function populateArrays() {
    for (let i = 0; i < diary.length; i++) {
        timeInBedArray.push(calcTimeInBed(diary[i]));
        //console.log("timeInBedArray: pushed " + calcTimeInBed(diary[i]));
        timeAsleepArray.push(calcSleepTime(diary[i]));
        timeToFallAsleepArray.push(toFallAsleep(diary[i]));
        timeToGetOutOfBedArray.push(timeToGetOutOfBed(diary[i]));
        totalLengthOfAwakeningsArray.push(timeAwakeAfterSleep(diary[i]));
        sleepEfficiencyArray.push(
            sleepEfficiency(timeInBedArray[i], timeAsleepArray[i])
        );
        timeNappingArray.push(calcNappingTime(diary[i]));
        daysWithNapsArray.push(calcDaysWithNaps(diary[i]));

        timeInBedArrayAvg.push(getAverage(timeInBedArray[i]));
        timeAsleepArrayAvg.push(getAverage(timeAsleepArray[i]));
        sleepEfficiencyArrayAvg.push(getAverage(sleepEfficiencyArray[i]));
        toFallAsleepAvg.push(getAverage(timeToFallAsleepArray[i]));
        awakeningsAvg.push(getAverage(totalLengthOfAwakeningsArray[i]));
        getOutOfBedAvg.push(getAverage(timeToGetOutOfBedArray[i]));
        timeNappingArrayAvg.push(getAverage(timeNappingArray[i]));
        daysWithNapsArrayAvg.push(getAverage(daysWithNapsArray[i]));
    }
}

function calculateTotalCount() {
  let totalCount = [];

  for (let i = 0; i < daysWithNapsArray.length; i++) {
    totalCount[i] = daysWithNapsArray[i].reduce(function (a, b) {
      return a + b;
    });
  }

  return totalCount;
}

let daysWithNapsSimplified = calculateTotalCount();

/////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Data layouts. These are pushed to the Line and Bar graph elements in order to define certain properties.
 */
const dailyNapDataLayout = {
  labels: ["1", "2", "3", "4", "5", "6", "7"],
  datasets: [
    {
      label: "Daily Nap Time (Minutes)",
      data: timeNappingArrayAvg,
      borderWidth: 4,
      borderColor: "rgb(22 163 74)",
      yAxisID: "y",
      tension: 0.2,
    },
  ],
};

const daysWithNapsDataLayout = {
  labels: ["1", "2", "3", "4", "5", "6", "7"],
  datasets: [
    {
      label: "Days with Naps",
      data: daysWithNapsSimplified,
      data: daysWithNapsSimplified,
      borderWidth: 4,
      borderColor: "rgb(22 163 74)",
      yAxisID: "y",
      tension: 0.2,
    },
  ],
};

const sleepEfficiencyDataLayout = {
  labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
  datasets: [
    {
      label: "Time sleeping",
      data: timeInBedArrayAvg,
      borderWidth: 4,
      borderColor: "rgb(22 163 74)",
      yAxisID: "y",
      tension: 0.2,
    },
    {
      label: "Time in bed",
      data: timeAsleepArrayAvg,
      borderColor: "rgb(127 29 29)",
      borderWidth: 4,
      yAxisID: "y",
      tension: 0.2,
    },
    {
      label: "Sleep Efficiency",
      data: sleepEfficiencyArrayAvg,
      borderWidth: 4,
      borderColor: "rgb(249 115 22)",
      yAxisID: "percentage",
      tension: 0.2,
    },
  ],
};

const sleepDataLayout = {
  labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
  datasets: [
    {
      label: "Time to fall asleep",
      data: toFallAsleepAvg,
      borderWidth: 4,

      borderColor: "rgb(29,101,104)",

      tension: 0.2,
    },
    {
      label: "Time awake after sleep",
      data: awakeningsAvg,
      borderColor: "rgb(235,43,230)",
      borderWidth: 4,

      tension: 0.2,
    },
    {
      label: "Time to get out of bed",
      data: getOutOfBedAvg,
      borderWidth: 4,
      borderColor: "rgb(148,141,153)",

      tension: 0.2,
    },
  ],
};

/**
 * Option layouts. These are pushed to the Line and Bar graph elements in order to define certain properties.
 */
export const napOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Minutes",
      },
    },
    x: {
      title: {
        display: true,
        text: "Weeks",
      },
    },
    percentage: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: function (value, index, values) {
          return `${value}%`;
        },
      },
    },
  },
};

export const efficiencyOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Hours",
      },
    },
    x: {
      title: {
        display: true,
        text: "Weeks",
      },
    },
    percentage: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: function (value, index, values) {
          return `${value}%`;
        },
      },
    },
  },
};

export const sleepStatOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      suggestedMax: 10,
      suggestedMin: 0,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Hours",
      },
    },
    x: {
      title: {
        display: true,
        text: "Weeks",
      },
    },
  },
};

export const napCount = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Number of Naps",
      },
    },
    x: {
      title: {
        display: true,
        text: "Weeks",
      },
    },
    percentage: {
      suggestedMax: 13,
      suggestedMin: 2,
      type: "linear",
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: function (value, index, values) {
          return `${value}%`;
        },
      },
    },
  },
};

Chart.register(
  CategoryScale,
  BarElement,
  LinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * This is a statistics box.
 * It displays a value, with a title as a heading (well not technically, but for all intents and purposes).
 * It takes in two props
 * - title, sort of like a heading
 * - value, the value to be displayed.
 *
 * @param {*} props
 * @returns
 */
function StatisticsBox(props) {
  return (
    <div className={styles.statisticsBox}>
      <p className={styles.statisticsTitle}>
        {props.title}
      </p>
      <p
        className="mx-auto my-1 basis-1/2 text-4xl font-semibold "
        suppressHydrationWarning={true}
      >
        {props.value}
      </p>
    </div>
  );
}

/**
 * Sleep efficiency results page.
 *
 * @returns A series of statistics box elements.
 */
function efficiencyResults() {
  return (
    <>
      <StatisticsBox
        title="Time in bed"
        value={toRealTime(timeInBedArrayAvg[timeInBedArrayAvg.length - 1])}
      />
      <StatisticsBox
        title="Time sleeping"
        value={toRealTime(timeAsleepArrayAvg[timeAsleepArrayAvg.length - 1])}
      />
      <StatisticsBox
        title="Sleep efficiency"
        value={
          sleepEfficiencyArrayAvg.length > 0 &&
          sleepEfficiencyArrayAvg[sleepEfficiencyArrayAvg.length - 1].toFixed(
            2
          ) + "%"
        }
      />
    </>
  );
}

/**
 * This is a function that returns three boxes with data for statistics results.
 *
 * @returns
 */
function statisticResults() {
  return (
    <>
      <StatisticsBox
        title="Time to fall asleep"
        value={toRealTime(toFallAsleepAvg[toFallAsleepAvg.length - 1])}
      />
      <StatisticsBox
        title="Time awake after sleep"
        value={toRealTime(awakeningsAvg[awakeningsAvg.length - 1])}
      />
      <StatisticsBox
        title="Time to get out of bed"
        value={toRealTime(getOutOfBedAvg[getOutOfBedAvg.length - 1])}
      />
    </>
  );
}

/**
 * Table for weekly sleep statistics. This is usually shown every 7 days (at the end of a week).
 *
 * @returns A table featuring all the relevant weekly statistics.
 */
function SleepScoreTable() {
    populateArrays();
    // data still need to be cleared
  var noOfDays = diary.length > 0 ? diary[0].length : 0;
  var napList = timeNappingArray[0];
  var timeInBedList = timeInBedArray[0];
  var awakeList = totalLengthOfAwakeningsArray[0];
  var asleepList = timeAsleepArray[0];
  var efficiency = sleepEfficiencyArray[0];


  var weekLengthList = [];
  for (var i = 0; i < noOfDays; i++) {
    weekLengthList.push(dataFormat(diary[0][i].date, false));
  }

  // parameter is a list
  function tableDataFormat(list, roundValue) {
    if (!list) return [];
    return list.map(function (item) {
      if (roundValue) {
        return dataFormatRounded(item);
      } else {
        return dataFormat(item);
      }
    });
  }

  function tableRow(heading, list) {
    return (
      <tr>
        <th className="... border border-slate-600">{heading}</th>
        {list}
      </tr>
    );
  }

  function dataFormat(value) {
    return <th className="... border border-slate-600">{String(value)}</th>;
  }

  function dataFormatRounded(value) {
    return (
      <th className="... border border-slate-600">
        {String(Math.round(value))}
      </th>
    );
  }

  function getTimeAwakeAfterFallingAsleep() {
    // Average nap time for this week, not total
    return getAverage(timeNappingArray[timeNappingArray.length - 1])
      .toFixed(1)
      .toString() + "min";
  }
  function getTimeAwakeBeforeStartingDay() {
    return getOutOfBedAvg[getOutOfBedAvg.length - 1]
      .toFixed(1)
      .toString();
  }


  function getTimeAwakeBeforeFallingAsleep() {
    return timeInBedArrayAvg[timeInBedArrayAvg.length - 1]
      .toFixed(1)
      .toString();
  }


  return (
    <div className="container flex-nowrap text-center font-bold">
      <div className="container flex-nowrap text-center">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5 text-2xl">
            Time between getting to bed and falling asleep
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getTimeAwakeBeforeFallingAsleep()}
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="container flex-nowrap text-center">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5 text-2xl">
            Time spent awake after falling asleep
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getTimeAwakeAfterFallingAsleep()}
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="container flex-nowrap text-center text-2xl">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5">
            Time awake before rising and starting your day
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getTimeAwakeBeforeStartingDay()}
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
 // still need to be finished.
function SleepRateTable() {
  var noOfDays = diary.length > 0 ? diary[0].length : 0;
  var napList = timeNappingArray[0];
  var timeInBedList = timeInBedArray[0];
  var awakeList = totalLengthOfAwakeningsArray[0];
  var asleepList = timeAsleepArray[0];
  var efficiency = sleepEfficiencyArray[0];


  var weekLengthList = [];
  for (var i = 0; i < noOfDays; i++) {
    weekLengthList.push(dataFormat(diary[0][i].date, false));
  }

  // parameter is a list
  function tableDataFormat(list, roundValue) {
    if (!list) return [];
    return list.map(function (item) {
      if (roundValue) {
        return dataFormatRounded(item);
      } else {
        return dataFormat(item);
      }
    });
  }

  function tableRow(heading, list) {
    return (
      <tr>
        <th className="... border border-slate-600">{heading}</th>
        {list}
      </tr>
    );
  }

  function dataFormat(value) {
    return <th className="... border border-slate-600">{String(value)}</th>;
  }

  function dataFormatRounded(value) {
    return (
      <th className="... border border-slate-600">
        {String(Math.round(value))}
      </th>
    );
  }

    
  function getLatestTimeAsleepAvg() {
    return timeAsleepArrayAvg[timeAsleepArrayAvg.length - 1]
      .toFixed(1)
      .toString();
  }
  function getLatestTimeInBedAvg() {
    return timeInBedArrayAvg[timeInBedArrayAvg.length - 1]
      .toFixed(1)
      .toString();
  }
  function getLatestSleepEfficiencyAvg() {
    return sleepEfficiencyArrayAvg[sleepEfficiencyArrayAvg.length - 1]
      .toFixed(1)
      .toString() + "%";
    }

  return (
    <div className="container flex-nowrap text-center font-bold text-2xl">
      <div className="container flex-nowrap text-center">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5">
          Time asleep
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getLatestTimeAsleepAvg()} 
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="container flex-nowrap text-center">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5">
          Time in bed​
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getLatestTimeInBedAvg()}
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="container flex-nowrap text-center">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center sm:basis-full md:basis-2/3 lg:basis-4/5">
          Sleep efficiency​
          </div>
          <div className="flex items-center sm:basis-full md:basis-1/3 lg:basis-1/5">
            <p className="pointer-events-none mr-2 mb-2 w-auto rounded-full bg-blue-700 px-12 py-2.5 text-2xl font-medium">
              {getLatestSleepEfficiencyAvg()}
            </p>
            <Popover>
              <PopoverHandler>
                <button
                  data-popover-target="popover-description"
                  data-popover-placement="bottom-end"
                  type="button"
                  className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </PopoverHandler>
              <PopoverContent>This is a test text.</PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}

function SleepOverview() {
  return (
    <div className="container flex-nowrap text-center font-bold text-2xl">
      <h3 className="text-lg font-semibold text-blue-600 mb-4 text-left">Your sleep numbers for week 1</h3>

      <div className="border border-gray-600 p-2 rounded-md">
        <p className="text-gray-500 mb-2">End of week 1</p>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-center text-sm mb-2 text-gray-500">In the past 7 days, you completed the sleep diary 6 times.</div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full border-2 border-blue-300">
              <span className="text-white text-2xl font-medium">6</span>
            </div>
            <span className="text-sm ml-2 text-gray-500">times</span>
          </div>
        </div>
        <div className="flex justify-center items-center " style={{ height: 100 }}>
          <div className="flex">
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✗</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
            <div className="flex items-center justify-center h-8 w-8 bg-gray-300 rounded m-2">
              <span className="text-gray-700 text-xl font-medium">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



function WeeklyProgress() {
  const calculateAverageSleepPerWeek = (weekLogs) => {
    if (!Array.isArray(weekLogs)) {
      return 0; // Return 0 if weekLogs is not an array
    }

    // Function to convert time to minutes
    const timeToMinutes = (time) => {
      return time.hour * 60 + time.minute + (time.merid === 'pm' && time.hour !== 12 ? 12 * 60 : 0);
    };

    const calculateSleepDuration = (sleepLog) => {
      const toBedTime = timeToMinutes(sleepLog.toBed.time);
      const wakeUpTime = timeToMinutes(sleepLog.outOfBed.time);
      return (wakeUpTime - toBedTime + 24 * 60) % (24 * 60); 
    };

    let totalSleepMinutes = 0;
    weekLogs.forEach((log) => {
      totalSleepMinutes += calculateSleepDuration(log);
    });

    const averageSleepMinutesPerDay = weekLogs.length > 0 ? totalSleepMinutes / weekLogs.length : 0;

    // Calculate average sleep duration per week (assuming 7 days per week)
    const averageSleepMinutesPerWeek = averageSleepMinutesPerDay * 7;

    return averageSleepMinutesPerWeek
  };

  // Check if diaryByWeeks is defined and is an array before using map
  const averageSleepPerWeek = Array.isArray(diaryByWeeks) ? diaryByWeeks.map(calculateAverageSleepPerWeek) : [];

  console.log("Average sleep duration for each week:", averageSleepPerWeek);

  // Chart data
  const chartData = {
    labels: Array.from({ length: averageSleepPerWeek.length }, (_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: 'Average Sleep Duration',
        data: averageSleepPerWeek,
        fill: false, // Use fill: false for a line chart
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      datalabels: {
        color: 'black',
        anchor: 'end',
        align: 'end',
        formatter: (value) => `${value} mins`,
      },
    },
  };

  return (
    <div className="container flex-nowrap text-center font-bold text-2xl">
      <h3 className="text-lg font-semibold text-blue-600 mb-4 text-left">Your average sleep hours </h3>

    <div className="container flex-nowrap text-center font-bold text-2xl">
      {averageSleepPerWeek.length > 0 ? (
        <Line data={chartData} options={chartOptions}/>
      ) : (
        <p>No data available to display the chart.</p>
      )}
    </div>
    </div>
  );
}

export default function Results() {
  const router = useRouter();
  var [page, setPage] = React.useState(0);

  const pages = [
    "Sleep Statistics_1",
    "Sleep Statistics_2",
    "Sleep Efficiency Statistics",
  ];

  /**
   * These are "screen" layouts for this page.
   * Adding an additional layout is as easy as adding another element to this list.
   */
  var pageLayouts = [
    <CenterLayout title="Weekly Overview" center={<SleepOverview />} />,
    <CenterLayout title="Weekly Statistics" center={<SleepScoreTable />} />,
    <CenterLayout title="Weekly Statistics" center={<SleepRateTable />} />,
    <CenterLayout title="Weekly Statistics" center={<WeeklyProgress />} />,

    <SplitPaneLayout
      title="Nap Statistics"
      leftSide={
        <div className="h-[16rem] w-full rounded-lg bg-white">
          <Line options={napOptions} data={dailyNapDataLayout} />
        </div>
      }
      rightSide={
        <div className="h-[16rem] w-full rounded-lg bg-white">
          <Bar options={napCount} data={daysWithNapsDataLayout} />
        </div>
      }
    />,
    

    <SplitPaneLayout
      title="Sleep Statistics"
      leftSide={statisticResults()}
      rightSide={
        <div className="h-[32rem] w-full rounded-lg bg-white">
          <Line options={sleepStatOptions} data={sleepDataLayout} />
        </div>
      }
    />,

    <SplitPaneLayout
      title="Sleep Efficiency Statistics"
      leftSide={efficiencyResults()}
      rightSide={
        <div className="h-[32rem] w-full rounded-lg bg-white">
          <Line options={efficiencyOptions} data={sleepEfficiencyDataLayout} />
        </div>
      }
    />,
  ];

  /**
   * These two functions handle going forward and backwards between pages.
   */
  function nextPage() {
    if (page == pageLayouts.length - 1) {
      setPage((page = 0));
    } else {
      setPage((page += 1));
    }
  }

  function prevPage() {
    if (page == 0) {
      setPage((page = pageLayouts.length - 1));
    } else {
      setPage((page -= 1));
    }
  }

  /**
   * This function displays two "forwards" and "backwards"
   * buttons. Depending on the page's location, the buttons change appearance.
   * (No back button on the first page, "To Tips" button on the last page)
   */
  function navigationButtons() {
    if (page == 0) {
      return (
        <div className="float-right self-center mt-20 flex cursor-pointer text-3xl">
          <p className="self-center select-none mr-3" onClick={nextPage}>Next </p>
          <button
                    type="submit"
                    className="h-0 w-0
                    border-t-[50px] border-t-transparent
                    border-l-[75px] border-l-swLightPurple
                    border-b-[50px] border-b-transparent
                    hover:border-l-swCyan"
                    onClick={nextPage}
                  >
                  </button>
          {/* <NavButton title="Next" onClick={nextPage} /> */}
        </div>
      );
    } else if (page == pageLayouts.length - 1) {
      return (
        <>
          <div className="float-left">
          <button
                    className="h-0 w-0
                    border-t-[50px] border-t-transparent
                    border-r-[75px] border-r-swLightPurple
                    border-b-[50px] border-b-transparent
                    hover:border-r-swCyan"
                    onClick={prevPage}
                  >
                  </button>
          </div>
          <div className="float-right">
            <NavButton
              title="Tips page"
              onClick={(e) => {
                router.push("./tips");
              }}
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="float-left self-center mt-20 flex cursor-pointer text-3xl">
          <button
                    className="h-0 w-0
                    border-t-[50px] border-t-transparent
                    border-r-[75px] border-r-swLightPurple
                    border-b-[50px] border-b-transparent
                    hover:border-r-swCyan"
                    onClick={prevPage}
                  >
                  </button>
                  <p className="self-center select-none ml-3" onClick={prevPage}>Back</p>
          </div>
          <div className="float-right self-center mt-20 flex cursor-pointer text-3xl">
          <p className="self-center select-none mr-3" onClick={nextPage}>Next </p>
          <button
                    type="submit"
                    className="h-0 w-0
                    border-t-[50px] border-t-transparent
                    border-l-[75px] border-l-swLightPurple
                    border-b-[50px] border-b-transparent
                    hover:border-l-swCyan"
                    onClick={nextPage}
                  >
                  </button>
                  
          </div>
        </>
      );
    }
  }

  /**
   * This is a layout for two elements.
   * Takes in three props
   * - title, a string.
   * - leftSide, which is an element or function.
   * - rightSide, which is an element or function.
   *
   * @param {*} props
   * @returns
   */
  function SplitPaneLayout(props) {
    return (
      <>
        <div className="bg-white">
          <h1 className="pt-5 text-center text-4xl font-semibold ">
            Your {props.title}
          </h1>
          <div className="mx-auto flex basis-1/2 flex-col px-0.5 py-0.5 sm:flex-row">
            <div className=" flex basis-2/5 flex-col gap-4 p-4">
              <p className="mx-auto   text-3xl font-semibold">
                - Past 7 Days -
              </p>
              {props.leftSide}
            </div>
            <div className=" flex basis-3/5 flex-col">
              <p className="mx-auto   text-3xl font-semibold">
                - Weekly Trends -
              </p>
              <div className="flex w-auto flex-col gap-4 p-8">
                {props.rightSide}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * This function that displays a center aligned element.
   * Takes in two props
   * - title, a string.
   * - center, the element that should be displayed.
   *
   * @param {*} props
   * @returns
   */
  function CenterLayout(props) {
    return (
      <>
        <h1 className="pt-5 text-center text-4xl font-semibold ">
          Your {props.title}
        </h1>
        <div className="mx-auto flex justify-center gap-4 p-8">
          {props.center}
        </div>
      </>
    );
  }

  /**
   * This is a navigation button.
   * It takes in two props
   * - title, the text to be displayed on the prop.
   * - onClick, the function to be called upon clicking the element.
   * As a result, functionality can be assigned fairly easily to this element.
   * It might be a good idea to create a common library of sorts for elements like these that are
   * used throughout the application.
   *
   * @param {*} props
   * @returns
   */
  function NavButton(props) {
    return (
      <button
        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
        onClick={props.onClick}
      >
        {props.title}
      </button>
    );
  }

  return (
    <Layout>
      {pageLayouts[page]}
      <div className="container relative inset-x-0 bottom-0 mx-auto">
        {navigationButtons()}
      </div>
    </Layout>
  );
}

