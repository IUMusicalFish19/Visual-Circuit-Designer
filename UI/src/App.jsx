import Auth from "./components/pages/auth.jsx";
import Main from "./components/pages/mainPage.jsx";
import Profile from "./components/pages/profile.jsx";

import "@xyflow/react/dist/style.css";

import "./CSS/variables.css";
import "./CSS/App.css";
import "./CSS/settings.css";
import "./CSS/toolbar.css";
import "./CSS/dnd.css";
import "./CSS/backdrop.css";
import "./CSS/circuitsMenu.css";
import "./CSS/contextMenu.css";
import "./CSS/auth.css";
import "./CSS/button.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./components/pages/mainPage/switch.jsx";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.documentElement.style.setProperty("--ttime", "0s");

    // Через небольшой таймаут или requestAnimationFrame возвращаем нормальное значение
    const timeout = setTimeout(() => {
      document.documentElement.style.setProperty("--ttime", "0.3s");
    }, 50); // Можно регулировать время

    return () => clearTimeout(timeout); // Очистка таймаута при размонтировании
  }, []);

  return (
    <Router>
      <div style={{ height: "100%" }}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Main />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
