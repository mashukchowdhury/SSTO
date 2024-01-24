import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import "firebase/auth";
import "firebase/firestore";
import { doc, setDoc , query, where, orderBy, limit } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import moment from 'moment';

// Firebase project configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: "ssto-prod.firebaseapp.com",
    projectId: "ssto-prod",
    storageBucket: "ssto-prod.appspot.com",
    messagingSenderId: "485477129928",
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: "G-9ZGPMW0C0Y"
};

const application = initializeApp(firebaseConfig);
const database = getFirestore(application);
const userCollection = collection(database, "users");
const millisecondsPerDay = 86400000; // Used to calculate full days from Date object math

class FirebaseManager {
    static auth = getAuth();

    constructor() {
        this.userRecord = null;
    }

    getUid() {
        return this.auth.currentUser.uid
    }
    
    async signIn(email, password) {
        return await signInWithEmailAndPassword(this.auth, email, password)
    }

    async signOut() {
        return await signOut(this.auth)
    }

    async createUser(userObject) {
        let newUserData = {
            firstName: userObject.firstName,
            lastName: userObject.lastName,
            sex: userObject.sex,
            age: userObject.age,
            country: userObject.country,
            emailAddress: userObject.emailAddress,
            emailReminders: userObject.emailReminders,
            timezone: userObject.timezone
        }

        // Create user record
        return await setDoc(doc(database, "users", getUid()), newUserData).then(
            (result) => {
                // Create diary record
                setDoc(doc(database, "users", getUid(), "diaries"), {
                    currentWeek: [null, null, null, null, null, null, null],
                    pastWeeks: []
                }).then(
                    (result) => {
                        return this.fetchUserData(getUid())
                    },
                    (result) => {
                        throw new Error("Could not create diaries sub-collection for uid: " + String(getUid()))
                    }
                )
            },
            (result) => {
                throw new Error("Could not create user sub-collection for uid: " + String(getUid()))
            }
        )
    }

    async fetchUserData() {
        // Getting user record
        return await getDocs(query(userCollection, where("uid", "==", getUid()), limit(1))).then(
            (userSnapshot) => {
                if (userSnapshot.size > 0) {
                    userSnapshot.docs.forEach((userDoc) => {
                        // Getting diary record
                        getDocs(collection(database, "users", getUid(), "diaries")).then(
                            (diarySnapshot) => {
                                if (diarySnapshot.size > 0) {
                                    userSnapshot.docs.forEach((diaryDoc) => {
                                        this.userRecord = new UserRecord(userDoc.data(), diaryDoc.data());
                                        return userRecord;
                                    });
                                } else {
                                    throw new Error("Cannot find diary snapshot for uid: " + String(getUid()))
                                }
                            }
                        );
                    });
                } else {
                    throw new Error("Cannot find user snapshot for uid: " + String(getUid()))
                }
            }
        );
    }

    async addDiaryRecord(diaryRecord) {
        return await this.fetchUserData().then(
            (result) => {
                this.userRecord.addDiaryRecord(diaryRecord)

                setDoc(doc(database, "users", getUid(), "diaries"), this.userRecord.diaryData)
            }
        )
    }
}

/*
A snapshot of the user's presence on the database
Responsible for fast, local retrieval of information related to the user
*/
class UserRecord {
    constructor(userData, diaryData) {
        this.userData = userData
        this.diaryData = diaryData
    }

    //Returns the date that the user began recording diaries
    getStartDate() {
        if (this.diaryData.pastWeeks.length > 0 &&
            this.diaryData.pastWeeks[0][0] != null) {
                return new Date(this.diaryData.pastWeeks[0][0].date)
        } else {
            return null
        }
    }

    /*
    Returns the last date that the user recorded a diary
    Returns null if no diaries have been recorded
    */
    getLastDate() {
        let weekMerge = [this.diaryData.pastWeeks]
        weekMerge.push(this.diaryData.currentWeek)

        // Searching through weeks in reverse order
        for (let i = weekMerge.length - 1; i > 0; i--) {
            let indexedWeek = weekMerge[i]
            // Searching through days in reverse order
            for (let j = weekMerge.length - 1; j > 0; j--) {
                let indexedDay = indexedWeek[j]

                if (indexedDay != null) {
                    return Date(indexedDay.date)
                }
            }
        }

        return null;
    }

    /*
    Returns a number representing the day of the current week from 0-6
    Returns -1 if there are no entries in the current week
    Any numbers greater than 6 should be considered outside of that week
    */
    getDayOfWeek() {
        if (this.diaryData.currentWeek[0] != null) {
            // Getting a YYYY/MM/DD normalized date object representing today's date
            let today = new Date()
            today = new Date(today.getFullYear, today.getMonth(), today.getDate())

            // Calculating current position in week by subtracting current day by first day of week
            return (today - new Date(this.diaryData.currentWeek[0].date)) / millisecondsPerDay
        } else {
            return -1
        }
        
    }

    /*
    Returns an integer representing the amount of diaries that have been recorded
    Note: This will not count days without a diary entry
    */
    getDiaryStep() {
        let count = 0
        let weekMerge = this.getAllWeeks()

        for (let diaryRecord of weekMerge) {
            if (diaryRecord != null) {
                count++
            }
        }

        return count;
    }

    /*
    Utilizes the above methods to handle all aspects of diary record creation
    e.g. Creating new weeks, moving old weeks, etc.
    */
    addDiaryRecord(diaryRecord) {
        let dayOfWeek = getDayOfWeek()

        if (dayOfWeek >= 0 && dayOfWeek <= 6) {
            this.diaryData.currentWeek[dayOfWeek] = diaryRecord
        } else {
            // Send current week to past weeks table
            this.diaryData.pastWeeks.push(this.diaryData.currentWeek)

            // Prepare new week
            this.diaryData.currentWeek = [diaryRecord, null, null, null, null, null, null]
        }
    }

    getAllWeeks() {
        let weekMerge = [this.diaryData.pastWeeks]
        weekMerge.push(this.diaryData.currentWeek)

        return weekMerge
    }
}

export default FirebaseManager;