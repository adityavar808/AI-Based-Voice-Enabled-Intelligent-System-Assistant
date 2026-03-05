import { useState } from "react";
import Home from "./pages/Home";
import SettingsPage from "./modules/settings/SettingsPage";

function App() {
  const [start, setStart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOrbReady, setIsOrbReady] = useState(false);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">

      <Home
        start={start}
        setStart={setStart}
        openSettings={() => setShowSettings(true)}
        isOrbReady={isOrbReady}
        setIsOrbReady={setIsOrbReady}
      />

      {/* Settings Popup */}
      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}

    </div>
  );
}

export default App;