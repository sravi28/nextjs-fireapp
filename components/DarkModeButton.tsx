/* eslint-disable @next/next/no-img-element */
import { useContext } from "react";
import { ThemeContext } from "../lib/context";

export default function DarkModeButton() {
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const ChangeMode = () => {
    const btnThemeElement = document.querySelector(".btn-theme") as HTMLElement;
    switch (isDarkMode) {
      case false:
        // Switch to light mode
        document.documentElement.style.setProperty("--color-bg", "#16213E");
        document.documentElement.style.setProperty("--color-text", "#eef0f1");
        document.documentElement.style.setProperty("--color-white", "#0F3460");
        document.documentElement.style.setProperty("--color-blue", "#3b49df");
        document.documentElement.style.setProperty(
          "--color-light-blue",
          "#537EC5"
        );
        document.documentElement.style.setProperty("--color-red", "#C74B50");
        document.documentElement.style.setProperty("--color-green", "#4E9F3D");
        document.documentElement.style.setProperty("--color-gray", "#3C4F65");
        btnThemeElement.style.backgroundColor = "var(--color-gray)";
        break;
      default:
        // Switch to dark mode
        document.documentElement.style.setProperty("--color-bg", "#eef0f1");
        document.documentElement.style.setProperty("--color-text", "#08090a");
        document.documentElement.style.setProperty("--color-white", "#ffffff");
        document.documentElement.style.setProperty("--color-blue", "#3b49df");
        document.documentElement.style.setProperty(
          "--color-light-blue",
          "#82ccdd"
        );
        document.documentElement.style.setProperty("--color-red", "#df3b3b");
        document.documentElement.style.setProperty("--color-green", "#29b658");
        document.documentElement.style.setProperty("--color-gray", "#b5bdc4");
        btnThemeElement.style.backgroundColor = "var(--color-light-blue)";
        break;
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      {isDarkMode && (
        <button title="Light mode" className="btn-theme" onClick={ChangeMode}>
          <img src={"/sun.png"} width="15px" alt="Light mode" />
        </button>
      )}

      {!isDarkMode && (
        <button title="Dark mode" className="btn-theme" onClick={ChangeMode}>
          <img src={"/moon.png"} alt="Dark mode" />
        </button>
      )}
    </>
  );
}
