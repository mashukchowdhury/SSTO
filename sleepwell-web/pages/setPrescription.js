import { useEffect, useState } from "react";
import Layout from "../components/layout";
import { TimeSelector } from '../components/TimeSelector';
import db from '../components/Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, setDoc, where, doc } from 'firebase/firestore';
import { useRouter } from "next/router";
import moment from "moment";
import styles from '../styles/setPrescription.module.css';

export default function SetPrescription() {
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
          // check which week it is to go to the correct page
          router.push("/adjustPrescription")
        }
      }
    })
  }

  useEffect(() => check(), []) 

  const [formData, setFormData] = useState({
    riseTime: {
      id: 1,
      time: {
        hour: 10,
        minute: 0,
        merid: 'pm',
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
        `Start improving you sleep by setting your target bed & rise times.`,
        `Let's get started with your first sleep prescription.`,
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
        `What time do you plan to go bed each night?`
      ],
      type: 'time',
      fields: [
        {
          key: `bedTime`,
          name: 'Bed time'
        }
      ]
    },
    {
      id: 4,
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

    const setDate = (data, field) => {
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
        return showResult(question)
    }
  }

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
