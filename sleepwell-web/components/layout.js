//layout

import Link from "next/link";
import "./Firebase";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import useDarkMode from './useDarkMode';

export default function Layout({ children, href }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth();

  
  // Dark Mode State and Toggle Function
  const [darkMode, toggleDarkMode] = useDarkMode();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the user object in state
      } else {
        router.push("./login");
      }
    });

    return () => {
      // Unsubscribe from the auth state changes when component unmounts
      unsubscribe();
    };
    // Empty dependency array to run the effect only once on mount
  }, []);

  const winSize = useWindowSize();
  const [collapse, setCollapse] = useState(false);



  function signOutHandler() {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
        window.location.href = '/login';

      })
      .catch((error) => {
        console.error("Sign-out error:", error);
        const errorMessage = getErrorMessage(error);
        alert(`Sign-out failed. ${errorMessage}`);

        console.log(error);
      });
  }

  function getErrorMessage(error) {
    switch (error.code) {
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      // Add more cases as needed for specific error handling
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  return (
    // change the background color to white for remaining pages. 
    <div className={`flex min-h-screen flex-col ${darkMode ? "bg-swDarkGray text-white" : "bg-white text-black"}`}>
      <header className="sticky top-0 flex h-14 items-center justify-between bg-swDarkPurple font-semibold text-white">
        <div className="flex items-center">
          <img
            className="m-2"
            src="/Sleep-Therapy-Reverse.png"
            alt="Sleepwell"
            width="126"
            height="52"
          />
          <button
            onClick={toggleDarkMode}
            className="m-1 rounded-md bg-swDarkenedPurple p-2"
          >
            {darkMode ? "Light Mode 🔅" : "🌙 Dark Mode"}
          </button>
        </div>   
        <div className="flex">
          <button
            onClick={signOutHandler}
            className="m-1 rounded-md bg-swDarkenedPurple p-2"
          >
            Sign Out
          </button>
        </div>
      </header>
      <div className="flex flex-1 md:flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
// Hook
//Source: https://stackoverflow.com/questions/63406435/how-to-detect-window-size-in-next-js-ssr-using-react-hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== "undefined") {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
