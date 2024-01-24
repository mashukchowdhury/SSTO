import { useEffect, useState, useContext } from "react";
import Layout from "../components/layout";
import { TimeSelector } from '../components/TimeSelector';

import db from '../components/Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, setDoc, where, doc } from 'firebase/firestore';
import { useRouter } from "next/router";
import moment from "moment";
import { diaryByWeeks } from "../components/Firebase";
import { getPrescriptions } from "./api/tips";


export default function AdjustPrescription() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const nextStep = () => setStep(step + 1)
  const back = () => setStep(step - 1)

  let diary = diaryByWeeks.reverse();
  const [prescription, setPrescription] = useState([]);

  useEffect(() => {

    getPrescriptions().then(res=>{            
        setPrescription(res)
    })
  }, []);
  
  // arrays of time to calculate from diaries
  let timeInBedInput = []
  let timeAsleepInput = []
  let sleepEfficiencyArray = [];
  let sleepEfficiencyAvg = [];
  let timeInBedAvg = [];

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

  // function calculate sleep efficiency of each day
  function sleepEfficiency(timeInBedArray, timeAsleepArray) {
    var calcArray = [];
  
    for (let index = 0; index < timeInBedArray.length; index++) {
      calcArray.push((timeAsleepArray[index] / timeInBedArray[index]) * 100);
    }
  
    return calcArray;
  }

  // function calculate sleeping time each day
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
      temp2 = converter(hoursFinalAwakeArray[i], meridFinalAwakeArray[i]);
  
      if (meridFallAsleepArray[i] == 'am') {
        temp1 = converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
        tot = temp2 * 60 - temp1 * 60 + minutesFinalAwakeArray[i] - minutesFallAsleepArray[i];
      }
      else {
        if (minutesFallAsleepArray[i] + minutesFinalAwakeArray[i] > 60) {
          temp1 = 23 - converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
        } 
        else {
          temp1 = 24 - converter(hourFallAsleepArray[i], meridFallAsleepArray[i]);
        }
        tot = temp2 * 60 + temp1 * 60 + minutesFinalAwakeArray[i] - minutesFallAsleepArray[i]
      }
        
      calcArray.push(tot / 60);
    }
    return calcArray;
  }

  // function calculate time spend in bed each day
  function calcTimeInBed(inputArray) {
    // returned array
    var calcArray = [];
  
    // temporary variables
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
      temp2 = converter(hourOutOfBedArray[i], meridOutOfBedArray[i]);
      
      if (meridToBedArray[i] == 'am') {
        temp1 = converter(hourToBedArray[i], meridToBedArray[i]);
        tot = temp2 * 60 - temp1 * 60 + minutesOutOfBedArray[i] - minutesToBedArray[i];
      }
      else {
        if (minutesToBedArray[i] + minutesOutOfBedArray[i] > 60) {
          temp1 = 23 - converter(hourToBedArray[i], meridToBedArray[i]);
        } 
        else {
          temp1 = 24 - converter(hourToBedArray[i], meridToBedArray[i]);
        }
        tot = temp2 * 60 + temp1 * 60 + minutesOutOfBedArray[i] - minutesToBedArray[i];
      }
      
      calcArray.push(tot / 60);
    }
  
    return calcArray;
  }

  function getAverage(inputArray) {
    var sum = 0;
    for (let index = 0; index < inputArray.length; index++) {
      sum += inputArray[index];
    }

    return sum / inputArray.length
  }

  // calculate and get sleep efficiency
  for (let i = 0; i < diary.length; i++) {
    timeInBedInput.push(calcTimeInBed(diary[i]));
    timeAsleepInput.push(calcSleepTime(diary[i]));

    sleepEfficiencyArray.push(sleepEfficiency(timeInBedInput[i], timeAsleepInput[i]));
    sleepEfficiencyAvg.push(getAverage(sleepEfficiencyArray[i]));
    timeInBedAvg.push(getAverage(timeInBedInput[i]));
    
    var weeklySleepEfficiency = Math.round(sleepEfficiencyAvg[sleepEfficiencyAvg.length - 1]);
    var dailyTimeInBed = timeInBedAvg[timeInBedAvg.length - 1].toFixed(2);
  }

  const [formData, setFormData] = useState({
    riseTime: {
      id: 1,
      time: {
        hour: 10,
        minute: 0,
        merid: 'am',
      },
    },
    bedTime: {
      id: 2,
      time: {
        hour: 10,
        minute: 0,
        merid: 'pm',
      },
    },
    message1: 'This is auto message 1.',
    message2: 'This is auto message 2.'
  })


  const questions = [
    {
      id: 1,
      content: [
        `Let's get together for your sleep prescription.`,
      ],
      type: `content`
    },
    {
      id: 2,
      content: [
        `What time do you plan to get out of bed every day for the next 7 days? `
      ],
      type: 'time',
      fields: [
        {
          key: `riseTime`,
          name: 'Rise time'
        }
      ],
    },
    {
      id: 3,
      content: [
        `Your sleep efficiency over the last 7 days was: ${weeklySleepEfficiency}%`,
      ],
      type: 'result',
      fields: [
        {
          key: `message1`,
          name: 'message1'
        }
      ]
    },
    {
      id: 4,
      content: [
        'message2'
      ],
      type: 'result',
      fields: [
        {
          key: `message2`,
          name: 'message2'
        }
      ]
    },
    {
      id: 5,
      content: [
        `Your Sleep Prescription for next week is:`
      ],
      type: 'result',
      fields: [
        {
          key: 'riseTime',
          name: 'Rise time'
        },
        {
          key: 'bedTime',
          name: 'Bed time'
        }
      ]
    }
  ]
 
  function getHour(time) {
    let hour = time;
    if (hour > 12) {
      hour = hour - 12;
    }

    return hour;
  }

  // function calculate difference between two time
  function timeDiff(riseTime, bedTime, bedTimeMeriad, additionalMinute) {
    var timeDiff;
    if (bedTimeMeriad == 'pm') {
      let temp = 24 - bedTime;
      timeDiff = temp + riseTime + additionalMinute;
    }
    else {
      timeDiff = riseTime - bedTime + additionalMinute;
    }

    return timeDiff;
  }

  // function calculate bedTime when users have low time in bed
  function bedtimeForLowTimeInBed(riseTime, additionalMinute) {
    let newBedTime = (riseTime - 7) + additionalMinute;
    return newBedTime;
  }

  // function calculate bedTime when users have great sleep efficiency
  // reduce 15 minutes from old bed time
  function bedtimeForGreatEfficiency(additionalMinute) {
    let newBedTimeMinute = additionalMinute - 15;
    if (newBedTimeMinute < 0) {
      newBedTimeMinute = 60 + newBedTimeMinute;
    }
    return newBedTimeMinute;
  }

  function bedtimeForLowEfficiency(additionalMinute) {
    let newBedTimeMinute = 15 + additionalMinute;
    if (newBedTimeMinute > 59) {
      newBedTimeMinute = 60 - newBedTimeMinute;
    }
    return newBedTimeMinute;
  }

  // sleep presciption adjustments based on previous weeks sleep efficiency
  function calculatePrescription() {
    // rise and bed time from previous prescription for calculation
    let bedTimeHour = prescription.bedTime.time.hour;
    let bedTimeMerid = prescription.bedTime.time.merid;
    let bedTimeMinute = prescription.bedTime.time.minute;

    let oldRiseTimeHour = prescription.riseTime.time.hour;
    let oldRiseTimeMerid = prescription.riseTime.time.merid;
    let oldRiseTimeMinute = prescription.riseTime.time.minute;
    var oldRiseTime = {hour: riseTimeHour, merid: riseTimeMerid, minute: riseTimeMinute}

    let riseTimeHour = formData.riseTime.time.hour;
    let riseTimeMerid = formData.riseTime.time.merid;
    let riseTimeMinute = formData.riseTime.time.minute;
    var riseTime = formData.riseTime.time;

    let convertedRiseTime = converter(oldRiseTimeHour, oldRiseTimeMerid);
    let convertedBedTime = converter(bedTimeHour, bedTimeMerid);

    var totalAdditionalMinute = bedTimeMinute + oldRiseTimeMinute;

    let adjustedBedTimeHour = bedTimeHour;
    let adjustedBedTimeMinute = bedTimeMinute;
    let adjustedBedTimeMerid = bedTimeMerid;

    let autoMessage1 = '';
    let autoMessage2 = '';

    let bedAndRiseTimeDiff = timeDiff(convertedRiseTime, convertedBedTime, bedTimeMerid, totalAdditionalMinute);

    // High sleep efficiency, low time in bed
    if (weeklySleepEfficiency >= 95 && dailyTimeInBed < 5.5) {
      autoMessage1 = "Too high?\nYour sleep efficiency is very high, possibly too high, and your time in bed is low. Can you spend more time in bed for a longer sleep?"
      autoMessage2 = "Go to bed at least 1 hour earlier this week."
      if (bedAndRiseTimeDiff < 6.5) {
        // adjust time in bed to 7 hours
        adjustedBedTimeHour = bedtimeForLowTimeInBed(riseTimeHour, riseTimeMinute);
      }
    }
    // Low time in bed
    else if (weeklySleepEfficiency < 95 && dailyTimeInBed < 5.5) {
      autoMessage1 = "Too little time in bed?\n You may be spending too little time in bed. If this bothers you, can you increase the amount of time you spend in bed?"
      autoMessage2 = "Go to bed at least 30 minutes earlier this week."
      if (bedAndRiseTimeDiff < 6.5) {
        // adjust time in bed to 7 hours
        adjustedBedTimeHour = bedtimeForLowTimeInBed(riseTimeHour, riseTimeMinute);
      }
    }
    // Great sleep efficiency
    else if (weeklySleepEfficiency < 95 && weeklySleepEfficiency >= 90 && dailyTimeInBed >= 5.5) {
      autoMessage1 = "Great result!\n When you are in bed you are spending most of your time asleep."
      if (bedTimeMinute < 15) {
        adjustedBedTimeHour = bedTimeHour - 1;
      }
      adjustedBedTimeMinute = bedtimeForGreatEfficiency(bedTimeMinute);
      autoMessage2 = "Go to bed at least 15 minutes earlier next week."
    }
    // Good sleep efficiency
    else if (weeklySleepEfficiency < 90 && weeklySleepEfficiency >=85 && dailyTimeInBed >= 5.5) {
      autoMessage1 = "Great result!\n When you are in bed you are spending most of your time asleep."
      autoMessage2 = "Keep the same bedtime as last week."
      if (JSON.stringify(oldRiseTime) != JSON.stringify(riseTime)) {
        // move bed time
        // make the time in bed as same as last week
        adjustedBedTimeHour = riseTimeHour + bedAndRiseTimeDiff;
      }
    }
    // Low sleep efficiency
    else if (weeklySleepEfficiency < 85 && weeklySleepEfficiency >=70 && dailyTimeInBed >= 5.5) {
      autoMessage1 = "Opportunity for improvement.\n Ideally, you should be spending a larger proportion of your time in bed asleep."
      // bed time + 15 min
      if (bedTimeMinute >= 45) {
        adjustedBedTimeHour = bedTimeHour + 1;
      }
      adjustedBedTimeMinute = bedtimeForLowEfficiency(bedTimeMinute); // Adding 15 minutes to the time in hours
      autoMessage2 = "Go to bed 15 minutes later each night next week."
    }
    // Very low sleep efficiency
    else if (weeklySleepEfficiency < 70 && dailyTimeInBed >= 5.5) {
      autoMessage1 = "Lots of opportunity for improvement.\n You are spending more time in bed while awake than is recommended. "
      if (bedTimeMinute >= 45) {
        adjustedBedTimeHour = bedTimeHour + 1;
      }
      adjustedBedTimeMinute = bedtimeForLowEfficiency(bedTimeMinute); // Adding 15 minutes to the time in hours
      autoMessage2 = "Go to bed 15 minutes later each night next week."
    }

    adjustedBedTimeHour = getHour(adjustedBedTimeHour);

      // update adjusted bedTime
      return({
        ...formData,
        bedTime: {
          ...formData.bedTime,
          time: {
            hour: adjustedBedTimeHour, 
            minute: adjustedBedTimeMinute, 
            merid: adjustedBedTimeMerid, 
          },
        },
        message1: autoMessage1,
        message2: autoMessage2,
      })
  
  }

  // Submit the edited data to firebase
  const sendToDB = async () => {
    const today = moment().format('MM/DD/YYYY')
    const auth = getAuth();
    const user = auth.currentUser;
    const userCollection = collection(db, 'users');
    const q = query(userCollection, where('uid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    const questions = await getPrescriptions()  
    const id = (questions.docs.length || 0 )+  1
 
    // Submitted data
    const data = {
      id,
      date: today, 
      ...formData
    } 
    setDoc(doc(db, 'users', user.uid, 'prescriptions', `${id}`), data);

    // Submit successfully, jump to the result page
    router.push('./thankyouEOW');

  }
 
  // Handle the event of button click
  const handleNextOrSubmitClick = () => {
    const isSubmit = step === questions.length
    if (isSubmit) {
      sendToDB()
    } else {
      nextStep()
    }
  }

  // TODO: apply logic and test if users have low data for the week, this div will be shown
  function isLowData() {
    return diary[diary.length - 1].length < 5;
  }

  // TODO: apply logic and test if users have low data for the week, this div will be shown
  function LowDataDiv() {
    return (
        <>
            <div className="text-3xl text-center">
                <h1 className="flex justify-center p-3 text-5xl font-bold">Missing information</h1>
                <br />

                <div className="flex flex-col justify-center">
                  <div className="flex justify-center pb-5">Your sleep prescription cannot be adjusted this week. Reason: not enough sleep diary entries. The minimum needed is 5</div>
                </div>
            </div>
            <div className="relative flex justify-center  m-20">
                <div className="mx-6 my-3 flex justify-between">
                    <button
                        type="submit"
                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                        onClick={()=>handleNextOrSubmitClick()}
                    >
                        {'Next'}
                    </button>
                </div>
            </div>
        </>
    )
  }


  // The last step is to display the results
  const showResult = (question) => {
    return step == questions.length && (
      <div className=" text-left px-4 md:px-0">
        <div className="mb-10">
          {
            question.fields.map(field => {
              const value = formData[field.key].time
              return (
                <div className="mt-2" key={field.key}>
                  <span className="pr-4">{field.name}:</span>
                  <span>{value.hour} : {value.minute || '00'} {value.merid}</span>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  // Get a form for each question
  const getForm = (question) => {

    const setData = (data, field) => {
      const currentData = formData[field]
      setFormData({
        ...formData,
        [field]: {
          id: currentData.id,
          time: data,
        }
      })
    }

    switch (question.type) {
      case 'time':
        return (
          question.fields.map(item => (
            <div className={question.fields.length > 1 ? 'mx-10 my-5 md:my-0' : ''} key={item.key}>
              <p className="mb-5">{item.name}</p>
              <TimeSelector submitter={(data) => setData(data, item.key)} />
            </div>
          ))
        )
      case 'result':
        return showResult(question)
    }
  }

  // Get current step
  const getStep = (stepId) => {
    const question = questions.find(step => step.id === stepId)
    return (
      <div key={question.id}>
        <div className="text-center text-3xl">
          {question.content && question.content.map((item, index) => {
            // conditionally change the content based on the stepId
            if(stepId === 3 && index === 0) {
              return (
                <>
                  <div className="mb-2 pb-5" key={item}>{item}</div>
                  <div className="mb-2" key={item}>{formData[question.fields[0].key]}</div>
                </>
              )
            }
            if(stepId === 4 && index === 0) {
              return <div className="mb-2" key={item}>{formData[question.fields[0].key]}</div>
            }
            return <div className="mb-2" key={item}>{item}</div>
          })}
  
          <div className="flex justify-center mt-10 flex-wrap">
            {getForm(question)}
          </div>
        </div>
      </div>
    )
  }
  
  useEffect(() => {
    if (step === 3) {
      const newFormData = calculatePrescription();
      setFormData(newFormData);
    }
  }, [step]);
    return (
      <>
        <Layout>
          <div className="container mx-auto mt-20">
            <div id="sdForm">
              <h1 className="flex justify-center text-5xl">{step === 1 && 'Adjust Sleep Prescription'}</h1>
              <br />
            </div>
            <div className="relative inset-x-0 bottom-0">
    
              {getStep(step)}
    
              <div id="sdButtons" className="mx-6 my-3 flex justify-between">
                <button
                  className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                  onClick={() => back()}
                  disabled={step === 1}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                  onClick={() => handleNextOrSubmitClick()}
                >
                  {step !== questions.length ? 'Next' : 'Submit'}
                </button>
              </div>
    
            </div>
          </div>
        </Layout>
      </>
    );
  }
  
