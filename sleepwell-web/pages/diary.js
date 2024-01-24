import React from 'react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, startAt } from 'firebase/firestore';
import db from '../components/Firebase';
import moment from 'moment';
import { AiFillExclamationCircle } from 'react-icons/ai';
import Layout from '../components/layout';
import { DigitalTimeSelector, DigitalDurationSelector } from '../components/DigitalTimeSelector';
import { TimeSelector, DurationSelector } from '../components/TimeSelector';
import Questionnaire from '../components/Questionnaire';
import useDarkMode from '../components/useDarkMode';

// Converts a number to a string padded with at least 2 digits. e.g. 3 becomes 03
function formatTwoDigits(countDown) {
	if (countDown) {
		return countDown.toString().padStart(2, '0');
	}
}


// Converts a 12 hour time value to 24 hour
function to24Hour(hour, merid) {
	return merid == "am" ? hour : hour + 12
}

// Returns true if the 24 hour time provided is between a specific range
// Inclusive
function inTimeRange(hour, range1, range2) {
	return hour >= range1 || hour <= range2
}

// Responsible for managing questions and communicating with the database manager class
class Form {
	constructor() {
		this.questions = [];
		this.currentQuestion = 0;
	}

	addQuestion(formRecord) {
		this.questions.push(formRecord);
	}

	getCurrentQuestion() {
		if (this.questions[this.currentQuestion] != null) {
			return this.questions[this.currentQuestion];
		}
	}

	previousQuestion() {
		this.currentQuestion = Math.max(this.currentQuestion - 1, 0);
	}

	nextQuestion() {
		this.currentQuestion = Math.min(this.currentQuestion + 1, this.questions.length - 1);
	}

	displayQuestion() {
		return <Questionnaire
				question = {this.getCurrentQuestion().questionStr}
				inputMethod = {this.getCurrentQuestion().displayMethod()}
				conditionalDisplay = {() => {}}
		/>
	}



	displaySubmit() {
		return (
			<div className="flex flex-col">
				<h1 className="flex justify-center pb-4">Review your entries:</h1>
				<br />
				{this.questions.map((question, index) => {
					return (
						<div key={index}>
							<h2 className="flex justify-center"> {String(index) + ". " + question.questionStr}</h2>
							<h3 className="flex justify-center">
								{question.toString()}
							</h3>
							<br/>
						</div>
					);
				})}
			</div>
		);
	}

	// Collects database-valid data from the questions and returns a diary record object
	getDiaryRecord() {
		// Creating the new Diary record
		const newDiaryRecord = {};
		const today = moment();
		newDiaryRecord.date = today.format('MM/DD/YYYY')

		// Adding question data to diary record
		for (let question of this.questions) {
			newDiaryRecord[question.dbKey] = question.toFirebaseObject();
		}

		return newDiaryRecord;
	}
}

class Question {
	constructor(questionStr, dbKey, data, conditionalMethod) {
		this.dbKey = dbKey;
		this.questionStr = questionStr;
		this.data = data;

		if (conditionalMethod != undefined) {
			this.conditional = conditionalMethod;
		} else {
			this.conditional = () => {};
		}
	}

	// Used by the Form class to prep a question for display
	// Expects an HTML object to be returned
	displayMethod() {
		throw("displayMethod() not implemented");
	}

	// Returns a value that meets firebases structure and naming convention expectations
	toFirebaseObject() {
		return this.data;
	}

	// Default toString for visual validation of new question types
	// Not intended for use in final product. Overwrite this in all child classes
	toString() {
		let dataStr = "";

		for (let dataHeader in this.data) {
			dataStr = dataStr + dataHeader + ":" + this.data[dataHeader] + ", ";
		}

		return dataStr;
	}
}

class TimeQuestion extends Question {
	constructor(questionStr, dbKey, hour, merid, conditional) {	
		super(questionStr, dbKey, {hour: hour, minute: 0, merid: merid}, conditional);
	}

	displayMethod() {
		return  <TimeSelector
			submitter={(data) => {
				this.data = data
				this.conditional(data)
			}}
			startHour={this.data["hour"]}
			startMerid={this.data["merid"]}
		/>
	}

