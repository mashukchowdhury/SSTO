import Router from 'next/router';
import Layout from '../components/layout';
import { collection, getDocs } from "firebase/firestore/lite";
import db from '../components/Firebase'
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';
import styles from '../styles/thankyou.module.css'

export default function ThankYou() {

    const [countDown, setCountDown] = useState("")
    const [showButton, setShowButton] = useState(false)
    const [startDate, setStartDate] = useState("")

    const toResult = () => {
        Router.push({
            pathname: '/results'
        })
    }

    const toPrescription = () => {
        Router.push({
            pathname: '/adjustPrescription'
        })
    }

    const getStartDate = () => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user){  
                if (!user.emailVerified) {
                    Router.push("./verification")
                }
                const startDateRef = collection(db, "users", user.uid, "programStart")
                const startDateCollection = await getDocs(startDateRef)

                startDateCollection.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    setStartDate(doc.data().startDate)

                    const startDateMoment = moment(new Date(startDate))
                    const currentDate = moment(new Date())
                    const dayDiff = currentDate.diff(startDateMoment, 'days')
                    
                    const weekCount = Math.floor(dayDiff/7) + 1
                    const dayCount = dayDiff % 7 + 1

                    setCountDown("Week " + weekCount + " Day " + dayCount)
                });
               
            } 
        })
    }

    const getDiaries = () => {
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                
                const diariesRef = collection(db, "users",user.uid, "diaries")
                const diaries = await getDocs(diariesRef)
                const diariesLength = diaries.docs.length
                if(diariesLength == 0){
                    return 
                }else{

                    const firstDay = startDate
                    const targetDate = moment(new Date(firstDay))
                    const currentDate = moment(new Date())

                    const dayDiff = currentDate.diff(targetDate, 'days') + 1;
                    
                    if (dayDiff % 7 === 0 && diariesLength > 2){
                        setShowButton(true)
                    }

                }
            }   
        });
    }
    
    useEffect(() => getStartDate(), getDiaries(), [])

    return (
        <Layout>
           <div className={styles.container}>
            <h1 className={styles.heading}>{countDown}</h1>
                <p>You have submitted your diary entry for today. {!showButton ? "Please come back again tomorrow.": "Remember to complete your diary entry everyday."}</p>
                <p>{showButton && "Checkout your progress."}</p>
                {
                    showButton &&
                    <div className='mt-6'>
                      <button className={styles.button} onClick={toResult}>
                             Continue to your results
                      </button>
                    </div>
                }
            {
                    showButton &&
                    <div className='mt-6'>
                      <button className={styles.button}
                            onClick={toPrescription}
                        >
                            Continue to your presicription
                        </button>
                    </div>
                }
            </div>
        </Layout>
    )
}
