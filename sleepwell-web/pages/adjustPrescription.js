import { useEffect, useState } from "react";
import Layout from "../components/layout";
import { TimeSelector } from '../components/TimeSelector';

import db from '../components/Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, setDoc, where, doc } from 'firebase/firestore';
import { useRouter } from "next/router";
import moment from "moment";
import { diaryByWeeks } from "../components/Firebase";
moment().format();


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
let diary = diaryByWeeks.reverse();
// Arrays for storing stat calculations

let daysWithNapsArray = [];

let timeInBedArray = [];
let timeAsleepArray = [];


let timeInBedArrayAvg = [];
let timeAsleepArrayAvg = [];

  
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
  
  // This is where the calculation of all data occurs.
  for (let i = 0; i < diary.length; i++) {
    timeInBedArray.push(calcTimeInBed(diary[i]));
    timeAsleepArray.push(calcSleepTime(diary[i]));
    
  
    timeInBedArrayAvg.push(getAverage(timeInBedArray[i]));
    timeAsleepArrayAvg.push(getAverage(timeAsleepArray[i]));
   
  }
  
export default function adjustPrescription() {

  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const nextStep = () => setStep(step + 1)
  const back = () => setStep(step - 1)

  // Judge whether the existing data of the current user is greater than 1. If yes, return to the previous page
  const check = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user){
        if (!user.emailVerified) {
          router.push("./verification")
        }
        const prescriptions = await getPrescriptions()
        if (prescriptions && prescriptions.docs.length > 0) {
          // TODO: reroute to the adjust prescription page since a prescription already exists
           router.push("/thankyouEOW")
        }
      }
    })
  }

  useEffect(() => check(), []) 

  const [formData, setFormData] = useState({
    riseTime: {
      id: 1,
      time: {
        hour: 8,
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
    }
  })

  const questions = [
    {
      id: 1,
      content: [
        `Adjusting your sleep prescription.`
        
      ],
      type: `content`
    },
    {
      id: 2,
      content: [
        `What time do you plan to get out of bed every day for the next 7 days?`
      ],
      type: 'time',
      fields: [
        {
          key: `riseTime`,
          name: 'Rise time'
        }
      ]
    },
    {
      id: 3,
      content: [
        `Your average time asleep over the past 7 nights was:`
      ],
      type: `average`,
    },
    {
        id: 4,
        content: [
          `For the next 7 nights you will spend in bed:`
        ],
        type: `average`,
      },

    {
      id: 5,
      content: [
        `Your adjuested Sleep Prescription for next week is:`
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

 // Get Prescriptions from firebase
 const getPrescriptions = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if(!user) return 
  const prescriptionsRef = collection(db, "users", user.uid, "prescriptions");
  const prescriptions = await getDocs(prescriptionsRef)

  return prescriptions
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
  
    const setDate = (data, field) => {
      const currentData = formData[field]
    setFormData({
      ...formData,
      [field]: 
          { id:currentData.id, time: { hour: data.hour, minute: data.minute,merid:data.merid } }
       
     } )}
    

     function getMinStr(minute){
		if(minute == 0){
			return '00';
		}
		else if(minute == 5){
			return '05';
		}
		else{
			return minute;
		}
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
              <TimeSelector submitter={(data) => setDate(data, item.key)} startHour={6} startMerid={'am'} endHour={6} endMerid={'m'}/>
              
            </div>
          ))
        )
      case 'result':
        return ( <>
          <div className="flex flex-col">		
				<br />
						<div >
							<h2 className="flex justify-center"> </h2>
							<h3 className="flex justify-center">
								
              <div>Rise Time: {formData.riseTime.time.hour+':'+getMinStr(formData.riseTime.time.minute)+formData.riseTime.time.merid}
                        <p></p>

              Bed Time: {timeAsleepArrayAvg[timeAsleepArrayAvg.length - 1]>6?
                             formData.riseTime.time.hour-timeAsleepArrayAvg[timeAsleepArrayAvg.length - 1] +':'+getMinStr(formData.riseTime.time.minute)+ formData.riseTime.time.merid:
                             formData.riseTime.time.hour-6+':'+getMinStr(formData.riseTime.time.minute)+formData.riseTime.time.merid}
                             </div>
							</h3>
							<br />
						</div>
				
			</div>
        </>
		);
      case 'average':
         return(
           <>
                  <p className="mb-5">{toRealTime(timeAsleepArrayAvg[timeAsleepArrayAvg.length - 1])}</p>       
            </>
              )
         
    }}

  // Get current step
  const getStep = (stepId) => {
    const question = questions.find(step => step.id === stepId)
    return (
      <div key={step.id}>
        <div className="text-center text-3xl">
          {question.content && question.content.map(item => <div className="mb-2" key={item}>{item}</div>)}

          <div className="flex justify-center mt-10 flex-wrap">
            {getForm(question)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
        <Layout>
            <div className="container mx-auto p-8">
                <div id="sdForm" className="p-6 rounded-md">
                    <h1 className="flex justify-center p-3 text-5xl">{step === 1 ? 'Sleep Prescription' : 'Sleep Diary'}</h1>
                    <br />
                    {getStep(step)}
                </div>
                <div id="sdButtons" className="flex flex-row justify-around mt-20 text-3xl">
                    {step === 1 ? (
                        <div className="flex justify-center">
                            <button
                                className="rounded-md bg-swLightPurple px-5 py-3 hover:bg-swCyan"
                                onClick={() => nextStep()}
                            >
                                Start
                            </button>
                        </div>
                    ) : (
                        <>
                            <div id="sdLButton" className="flex cursor-pointer">
                                <button
                                    className="h-0 w-0
                                    border-t-[50px] border-t-transparent
                                    border-r-[75px] border-r-swLightPurple
                                    border-b-[50px] border-b-transparent
                                    hover:border-r-swCyan"
                                    onClick={() => back()}
                                >
                                </button>
                                <p className="self-center select-none ml-3" onClick={() => back()}>Back</p>
                            </div>
                            <div id="sdRButton" className="flex cursor-pointer">
                                <p className="self-center select-none mr-3">{step !== questions.length ? 'Next' : 'Submit'}</p>
                                <button
                                    type="submit"
                                    className="h-0 w-0
                                    border-t-[50px] border-t-transparent
                                    border-l-[75px] border-l-swLightPurple
                                    border-b-[50px] border-b-transparent
                                    hover:border-l-swCyan"
                                    onClick={() => handleNextOrSubmitClick()}
                                >
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    </>
);
}
