import { useState } from "react";
import Home from "./pages/Home";
import SettingsPage from "./modules/settings/SettingsPage";

function App() {
  const [start, setStart] = useState(false);
  const [view, setView] = useState("home"); // home | settings

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {view === "home" && (
        <Home
          start={start}
          setStart={setStart}
          openSettings={() => setView("settings")}
        />
      )}

      {view === "settings" && (
        <SettingsPage onClose={() => setView("home")} />
      )}
    </div>
  );
}

export default App;