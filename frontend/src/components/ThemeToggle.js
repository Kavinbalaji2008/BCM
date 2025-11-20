// src/components/ThemeToggle.js
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { FaMoon, FaSun } from "react-icons/fa";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <IconButton onClick={toggleTheme} color="inherit" title="Toggle Theme">
      {darkMode ? <FaSun /> : <FaMoon />}
    </IconButton>
  );
}

export default ThemeToggle;
