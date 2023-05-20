import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeContext, UserContext } from "../lib/context";
import { useUserData } from "../lib/hooks";
import { useState } from "react";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const userData = useUserData();
  const [isDarkMode, setIsDarkMode] = useState(true);
  return (
    <UserContext.Provider value={userData}>
      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <Navbar />
        <Component {...pageProps} />
        <Toaster />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

export default MyApp;
