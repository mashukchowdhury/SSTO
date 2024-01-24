//register

import RegisterForm from "../components/RegisterForm";
import db from "../components/Firebase";
import { useRouter } from "next/router";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, } from "firebase/firestore";
import React from "react";

export default function Register() {
    const router = useRouter();
    const auth = getAuth();

    // The login page is displayed, and the login status is blocked
    auth.onAuthStateChanged(user => {
        if (user) {
            router.push("./welcome")
        }
    })

    function addUser(userObj) {
        const usersDoc = doc(db, "users", auth.currentUser.uid);
        // Add a new document with the user's uid.
        setDoc(usersDoc, {
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            email: userObj.email, 
            sex: userObj.gender,
            age: userObj.age,
            timezone: userObj.timezone,
            country: userObj.country,
            emailReminders : userObj.reminder,
            uid: auth.currentUser.uid,
        });
    }

    function registerHandler(userObj) {
        createUserWithEmailAndPassword(auth, userObj.email, userObj.password)
            .then(() => {
                addUser(userObj);

                updateProfile(auth.currentUser, {
                    displayName: userObj.email,
                })
                .then(() => {
                    // Send verification email
                    sendEmailVerification(auth.currentUser)
                    .then(() => {
                        router.push("./verification");
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                console.log(error.code);
                console.log(error.message);
            });
    }

    return (
        <>
            <div className="flex flex-col xl:grid h-screen grid-cols-2 text-2xl text-white">
                <div className="flex flex-col items-center justify-center bg-swDarkPurple">
                    <img className="w-44 xl:w-auto xl:scale-75" src="./ST-by-mysleepwell-Reverse.png"></img>
                    <p className="px-20 pb-16 xl:pb-24 text-xs text-center xl:text-3xl text-gray-300">
                        Welcome to Sleepwell's Sleep Therapy.
                        <br/> <br/>
                        This is a 6 week sleep program program for people with insomnia -
                        people who have trouble getting to sleep or staying asleep.
                        <br/> <br/>
                        This program will help improve your sleep by fixing some of the
                        reasons you are having trouble sleeping, even if you have lived with
                        insomnia for a long time.
                    </p>
                </div>
                <div className="flex items-center justify-center bg-swDarkGray">
                    <RegisterForm registerUser={ registerHandler }/>
                </div>
            </div>
        </>
    );
}
