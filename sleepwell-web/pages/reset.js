import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "../components/Firebase";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Reset() {
  const emailRef = useRef();
  const auth = getAuth();
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState();

  function submitHandler(event) {
    event.preventDefault();

    const email = emailRef.current.value;

    setErrors(errorCheck(email));
    setSubmitted(true);
    setEmail(email);
  }

  function errorCheck(email) {
    const errorList = {};
    if (!email) {
      errorList.email = "Email is required";
    }

    return errorList;
  }

  useEffect(() => {
    if (Object.keys(errors).length === 0 && submitted) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          // when reset send to login
          // send to diary page
          alert(
            "A reset password link has been sent to this email. Check your Spam folder if it is not in your inbox."
          );
          router.push("./login");
        })
        .catch(() => {
          alert("We could not find an account registered with this email.");
        });
    }
  }, [errors]);

  return (
    <>
      <div className="grid h-screen grid-cols-2 text-2xl text-white">
        <div className="flex flex-col items-center justify-center bg-swDarkPurple">
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
        <div className="flex items-center justify-center bg-swDarkGray">
          <form className="m-12 w-full">
            <p className="mb-20 text-center text-5xl">Reset Password</p>
            <p className="mb-20 text-center">
              Forgot the password to your account? Enter your email and we will
              send you a link to reset your password (usually found in the spam
              folder).
            </p>
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
            <button
              type="submit"
              className="mb-12 mt-6 w-full rounded-lg bg-swCyan p-2"
              onClick={submitHandler}
            >
              Send Email
            </button>
            <p className="mt-6">
              Return to{" "}
              <a href="/login" className="text-swCyan underline">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
