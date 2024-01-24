import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import '../components/Firebase';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from 'next/router';

export default function Home() {
	const router = useRouter();

	//Access Control
	const auth = getAuth();
	const user = auth.currentUser;
	onAuthStateChanged(auth, (user) => {
		if (user) {
			// User is signed in
			router.push('./diary');
		} else {
			// redirect to login page
			router.push('./login');
		}
	});

	return (
		<div>
			<h1>Sleepwell Tracker</h1>
		</div>
	);
}
