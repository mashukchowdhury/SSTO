import Layout from '../components/layout';
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function ThankYouEOW() {
  const router = useRouter();

  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      if (!user.emailVerified) {
					router.push("/verification")
				}
    } else {
      // redirect to login page
      router.push("./login");
    }
  });


  function signOutHandler() {
    signOut(auth)
      .then(() => {
        console.log("sign out success");
      })
      .catch((error) => {
        console.log(error);
      });
  }


  return (
    <Layout>
      <div className='flex h-full flex-col items-center justify-center p-20'>
        <h1 className='mb-5 text-2xl text-center sm:text-4xl'>Thankyou for completing your diary entry for today. <br /> Remember to complete your diary entry everyday for better results.</h1>
        <div className='mt-6'>
          <button
            className="rounded-md bg-swCyan px-5 py-3 text-2xl hover:bg-cyan-800"
            onClick={signOutHandler}
          >
            Signout
          </button>
        </div>
      </div>
    </Layout>
  )
} 