	toString() {
		return this.data["hour"].toString().padStart(2, '0') + ":" + this.data["minute"].toString().padStart(2, '0') + " " + this.data["merid"]
	}
}

class DigitalSelection extends Question {
	constructor(questionStr, dbKey, conditional) {	
		super(questionStr, dbKey, {hour: 0, minute: 0, merid: "am"}, conditional)
	}

	displayMethod() {
		return  <DigitalTimeSelector
			submitter={(data) => {
				this.data = data
				this.conditional(data)
			}}
			startHour={this.data["hour"]}
			startMerid={this.data["merid"]}
		/>
	}

	toString() {
		return this.data["hour"].toString().padStart(2, '0') + ":" + this.data["minute"].toString().padStart(2, '0')
	}
}

class DurationQuestion extends Question {
	constructor(questionStr, dbKey, conditional) {	
		super(questionStr, dbKey, {hour: 0, minute: 0, merid: "am"}, conditional)
	}

	displayMethod() {
		return  <TimeSelector
			submitter={(data) => {
				this.data = data
				this.conditional(data)
			}}
			startHour={this.data["hour"]}
			startMerid={this.data["merid"]}
		/>
	}

	toString() {
		return this.data["hour"].toString().padStart(2, '0') + ":" + this.data["minute"].toString().padStart(2, '0')
	}
}

class DropdownQuestion extends Question {
	constructor(questionStr, dbKey, optionArray, conditional) {
		super(questionStr, dbKey, {number: 0}, conditional);

		this.optionArray =  optionArray;
	}

	displayMethod() {
		return <form
			onSubmit={(data) => {
				console.log(data);
				this.conditional(data)
			}}
			className="flex basis-1 flex-col items-center justify-center align-middle"
		>
			<select
				className="p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
				name="awakenings"
				id="awakenings"
				onChange={() => {
					this.data["number"] = document.getElementById('awakenings').value
				}}
			>
				{this.optionArray.map((num) => {
					// Formatting the display number
					let displayNumber = num;

					if (typeof num == "number" &&
						num == this.optionArray[this.optionArray.length - 1]) {
						displayNumber = String(displayNumber) + "+";
					}

					// Displaying the currently selected option
					if (num == this.data["number"]) {
						return <option
							value={String(num)}
							selected>
								{displayNumber}
						</option>
					} else {
						return <option
							value={String(num)}>
								{displayNumber}
						</option>
					}
				})}
			</select>
		</form>
	}

	toString() {
		return this.data["number"]
	}
}

class SecondDropdownQuestion extends Question {
    constructor(questionStr, dbKey, conditional) {
        // Set the options directly to ["Yes", "No"]
        super(questionStr, dbKey, {answer: ""}, conditional);
    }

    displayMethod() {
        return <form
            onSubmit={(data) => {
                console.log(data);
                this.conditional(data)
            }}
            className="flex basis-1 flex-col items-center justify-center align-middle"
        >
            <select
                className="p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                name="response"
                id="response"
                onChange={() => {
                    this.data["answer"] = document.getElementById('response').value
                }}
            >
                {/* Directly adding "Yes" and "No" options */}
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
        </form>
    }

    toString() {
        return this.data["answer"]
    }
}



const numberOptions = [0,1,2,3,4,5,6,7,8,9,10];
const newForm = new Form();

newForm.addQuestion(new TimeQuestion('What time did you go to bed last night?', "timeToBed", 6, 'pm'));
newForm.addQuestion(new TimeQuestion('What time did you try to go to sleep?', "timeTryToSleep", 6, 'pm'));
newForm.addQuestion(new TimeQuestion('What time did you fall asleep?', "timeToSleep", 10, 'pm'));
newForm.addQuestion(new DropdownQuestion('How many times did you wake up during the night?', "amountOfAwakenings", numberOptions));
newForm.addQuestion(new DurationQuestion('In total, how long did these awakenings last?', "totalAwakeningTime"));
newForm.addQuestion(new TimeQuestion('What time was your final awakening this morning?', "timeFinalAwake", 6, 'am'));
newForm.addQuestion(new TimeQuestion('What time did you get out of bed to start your day?', "timeOutOfBed", 6, 'am'));
newForm.addQuestion(new SecondDropdownQuestion('Did you nap yesterday?', "napped"));
newForm.addQuestion(new DigitalSelection('How long did you nap for?', "totalNapTime"));

