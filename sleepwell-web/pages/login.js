import "../components/Firebase";
import { useRouter } from "next/router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc, collection, getDocs } from "firebase/firestore/lite";
import db from '../components/Firebase'
import { useState, useRef, useEffect } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function Login() {
  const router = useRouter();

  const emailRef = useRef();
  const passwordRef = useRef();
  const [user, setUser] = useState({});
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // method to toggle hide/show password
  const togglePass = () => {
    setShowPass(!showPass);
  };

  function submitHandler(event) {
    event.preventDefault();

    //Read the values
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    setUser({ email, password });

    // Check for errors
    setErrors(errorCheck(email, password));
    setSubmitted(true);
  }

  function errorCheck(email, password) {
    const errorList = {};

    // Error for if email name is empty
    if (!email) {
      errorList.email = "Email is required";
    }
    // Error for if password is empty
    if (!password) {
      errorList.pass = "Password is required";
    }

    return errorList;
  }

  async function loginUserHandler(userObj) {
    const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, userObj.email, userObj.password);
      }
      catch(error) {
        setErr("Email or password incorrect, try again");
      }
  }

  async function retrieveDiaryCount(uid){
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return 0;
      }
  
      const diariesRef = collection(db, "users", uid, "diaries");
      const diariesSnapshot = await getDocs(diariesRef);

      console.log(`Number of diaries: ${diariesSnapshot.size}`);
      return diariesSnapshot.size;

    } catch (error) {
      console.error("Error in retrieveDiaryCount: ", error);
      return 0;
    }
  }

  useEffect(() => {
    // If the user is logged in, redirect to the welcome -> diary -> thankyou page
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      if(user){
        router.push("./welcome")
      }
    })
  }, [])

  useEffect(() => {
    if (Object.keys(errors).length === 0 && submitted) {
      loginUserHandler(user);
    } 
  }, [submitted, errors]);

  return (
    <>
      <div className="flex w-screen sm:grid h-screen sm:grid-cols-2 sm:text-2xl text-white">
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center sm:bg-swDarkPurple">
          <img className="scale-75" src="./ST-by-mysleepwell-Reverse.png"></img>
          <p className="px-20 pb-24 text-center text-3xl text-gray-300">
            Welcome to Sleepwell's Sleep Therapy.
            <br /> <br />
            This is a 6 week sleep program program for people with insomnia -
            people who have trouble getting to sleep or staying asleep.
            <br /> <br />
            This program will help improve your sleep by fixing some of the
            reasons you are having trouble sleeping, even if you have lived with
            insomnia for a long time.
          </p>
        </div>
        <div className="w-full h-full sm:flex sm:items-center sm:justify-center bg-swDarkGray">
          <form className="m-12 mt-0 sm:mt-12 w-0.8 h-full sm:w-full sm:h-auto">
            <img className="scale-50 sm:hidden" src="./ST-by-mysleepwell-Reverse.png"></img>
            <p className="mb-12 text-center text-4xl sm:text-5xl">Login</p>
            <div className="mb-6">
              <label htmlFor="email" className="m-2">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-lg bg-gray-200 p-2 text-black"
                type="email"
                required
                name="email"
                placeholder="Email"
                ref={emailRef}
              />
              <p className="p-2 text-red-500">{errors.email}</p>
            </div>
            <div className="relative mb-6">
              <label htmlFor="pass" className="m-2">
                Password
              </label>
              <input
                className="mt-2 w-full rounded-lg bg-gray-200 p-2 text-black"
                type={showPass === false ? "password" : "text"}
                required
                name="pass"
                placeholder="Password"
                ref={passwordRef}
              />
              {showPass === false ? (
                <button type="button">
                  <MdVisibilityOff
                    className="absolute top-12 right-7 text-black"
                    onClick={togglePass}
                  />
                </button>
              ) : (
                <button type="button">
                  <MdVisibility
                    className="absolute top-12 right-7 text-black"
                    onClick={togglePass}
                  />
                </button>
              )}
              <p className="p-2 text-red-500">{errors.pass}</p>
            </div>
            <p className="p-2 text-red-500">{err}</p>
            <button
              type="submit"
              className="mb-6 mt-3 sm:mb-12 sm:mt-6 w-full rounded-lg bg-swCyan p-2"
              onClick={submitHandler}
            >
              Log In
            </button>
            <p className="mt-0 sm:mt-12">
              <a href="/reset" className="text-swCyan underline">
                Forgot Password?
              </a>
              <br />
              Don't have an account?{" "}
              <a href="/register" className="text-swCyan underline">
                Sign up now
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
