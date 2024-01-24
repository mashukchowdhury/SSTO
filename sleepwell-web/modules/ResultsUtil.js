import moment from "moment";

const DATE_FORMAT = "MM-DD-YYYY h m a";



export function sumArray(array) {
    let sum = 0;
    array.forEach((value) => {
        sum += value;
    })
    return sum;
}
/*
 * need to take average times
 * times are stored as:
 * --> hour, minute, merid, datestring for specific dates
 * --> hour, minute for durations
 * 
 * 
 * average time to fall asleep
 * --> time fallen asleep - time went to bed
 * 
 * average time spent awake after falling asleep
 * --> number of naps * avg nap duration
 * 
 * average time spent awake in bed before starting day
 * --> time gotten out of bed - time woken up
 * 
 * average time spent asleep
 * --> time of final awakening - time fallen asleep
 * 
 * average time spent in bed
 * --> time gotten out of bed - time went to bed
 * 
 * - sleep efficiency
 * --> average time asleep / average time awake
 * 
 */

// difference between two dates, in ms
function getDateDifference(firstDate, secondDate) {
    return Math.abs(firstDate - secondDate);
}



function averageFromArray(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}


function convertDateStringToMoment(dateString) {
    return moment(dateString, DATE_FORMAT);
}

function getDateStringFromFields(date, hour, minute, merid) { // obtain from firebase
    return date + " " + hour + " " + minute + " " + merid;
}



// functions for calculating values for averaging later

// === //
// TODO: these 4 are the same... consolidate into a single function?
// differences in ms
function getTimeToFallAsleep(timeFallenAsleepString, timeWentToBedString) {
    var timeFallenAsleep = convertDateStringToMoment(fallenAsleepString);
    var timeWentToBed = convertDateStringToMoment(wentToBedString);

    var difference = getDateDifference(timeFallenAsleep, timeWentToBed);

    return moment.duration(difference);
}
function getTimeSpentInBedInMorning(timeOutOfBedString, timeWokenUpString) {
    var timeOutOfBed = convertDateToMoment(timeOutOfBedString);
    var timeWokenUp = convertDateStringToMoment(timeWokenUpString);

    var difference = getDateDifference(timeOutOfBed, timeWokenUp);

    return moment.duration(difference);
}
function getTimeAsleep(timeFinalAwakeningString, timeFallenAsleepString) {
    var timeFinalAwakening = convertDateStringToMoment(timeFinalAwakeningString);
    var timeFallenAsleep = convertDateStringToMoment(timeFallenAsleepString);

    var difference = getDateDifference(timeFinalAwakening, timefallenAsleep);

    return moment.duration(difference);
}
function getTimeInBed(timeOutOfBedString, timeWentToBedString) {
    var timeOutOfBed = convertDateStringToMoment(timeOutOfBedString);
    var timeWentToBed = convertDateStringToMoment(wentToBedString);

    var difference = getDateDifference(timeOutOfBed, timeWentToBed);

    return moment.duration(difference);
}
// === //


function getSleepEfficiency(avgTimeAsleep, avgTimeAwake) {
    return avgTimeAsleep / avgTimeAwake;
}
function getTimeAwakeAfterFallingAsleep(numberNaps, napDuration) {
    return numberNaps * napDuration;
}