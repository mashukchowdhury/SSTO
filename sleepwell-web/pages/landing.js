import Layout from '../components/layout';
import React, { useEffect, useState } from 'react';
import db from '../components/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import moment from 'moment';

export default function Landing(props) {
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const hour = moment().hour();
        if (hour < 12) {
            setGreeting('Good morning');
        } else if (hour < 17) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
        }

        // Fetch user's first name
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setFirstName(userDoc.data().firstName);
                }
            }
        });
    }, []);

    const handleBeginAssessment = () => {
        router.push('/diary');
    }

    return (
        <Layout>
            <div className="container mx-auto py-12 px-4 flex flex-col h-screen justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-5xl mb-6">{greeting}, {firstName}</h1>
                    <p className="text-4xl mb-6">
                        Welcome back！
                    </p>
                    <button
                        className="bg-swDarkPurple text-white py-2 px-6 rounded mt-4"
                        onClick={handleBeginAssessment}
                    >
                        Begin Assessment
                    </button>
                </div>
            </div>
        </Layout>
    )
    
    
}
