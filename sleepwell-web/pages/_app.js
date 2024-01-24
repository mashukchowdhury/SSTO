import '../styles/globals.css';
import '../styles/responsive.css';
import '../styles/timeselector.css';

function MyApp({ Component, pageProps }) {
	const menuItems = [
		{
			href: '/dashboard',
			title: 'Dashboard',
		},
		{
			href: '/diary',
			title: 'Sleep Diary',
		},
		{
			href: '/login',
			title: 'Login',
		},
		{
			href: '/register',
			title: 'Register',
		},
		{
			href: '/reset',
			title: 'Reset Password',
		},
		{
			href: '/verification',
			title: 'Email Verification',
		},
	];
	return <Component {...pageProps} />;
}

export default MyApp;
