import { useState } from "react"
import Layout from "../components/layout"
import StarsRating from "react-star-rate"

import db from "../components/Firebase"
import { getAuth } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import styles from '../styles/feedback.module.css'

function TextInput({ defaultValue, setData, k }) {

  const [value, setValue] = useState(defaultValue)

  // Verify up to 50 words
  const handleChange = (e) => {
    const inputValue = e.target.value
    const wordCount = inputValue.split(' ').length
    if (wordCount <= 50) {
      setValue(inputValue)
      setData(k, inputValue)
    }
  }

  return (
    <textarea
      className="w-full rounded text-black p-2"
      rows="4"
      cols="50"
      placeholder="Type your note here."
      value={value} 
      onChange={handleChange} 
    />
  )
}

export default function FeedBack() {
  const [step, setStep] = useState(1)
  const nextStep = () => setStep(step + 1)
  const back = () => setStep(step - 1)

  // submit data
  const [formData, setFormData] = useState({
    question1: {
      question: "The Sleep Therapy program was easy to use.",
      answer: 0,
    },
    question2: {
      question:
        "I would recommend this program to other people experiencing insomnia.",
      answer: 0,
    },
    question3: {
      question: `The program helped me learn how to get a better night's sleep.`,
      answer: 0,
    },
    question4: {
      question:
        "What one thing should be changed to improve the Sleep Therapy Program? (50 words maximum)",
      answer: ``,
    },
    question5: {
      question:
        "What did you like the most about the Sleep Therapy Program? (50 words maximum)",
      answer: ``,
    },
  })

  const setData = (key, value) => {
    const form = JSON.parse(JSON.stringify(formData))
    form[key].answer = value
    setFormData(form)
  }

  // Please take a moment to give us some feedback about the program.
  function Step1() {
    return (
      <div className="px-4 md:px-0">
        <div className="text-center text-lg">
          <p>Thank you for using Sleepwell's Sleep Therapy.</p>
          <p className="mt-1">
            Please take a moment to give us some feedback about the program.
          </p>
        </div>
        <div className="max-w-[800px] mx-auto mt-20">
          <div className="mt-4">
            <div className="text-sm">
              The Sleep Therapy program was easy to use.
            </div>
            <StarsRating
              value={formData.question1.answer}
              onChange={(value) => setData("question1", value)}
            />
          </div>

          <div className="mt-4">
            <div className="text-sm">
              I would recommend this program to other people experiencing
              insomnia.
            </div>
            <StarsRating
              value={formData.question2.answer}
              onChange={(value) => setData("question2", value)}
            />
          </div>

          <div className="mt-4">
            <div className="text-sm">
              The program helped me learn how to get a better night's sleep.
            </div>
            <StarsRating
              value={formData.question3.answer}
              onChange={(value) => setData("question3", value)}
            />
          </div>
        </div>
      </div>
    )
  }

  // Just 2 more questions
  function Step2() {
    return (
      <div className="max-w-[800px] mx-auto mt-10 px-4 md:px-0">
        <div className="text-center text-3xl font-bold">
          <p>Just 2 more questions:</p>
        </div>
        <div className="mt-10">
          <div>
            What one thing should be changed to improve the Sleep Therapy
            Program? (50 words maximum)
          </div>
          <div className="mt-4 text-2xl">
            <TextInput 
              defaultValue={formData.question4.answer}
              setData={setData}
              k={'question4'}
            />
          </div>
        </div>

        <div className="mt-10">
          <div>
            What did you like the most about the Sleep Therapy Program? (50
            words maximum)
          </div>
          <div className="mt-4 text-2xl">
            <TextInput
              defaultValue={formData.question5.answer}
              setData={setData}
              k={'question5'}
            />
          </div>
        </div>
      </div>
    )
  }

  // Thank page
  function Step3() {
    return (
      <div>
        <h1 className="flex justify-center text-4xl mt-80 text-center text-xl">
          Thank you for your feedback.
        </h1>
      </div>
    )
  }

  // Get corresponding steps
  function getStep() {
    switch (step) {
      case 1:
        return Step1()
      case 2:
        return Step2()
      case 3:
        return Step3()
    }
  }

  const handleNextOrSubmit = async () => {
    if (step === 2) {
      const auth = getAuth()
      const user = auth.currentUser
      const coll = collection(db, "users", user.uid, "feedback")
      await addDoc(coll, formData)
    }

    nextStep()
  }

    return (
      <>
        <Layout>
        <div className={"container mb-12"}>
              {step === 1 && (
                <h1 className="flex justify-center text-5xl mb-3 font-bold">Feedback</h1>
              )}
              {getStep()}
              {step !== 3 && (
                 <div id="sdButtons" className="flex flex-row justify-around">

                  <div id="sdLButton" className="self-center mt-20 flex cursor-pointer text-3xl">
                  
                    {step !== 1 && (
                      
                      <button
                        className="h-0 w-0
                        border-t-[50px] border-t-transparent
                        border-r-[75px] border-r-swLightPurple
                        border-b-[50px] border-b-transparent
                        hover:border-r-swCyan"
                        
                        onClick={() => back()}
                      >
                      </button>
                      
                    )
                    
                    }

                    {step === 2 && (
                        <p className="self-center select-none ml-3">Back</p>
                      )}
                  
                  </div>

                  

                  <div id="sdRButton" className="self-center mt-20 flex cursor-pointer text-3xl">
                  <p className="self-center select-none ml-1">{step !== 2 ? "Next" : "Submit"}&nbsp;</p>
                      <button
                        type="submit"
                        className="h-0 w-0
                        border-t-[50px] border-t-transparent
                        border-l-[75px] border-l-swLightPurple
                        border-b-[50px] border-b-transparent
                        hover:border-l-swCyan"
                        onClick={() => handleNextOrSubmit()}
                      >
                        
                      </button>
                  </div>
                </div>
              )}
            </div>
        </Layout>
      </>
    )
  }
  