import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import "firebase/auth";
import "firebase/firestore";
import { query, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged} from "firebase/auth";
import moment from 'moment';

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

//Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "ssto-prod.firebaseapp.com",
  projectId: "ssto-prod",
  storageBucket: "ssto-prod.appspot.com",
  messagingSenderId: "485477129928",
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: "G-9ZGPMW0C0Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const colRef = collection(db, "users");
let diariesArray = []
let diaryByWeeks = [] // An array of array containing the number of weeks. 

const auth = getAuth(app);

getDocs(colRef).then((snapshot) => {
  let users = [];
  snapshot.docs.forEach((doc) => {
    users.push({ ...doc.data(), id: doc.id });
  });
});

async function getDiaries(uid) {
  // reset first
    diariesArray = []
    return new Promise((resolve) => {
        let array = []
        /*Get the diary data*/
          const testRef = collection(db, "users", uid, "diaries");
          getDocs(testRef).then((snapshot) => { // async
              snapshot.docs.forEach((doc) => {
                  array.push({ ...doc.data(), id: doc.id });
                  diariesArray.push({ ...doc.data(), id: doc.id });
            });
            // You can console.log(array) here to check the contents of the array
              resolve(array);
      });
    });
}

async function createDiaryByWeeksArray(uid){
  // Getting the program start date
  const startDateRef = collection(db, "users", uid, "programStart")
  const startDateCollection = await getDocs(startDateRef)
  if (startDateCollection.docs.length == 0){
    return [];
  }

  const startDateString = startDateCollection.docs.pop().data().startDate

  // Getting the number of weeks or iterations for the for loop
  const startDateMoment = moment(new Date(startDateString))
  const currentDate = moment(new Date())
  const dateDiff = currentDate.diff(startDateMoment, 'days')
  const weekCount = Math.ceil(dateDiff/7)
  let dayNum = 0  // var that we will use to create a range while querying

  for (let i = 0; i < weekCount; i++){
    let weekPlaceHolder = []  // Placeholder array for diary entries
    
    // Getting diary entries for each week
    const diariesRef = collection(db, "users", uid, "diaries")
    const preQuery = query(diariesRef, where('day', '>=', dayNum+1), where('day', '<=', dayNum+7), orderBy('day'))
    const diaries = await getDocs(preQuery)
    // Pushing diary entries for that week into an array
    diaries.forEach((doc) => {
      weekPlaceHolder.push(doc.data())
    })

    // Pushing an array of diary entries into another array.
    diaryByWeeks.push(weekPlaceHolder)
    dayNum = dayNum + 7
  }

  // You can call "console.log(diaryByWeeks)" here for testing
  return diaryByWeeks
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    
    // THIS IS THE DUMMY USER ACCOUNT UID -- replace before pushing to production.
    //const uid = user.uid;
    const uid = "kVZ5wLKolpT1p8hiIkNGLYEDqOr1";
    getDiaries(uid);
    localStorage.setItem('uid', uid)
    createDiaryByWeeksArray(uid);
    // ...
  } else {
    // User is signed out
    // ...
  }
});

export { db, createDiaryByWeeksArray, diariesArray, getDiaries, diaryByWeeks, firebase };

export default db;
