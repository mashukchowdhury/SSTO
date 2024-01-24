import Layout from '../components/layout';
import db from "../components/Firebase";
import { useRouter } from "next/router";
import {getAuth, sendEmailVerification,} from "firebase/auth";
import React from "react";

export default function Verification() {
    const router = useRouter();
    const auth = getAuth();

    // The login page is displayed, and the login status is blocked
    auth.onAuthStateChanged(user => {
        if (user) {
            if (user.emailVerified) {
                router.push("./welcome")
            }
        }
        else {
            router.push("./register");
        }
    })

    const handleEmailVerification = () => {
        const user = auth.currentUser;
        if (user) {
            sendEmailVerification(user)
            .then(() => {
                alert("Verification Email Sent");
            })
            .catch((error) => {
                console.log(error);
            });
        }
    };

    return (
        <>
            <Layout>
                <div className='verification container'>
                    <div className='verification-message'>
                        We have sent you an email to verify your account. Please check your inbox (or junk, clutter, etc.folders) and click the link. You can then log in to get started.
                    </div>
                    <div className='send-verification-btn'>
                        <button 
                            className="verificationCSS"
                            onClick={handleEmailVerification}
                        >
                            Send Verification Email again
                        </button>
                    </div>
                    
                </div>
                 
            </Layout>
        </>
    );
}