export default function Diary(props) {
	const [isTimeInRange, setIsTimeInRange] = useState(true);	
	const [firstName, setFirstName] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);
	const [currentTime, setCurrentTime] = useState(moment().format('hh:mm ' )); 
	const [currentDate, setCurrentDate] = useState(moment().format('MMM DD,YYYY')); 
	const [currentMeridiem, setCurrentMeridiem] = useState(moment().format('a'));  // A for AM/PM
	const [currentDay, setCurrentDay] = useState(moment().format('dddd, '));  // dddd for full weekday name (e.g., 'Monday')
	const [countDown, setCountDown] = useState("");
	const [startDate, setStartDate] = useState("");
	const [darkMode, toggleDarkMode] = useDarkMode(); // Dark Mode State and Toggle Function
	const [displayMethod, setDisplayMethod] = useState(newForm.displayQuestion.bind(newForm)); // Current method being used to display the question
	const [isOpenBox, setIsOpenBox] = useState(false);
	const router = useRouter(); // Used for sending the user to other pages

	function setTimeWarning() {
		return (
			<div className="flex flex-col">
				<div className="warning"><AiFillExclamationCircle className='warningIcon' />Please review and confirm your entry before continuing.</div>
				<button className="learnMore" onClick={() => setIsOpenBox(true)}>Click here to learn more</button>
				{isOpenBox && (
					<div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full bg-swDarkGray bg-opacity-80">
					<div className="relative w-full h-full mx-auto max-w-2xl mt-40 md:h-auto">
						<div className="relative bg-white rounded-lg shadow border border-gray-600 dark:bg-swDarkGray">
							<div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
								<h3 className="text-xl font-semibold pl-1.5 text-orange-200">
									Website Usage
								</h3>
								<button type="button" className="text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="defaultModal" onClick={() => setIsOpenBox(false)}>
									<svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
									<span className="sr-only">Close modal</span>
								</button>
							</div>
							<div className="p-6 space-y-6">
								<h2>Unexpected reponse</h2>
								<p className="text-base leading-relaxed text-gray-800 dark:text-white">
								Please review and confirm your entry before continuing.
								</p>
							</div>
						</div>
					</div>
				</div>
				)}
			</div>
		)
	}

	// Updates the date and time in the top left
	useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(moment().format('hh:mm '));
        	setCurrentMeridiem(moment().format('a'));
        	setCurrentDay(moment().format('dddd, '));
        	setCurrentDate(moment().format('MMM DD,YYYY'));
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

	/*	Ensures that users are not entering data for the same day twice by checking for existing diary logs
		If one is found, it sends the user to the thank you page
	*/
	const diaryExistsForDate = () => {
		const auth = getAuth();

		onAuthStateChanged(auth, async (user) => {
			if (user && user.emailVerified) {
				const uid = user.uid;
				const diariesRef = collection(db, "users", uid, "diaries");
				const diariesSnapshot = await getDocs(diariesRef);
				const currentDate = moment(new Date());
				const userDocRef = doc(db, "users", user.uid);
				const userDoc = await getDoc(userDocRef);

				// Send users to the thank you page if they have already completed their diary today
				// TODO: Simplify once we get the new database
				diariesSnapshot.forEach((diaryDoc) => {
					const diaryDate = moment(diaryDoc.data(), "MM/DD/YYYY");

					if (currentDate.isSame(diaryDate, "day")) {
						router.push("./thankyou");
					}
				});

				if (userDoc.exists()) {
					setFirstName(userDoc.data().firstName);
				} else {
					console.log("Cannot find userDoc");
				}
			} else {
				// Send unverified users back to the verification page
				router.push("./verification");
			}
		});
	};

	useEffect(() => diaryExistsForDate(),[]);
	
	// Sets the diary day & week counter
	const getStartDate = () => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user){  
                const startDateRef = collection(db, "users", user.uid, "programStart")
                const startDateCollection = await getDocs(startDateRef)

                startDateCollection.forEach((doc) => {
                    setStartDate(doc.data().startDate)
				
					const startDateMoment = moment(new Date(startDate))
                    const currentDate = moment(new Date())
                    const dayDiff = currentDate.diff(startDateMoment, 'days')
                    
                    const weekCount = Math.floor(dayDiff/7) + 1
                    const dayCount = dayDiff % 7 + 1
					
                    setCountDown(dayCount)
                });
            } 
        })
    }

	useEffect(() => getStartDate(), [])
	

	// Temp database function to be used until we transition to the FirebaseManager class
	async function sendToDB(diaryRecord) {
		const auth = getAuth();
		const user = auth.currentUser;
		const today = moment();
		const startDateRef = collection(db, "users", user.uid, "programStart");
		const startDateCollection = await getDocs(startDateRef);
		const snapshot = startDateCollection.docs.pop();
		const startDateString = snapshot.data().startDate;
		const startDateMoment = moment(new Date(startDateString));
		const dayDiff = today.diff(startDateMoment, 'days') + 1;
		console.log(dayDiff,"=============")
		const diaryDoc = doc(db, 'users', user.uid, 'diaries', `${dayDiff}`);
		setDoc(diaryDoc, diaryRecord);
		router.push('./thankyou');
	}

	return (
		<>
			<Layout>
				<div className="container mx-auto p-8">
				<div className="p-6 rounded-md"> 
    				<div className={`text-2xl font-bold text-purple-500`}>{firstName}</div>
   				 	<div className={'darkMode ? "text-white" : "text-black"'}>{currentDay} {currentDate}</div>
    				<div className={'darkMode ? "text-white" : "text-black"'}>{currentTime} {currentMeridiem}</div>
					<div className={'darkMode ? "text-white" : "text-black"'}>Sleep diary <span className={`bg-pink-300 text-purple-600 px-2 py-1 ${darkMode ? "text-white" : "text-black"}`}>{formatTwoDigits(countDown)}</span></div>

				</div>
					<div className="container mb-12">
						<div id="sdWrapper" className="flex flex-col mx-auto">
							<div id="sdForm" className="grow text-3xl">
								<h1 className="flex justify-center p-3 text-5xl">Sleep Diary</h1>
								<br />
								{displayMethod}
							</div>
							
							<div id="sdButtons" className="flex flex-row justify-around">
								<div id="sdLButton" className="self-center mt-20 flex cursor-pointer text-3xl">
									<button
										className="h-0 w-0
										border-t-[50px] border-t-transparent
										border-r-[75px] border-r-swLightPurple
										border-b-[50px] border-b-transparent
										hover:border-r-swCyan"
										onClick={() => {
											newForm.previousQuestion();
											setDisplayMethod(newForm.displayQuestion());
										}}
									>
									</button>
									<p className="self-center select-none ml-3" onClick={newForm.previousQuestion.bind(newForm)}>Back</p>
								</div>
								<div id="sdRButton" className="self-center mt-20 flex cursor-pointer text-3xl">
									<p className="self-center select-none mr-3" onClick={newForm.nextQuestion.bind(newForm)}>{newForm.currentQuestion == newForm.questions.length ? 'Submit ' : 'Next'}</p>
									<button
										type="submit"
										className="h-0 w-0
										border-t-[50px] border-t-transparent
										border-l-[75px] border-l-swLightPurple
										border-b-[50px] border-b-transparent
										hover:border-l-swCyan"
										onClick={() => {
											if (newForm.currentQuestion == newForm.questions.length -1) { // Show submit page
												newForm.currentQuestion = newForm.questions.length;
												setDisplayMethod(newForm.displaySubmit());
											} else if (newForm.currentQuestion == newForm.questions.length) { // Submit to database
												sendToDB(newForm.getDiaryRecord());
											} else { // Next question
												newForm.nextQuestion();
												setDisplayMethod(newForm.displayQuestion());
											}
										}}
									>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</>
	);
}
