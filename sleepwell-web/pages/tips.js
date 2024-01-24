import Layout from '../components/layout';
import React, { useState, useEffect } from 'react';
import {useRouter} from 'next/router';
import moment from 'moment'
import { createDiaryByWeeksArray } from "../components/Firebase";
import { getPrescriptions } from "./api/tips";
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const getWeeklyTimeDiff = (days, startCallback, endCallback) => {
    let hs = days.map(data => {

        let date = data.date
        
        let startTime = startCallback(data) || {}
        let endTime = endCallback(data) || {}

        let nextDate = startTime.merid === endTime.merid ? date : moment(date).add(1, 'd').format('MM/DD/YYYY')

        let startStr = `${date} ${startTime.hour}: ${startTime.minute} ${startTime.merid}`
        let endStr = `${nextDate} ${endTime.hour}: ${endTime.minute} ${endTime.merid}`
        const date1 = moment(startStr, "MM/DD/YYYY hh: mm A");
        const date2 = moment(endStr, "MM/DD/YYYY hh: mm A");
        const date3 = date2.diff(date1, "minute");
        const h = Math.round((date3 / 60) * 100) / 100
        return h
    });
    
    let total = hs.reduce((a, b) => a + b)

    return { total, source: hs }
}

export default function Tips() {
    const router = useRouter();
    const morning = router.query.morning;
    const night = router.query.night;
    const [tips, setTips] = useState(1);
    const [issuesIndex, setIssuesIndex] = useState(0);
    const [diaryByWeeks, setDiaryByWeeks] = useState([]);
    const [prescription, setPrescription] = useState([]);
    const [myAnswer, setMyAnswer] = useState('');

    const [myIssues, setMyIssues] = useState([]);

    
    const toNextPage = () => {
        // TODO: Check which week it is and push to the correct page, either /setPrescription or /adjustPrescription
        const prescriptions = getPrescriptions()
        // if at least 5 diaries are entered, and prescription already exists, allow users to adjust prescription
        if (prescriptions) {
            router.push({
                pathname: './adjustPrescription'
            })
        }
        // otherwise, move to thank you page (not enough diaries entered)
        else {
            router.push({
                pathname: './setPrescription'
            })
        }
    }

    useEffect(() => {

        getPrescriptions().then(res=>{            
            setPrescription(res)
        })


        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user){
                if (!user.emailVerified) {
					router.push("/verification")
				}
                createDiaryByWeeksArray(auth.currentUser.uid).then(res => {
                    setDiaryByWeeks(res.length > 0 ? res[res.length-1] : [])
                    // Call console.log('data', res.length > 0 ? res[res.length-1] : []) to see if the function returns the correct data
                })
            }
        })    
    }, []);

    useEffect(() => {
        getMyIssue()
    }, [diaryByWeeks, prescription]);

    //Logic of tips
    function stepUp(answer) {
        if (tips === 1) {
            if (morning === 'true' || night === 'true') {
                setTips(2);
            } else {
                setTips(3);
            }
        }
        if (tips === 2) {
            setTips(3);
        }
        if (tips === 3) {
            if (answer === 'yes') {
                setMyAnswer(answer)
            } else if (answer === 'no' ) {
                // setMyAnswer('no')
                setMyAnswer('')
                if(issuesIndex !== myIssues.length - 1) {
                    setIssuesIndex(issuesIndex + 1)
                } else {
                    toNextPage()
                }
            }
            if (!answer){
                setMyAnswer('')
                setIssuesIndex(issuesIndex + 1)
            } 
        }
        if (issuesIndex === myIssues.length - 1 && !answer && tips>1) toNextPage()
    }

    

    function morningDiv() {
        
        return <>
        <div className='morning-title'>
            <div className="text-3xl">
                <h1 className="flex justify-center p-3 text-5xl font-bold">Morning
                    tip</h1>
                <br />

                <div className={"flex justify-center"}>Get out of bed every
                    morning at your set rise time, not later.
                </div>
            </div>
            <div className="relative flex justify-center  m-20">
                <div className="mx-6 my-3 flex justify-between">
                    <button
                        type="submit"
                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                        onClick={()=>stepUp()}
                    >
                        {'Next'}
                    </button>
                </div>
            </div>
        </div>
            

        </>

    }

    function nightDiv() {

        return <>
            <div className="text-3xl">
                <h1 className="flex justify-center p-3 text-5xl font-bold tips-header">Nighttime
                    tip</h1>
                <br />

                <div className={"flex justify-center"}>Each night, go to bed at
                    your set bedtime (or later if not sleepy).
                </div>
            </div>
            <div className="relative flex justify-center  m-20">
                <div className="mx-6 my-3 flex justify-between">
                    <button
                        type="submit"
                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                        onClick={()=>stepUp()}
                    >
                        {'Next'}
                    </button>
                </div>
            </div>
        </>
    }   

    function LongNighttimeAwakeningsDiv() {
        
        return <>
            {
                !myAnswer  && (
                    <div className='question-title'>
                        <div className="text-3xl">
                            <h1 className="flex justify-center p-3 text-5xl font-bold">Question</h1>
                            <br />

                            <div className={"flex justify-center"}>Is being awake in the middle
                                of
                                night bothering you?
                            </div>
                        </div>
                        <div className="relative flex justify-center  m-20">
                            <div id="sdButtons" className="mx-6 my-3 flex justify-between">
                                <button
                                    type="submit"
                                    className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                    onClick={() => stepUp('yes')}
                                >
                                    {'Yes'}
                                </button>
                                <div style={{ width: 140 + "px" }}></div>
                                <button
                                    type="submit"
                                    className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                    onClick={() => stepUp('no')}
                                >
                                    {'No'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                myAnswer === 'yes' && (<div>
                    <div className="text-3xl">
                        <h1 className="flex justify-center p-3 text-5xl font-bold tips-header">Common Reasons For Disruptive Sleep</h1>
                        <br />
                        <div className='flex justify-center'>
                            <ul className='p-5 pl-20' style={{ listStyle: 'disc' }}>
                                <li>Going to sleep too early</li>
                                <li>Mind racing after waking up</li>
                                <li>Low daytime activeness / Long or late naps</li>
                                <li>Medication or stimulant substances (alcohol, nicotine, etc.) effects</li>
                                <li>Physical / Mental health problems</li>
                            </ul>
                        </div>

                    </div>
                    <div className="relative flex justify-center  m-20">
                        <div className="mx-6 my-3 flex justify-between">
                            <button
                                type="submit"
                                className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                onClick={()=>stepUp()}
                            >
                                {'Next'}
                            </button>
                        </div>
                    </div>
                </div>
                )
            }
        </>
    }

    function LowDataDiv() {
        return (
            <>
                <div className="text-3xl text-center">
                    <h1 className="flex justify-center p-3 text-5xl font-bold">Missing information</h1>
                    <br />

                    <div className={"flex justify-center"}>Try to complete your sleep diary every day for the next 7 days.
                    </div>
                </div>
                <div className="relative flex justify-center  m-20">
                    <div className="mx-6 my-3 flex justify-between">
                        <button
                            type="submit"
                            className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                            onClick={()=>stepUp()}
                        >
                            {'Next'}
                        </button>
                    </div>
                </div>
            </>
        )
    }

    function DelayedSleepOnsetDiv() {
        return <>
                    {
                        !myAnswer && <div className='question-title'>
                            <div className="text-3xl">
                                <h1 className="flex justify-center p-3 text-5xl font-bold">Question</h1>
                                <br />

                                <div className={"flex justify-center"}>Did you find it hard to fall asleep on some nights this past week?
                                </div>
                            </div>
                            <div className="relative flex justify-center  m-20">
                                <div id="sdButtons" className="mx-6 my-3 flex justify-between">
                                    <button
                                        type="submit"
                                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                        onClick={() => stepUp('yes')}
                                    >
                                        {'Yes'}
                                    </button>
                                    <div style={{ width: 140 + "px" }}></div>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                        onClick={() => stepUp('no')}
                                    >
                                        {'No'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        myAnswer === 'yes'  && (<div>
                            <div className="text-3xl">
                                <h1 className="flex justify-center p-3 text-5xl font-bold tips-header">Tips For Fall Asleep Faster</h1>
                                <br />

                                <div className='flex justify-center'>
                                    <ul className='p-5 pl-20' style={{ listStyle: 'disc' }}>
                                        <li>Don't go to bed before your set bedtime, even if tired</li>
                                        <li>Only go to bed when tired, even if past your set bedtime</li>
                                        <li>Leave your bedroom if not sleeping within 15 minutes, returning only when feeling sleepy</li>
                                        <li>Get up at your set rise time each morning to make falling asleep easier at night</li>
                                        <li>Only use your bed for sleep. Avoid reading, screentime, and other activities when in bed</li>
                                        <li>Go through what you need to think about and plan for the next day well before going to bed.</li>
                                    </ul>
                                </div>

                            </div>
                            <div className="relative flex justify-center  m-20">
                                <div className="mx-6 my-3 flex justify-between special-tips-button">
                                    <button
                                        type="submit"
                                        className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                        onClick={()=>stepUp()}
                                    >
                                        {'Next'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        )
                    }

        </>
    }

    //Use the variable of issuesIndex to determine which issue in the array should be rendered.
    function renderIssues () {

        let myIssue = myIssues[issuesIndex]
        if (myIssue == 'ErraticBedtime') return nightDiv()
        if (myIssue == 'ErraticRiseTime') return morningDiv()
        if (myIssue == 'LongNighttimeAwakenings') return LongNighttimeAwakeningsDiv()
        if (myIssue == 'LowData') return LowDataDiv()
        if (myIssue == 'DelayedSleepOnset') return DelayedSleepOnsetDiv()
        if (myIssue == 'back') {
            return toNextPage()
        }
    }
    
    /*
        1. Going to bed BEFORE set bedtime on 2 or more nights/week by 0.5 hours or more. 
        2. Weekly sleep efficiency <85%
        3. Weekly total time in bed ≥6.5 hours
    */
    function isErraticBedtime(days, weeklySleepEfficiency, weeklyTotalTimeInBed) {
        //return true
        const { bedTime = {} } = prescription
        
        // to bed BEFORE set bedtime
        let toBedDiffBedTime = getWeeklyTimeDiff(days, d => d['toBed'].time, () => bedTime.time)
        let isOverSetBedtimeArray = toBedDiffBedTime.source.filter(e=> e < 0)
        // call console.log(Math.abs(toBedDiffBedTime.total),isOverSetBedtimeArray.length,weeklySleepEfficiency,weeklyTotalTimeInBed)
        // to see the criteria variables
        return Math.abs(toBedDiffBedTime.total) > 0.5 && isOverSetBedtimeArray.length >=2 
                && weeklySleepEfficiency < 85 
                && weeklyTotalTimeInBed >= 6.5
    }


    /*
        1. Getting out of bed AFTER set rise time on 2 or more mornings/week by 0.5 hours or more
        2. Weekly sleep efficiency <85%
        3. Weekly total time in bed ≥6.5 hours
    */
    function isErraticRiseTime(days, weeklySleepEfficiency, weeklyTotalTimeInBed) {
        //return true
        const { riseTime = {} } = prescription

        // Getting out of bed AFTER set rise time
        let toBedDiffRiseTime = getWeeklyTimeDiff(days, d => d['outOfBed'].time, () => riseTime.time)  
        let isOverSetRisetimeArray = toBedDiffRiseTime.source.filter(e => e < 0)
        // call console.log('toBedDiffRiseTime', days, isOverSetRisetimeArray, riseTime.time) here to see the criteria variables
        return Math.abs(toBedDiffRiseTime.total) > 0.5 && isOverSetRisetimeArray.length >= 2  
            && weeklySleepEfficiency < 85 
            && weeklyTotalTimeInBed >= 6.5
    }


    /*
        1. Awake after falling asleep for ≥0.5 hr on 3 nights per week or more.
    */
    function isLongNighttimeAwakenings(days) {
        //return true
        
        let awokenLengthArray = days.filter(e => e.awokenLength.time.minute > 30 || e.awokenLength.time.hour > 0)
        return awokenLengthArray.length >= 3
    }
    /*
        1. If 4 or fewer complete sleep diary data entries in previous week 
    */
    function isLowData(days) {
        //return true
        return days.length <= 4
    }

    /*
        1. Time between Q2 (What time did you try to go to sleep) and Q3 (What time did you fall asleep) is >0.5 hours on 2 or more nights/per week. 
        2. Weekly sleep efficiency <85%
        3. Weekly total time in bed ≥6.5 hours
    */
    function isDelayedSleepOnset(days, weeklySleepEfficiency, weeklyTotalTimeInBed) {
        //return true
        let timeWeekltryFallAsleepTofallAsleep = getWeeklyTimeDiff(days, d => d['tryFallAsleep'].time, d => d['fallAsleep'].time)
        let isTimeWeekltryFallAsleepTofallAsleepArray = timeWeekltryFallAsleepTofallAsleep.source.filter(e => e > 0.5)

        return isTimeWeekltryFallAsleepTofallAsleepArray.length >= 2
            && weeklySleepEfficiency < 85
            && weeklyTotalTimeInBed >= 6.5
    }

    function getMyIssue() { 
        const days = JSON.parse(JSON.stringify(diaryByWeeks))
        
        let issues = []
        if (isLowData(days)) {
            // If the amount of data is too low, render only LowData
            issues.push('LowData')
        } else {
            // Weekly total time in bed
            let timeWeeklyInBed = getWeeklyTimeDiff(days, d => d['toBed'].time, d => d['outOfBed'].time )
            // Awake after falling asleep
            let timeWeeklyFallingAsleep = getWeeklyTimeDiff(days, d => d['fallAsleep'].time, d => d['finalAwake'].time)
            //  Weekly sleep efficiency
            let weeklySleepEfficiency = timeWeeklyFallingAsleep.total / timeWeeklyInBed.total * 100
            //  efficiency
            let weeklyTotalTimeInBed = timeWeeklyInBed.total - timeWeeklyFallingAsleep.total
            
            if (isErraticBedtime(days, weeklySleepEfficiency, weeklyTotalTimeInBed)) issues.push('ErraticBedtime')
            if (isErraticRiseTime(days, weeklySleepEfficiency, weeklyTotalTimeInBed)) issues.push('ErraticRiseTime')
            if (isLongNighttimeAwakenings(days)) issues.push('LongNighttimeAwakenings')
            if (isDelayedSleepOnset(days, weeklySleepEfficiency, weeklyTotalTimeInBed)) issues.push('DelayedSleepOnset')
            
            if(issues.length == 0) {
                issues.push('back')
            }
        }
        
        // Call console.log('issues', issues) here to checkout the list of issues
        setMyIssues(issues)
    }

    const [isShown, setIsShown] = useState({});
    const handleClick = (tipsNumber) => {
        setIsShown((prevIsShown) => ({
            ...prevIsShown,
            [tipsNumber]: !isShown[tipsNumber]
        }));
    };



    return (
        <>
            <Layout>
                {/* General tips */}
                <div className="flex flex-col justify-center h-full">
                    
                    {tips === 1 && (<>
                        <div className="text-3xl tips">
                            <h1 className="flex justify-center p-3 text-5xl font-bold ">Tips for getting a good night's sleep</h1>
                            <ul className='tips-list'>
                                <li className="tips-title"><button className="clickable" onClick={() => handleClick(1)}>Bed usage</button>
                                    {isShown[1] && (
                                        <div className="tips-shown">
                                            <p>Only use the bed for the following:</p>
                                            <div className="image-tips">
                                                <div className='column-images'>
                                                    <img src="./sick.jpg" alt="sick" width="200" height="250"></img>
                                                    <p>Sickness</p>
                                                </div>
                                                <div className='column-images'>
                                                    <img src="./sleep.jpg" id="sleep-img" alt="sick" width="300" height="300"></img>
                                                    <p>Sleep</p>
                                                </div>
                                                <div className='column-images'>
                                                    <img src="./sex.jpg" id="sex-img" alt="sick" width="300" height="500"></img>
                                                    <p>Sex</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    )}
                                </li> 
                                <li className="tips-title"><button className="clickable" onClick={() => handleClick(2)}>Not feeling sleepy?</button>
                                    {isShown[2] && (
                                        <div className="tips-shown">
                                            <p>Do not go to bed at your set bedtime if you are not feeling sleepy.</p>
                                            <p>Only go to bed when feeling ready to sleep, and not before your set bedtime.</p>
                                        </div>
                                    )}
                                </li>
                            
                                <li className="tips-title"><button className="clickable" onClick={() => handleClick(3)}>Cannot fall asleep?</button>
                                    {isShown[3] && (
                                        <div className="tips-shown">
                                            <p>If not sleeping after ~15 minutes, get out of bed and leave the bedroom.</p>
                                            <p>Go back to bed when feeling sleepy. Repeat as necessary.</p>
                                            <p>Get up no later than your set rise time to avoid oversleeping.</p>
                                        </div>
                                    )}
                                </li>
                            </ul>
                            
                        </div>
                        <div className="relative flex justify-center  m-20">
                            <div className="mx-6 my-3 flex justify-between">
                                <button
                                    type="submit"
                                    className="rounded-md bg-swCyan px-5 py-3 text-3xl hover:bg-cyan-800"
                                    onClick={()=>stepUp()}
                                >
                                    {'Next'}
                                </button>
                            </div>
                        </div>
                    </>)
                    }
                    {
                        tips === 2 && (
                            <div>
                                {morning === 'true' && morningDiv()}
                                {night === 'true' && nightDiv()}
                                
                            </div>
                        )
                    }

                    {tips === 3 && renderIssues()}


                </div>
            </Layout>
        </>
    );


}
