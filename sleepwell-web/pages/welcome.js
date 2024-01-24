import Layout from '../components/layout';
import { useEffect, useState } from 'react';
import React from 'react';
import db from '../components/Firebase';
import { doc, collection, getDocs, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import moment from 'moment';

import styles from '../styles/welcome.module.css';

const myStyle = {
    
    marginLeft: "10%",
    padding: "30px",
    fontFamily: "Arial",
    textAlign: "justify"
};

export default function Welcome(props) {

    const router = useRouter();
    const [isChecked, setIsChecked] = useState(false);
    const [step, setStep] = useState(1);
    const [stepStr, setStepStr] = useState('step_' + step + '()');
    const [isInit, setIsInit] = useState(false);
    const TOTAL_PAGES = 3;
    const [darkMode, setDarkMode] = useState(false);
   
    const handleChange = (event) => {
        setIsChecked(event.target.checked)
    };

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const Checkbox = ({ label, value, onChange }) => {
        return (
          <div onClick={() => onChange({ target: { checked: !value } })}>
            <label>
              <input type="checkbox" checked={value} onChange={() => {}} />
              {label}
            </label>
          </div>
        );
      };
      

    // This function checks if the user has any diary entry which would mean that they have completed the welcome page.
    function checkRedirect() {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // if (!user.emailVerified) {
                //  router.push("/verification")
                // }
                const authId = user.uid;
                const diariesRef = collection(db, "users", authId, "diaries");
                const diaries = await getDocs(diariesRef);
                const diariesLength = diaries.docs.length;
                if(diariesLength > 0){
                  return router.push("/landing")
                }
                setIsInit(true)
            }
        });
    }

    useEffect(() => checkRedirect(),[])

    async function setProgramStartDate() {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
              const programStartRef = doc(db, "users", user.uid, "programStart", "startDate");
                            const startDateString = moment(new Date()).format("MM/DD/YYYY")
                            try {
                                await setDoc(programStartRef, {startDate: startDateString});                    
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    })
    }


    function stepUp() {
        if (isChecked && isInit && step == 3){
            setProgramStartDate().then(() => {
                router.push("/landing");
            })
        
    }
        //Don't allow to step above defined steps
        if (step < TOTAL_PAGES) {
            setStep(step + 1);
            setStepStr('step_' + (step + 1) + '()');
        }
    }

    function stepDown() {
        //Don't allow to step below defined steps
        if (step > 1) {
            setStep(step - 1);
            setStepStr('step_' + (step - 1) + '()');
        }
    }


    function buttonsContainer() {
        if (step === 1) {
            return <div id="sdButtons" className={styles.buttonsContainerFirstStep}>{buttons()}</div>;
        } else {
            return <div id="sdButtons" className={styles.buttonsContainer}>{buttons()}</div>;
        }
    }

    function buttons() {
        return (
            <>
                {step !== 1 &&
                    <button className={styles.backButton} onClick={stepDown}>Back</button>
                }
                <button
                    id="nextStep"
                    className={`${styles.button} ${!isChecked && step === 3 ? styles.disabledButton : ''}`}
                    onClick={stepUp}
                    disabled={!isChecked && step === 3}
                >
                    {step < 3 ? 'Next' : 'Start'}
                </button>

              
            </>
        );
    }

    return (
        <>
            <Layout>
                <div className="container w-full">
                    <div id="sdForm" className="text-3xl">
                        <h1 className={styles.pageTitle}>Sleepwell's Sleep Therapy</h1>
                        {eval(`step_${step}()`)}
                    </div>
                    <div className="relative inset-x-0 bottom-0">{buttonsContainer()}</div>
                </div>
            </Layout>
        </>
    );

    // p.1

    // p.1
    function step_1() {
            
        return (
            <div className={'flex justify-center ${darkMode ? "bg-swDarkGray text-white" : "bg-white text-black"}'}
            style={myStyle}>
                <p className="px-10 pb-4 text-xl sm:text-2xl"><b>Sleepwell's Sleep Therapy</b> is a 6-week progressive insomnia treatment program. You will be using behavioural treatment techniques to improve your sleep. This involves completing a sleep diary every day, which takes about a minute. At the end of each week, you will see your sleep scores and how they have been changing over the weeks while you are in the program. After the first week, you will be given advice to help you sleep better and you will be asked to set a morning rise time and a nightly bed time. Thereafter, these will be adjusted to help you get the most out of your time in bed.  </p> 
            </div>
        );
    }

    // p.2
    function step_2() {
            
        return (
            <div className={'flex justify-center ${darkMode ? "bg-swDarkGray text-white" : "bg-white text-black"}'}
            style={myStyle}>
                <p className="px-10 pb-4 text-xl sm:text-2xl">One of the insomnia treatment techniques used in this program is <b><em>bedtime restriction therapy </em></b>(also known as time-in-bed restriction therapy). This sleep scheduling method starts in week 3. It is effective for people with chronic or recurrent forms of insomnia, including those who live with other physical and/or mental health issues. The sleep scheduling component of the program can cause some people to  feel moderately under-slept and may lead to feelings of daytime tiredness or frustration for a few days. It is included because it is an important behavioural treatment method, especially if you find that your mind races when lying in bed trying to sleep. </p>
            </div>
        );
    }

    //p.3
    function step_3() {
            
        return (
            <div className={'flex flex-col myStyle ${darkMode ? "bg-swDarkGray text-white" : "bg-white text-black"}'}
            style={myStyle}>
                
                <p className="px-10 pb-4 text-xl sm:text-2xl"><b>The program is not for everyone.</b> It is not recommended for people under 16 years of age or people with dementia or other forms of cognitive impairment. Consult with your health care provider before using the sleep scheduling component of this program (starting in week 3) if you live with epilepsy, bipolar disorder, or another health condition that can be made worse by temporarily restricting or losing sleep. </p>
                <div>
                    <div className="flex justify-center items-center text-xl sm:text-2xl" >
                        <label>
                            <input id="default-checkbox" type="checkbox" value="" className="mx-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={isChecked} onChange={handleChange} />
                            I have read and understood the information and am ready to START
                        </label>
                    </div>
                </div>
            </div>
        );
    }
    
    

}


