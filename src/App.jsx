import { useCallback, useEffect, useState } from "react";
import Home from "./pages/Home";
import SettingsPage from "./modules/settings/SettingsPage";
import {
  clearStoredSession,
  getCurrentUser,
  getStoredSession,
  login,
  persistSession,
  register,
} from "./api/auth";

function App() {
  const [start, setStart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOrbReady, setIsOrbReady] = useState(false);
  const [authState, setAuthState] = useState({
    status: "loading",
    user: null,
    accessToken: null,
    refreshToken: null,
  });

  const applySession = useCallback((session) => {
    persistSession(session);
    setAuthState({
      status: "authenticated",
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  }, []);

  const handleLogout = useCallback(() => {
    clearStoredSession();
    setAuthState({
      status: "guest",
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedSession = getStoredSession();

      if (!storedSession?.accessToken) {
        setAuthState({
          status: "guest",
          user: null,
          accessToken: null,
          refreshToken: null,
        });
        return;
      }

      try {
        const user = await getCurrentUser(storedSession.accessToken);
        setAuthState({
          status: "authenticated",
          user,
          accessToken: storedSession.accessToken,
          refreshToken: storedSession.refreshToken || null,
        });
      } catch {
        clearStoredSession();
        setAuthState({
          status: "guest",
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
    };

    void restoreSession();
  }, []);

  const handleLogin = useCallback(
    async (email, password) => {
      const session = await login(email, password);
      applySession(session);
      return session;
    },
    [applySession],
  );

  const handleRegister = useCallback(
    async (name, email, password) => {
      const session = await register(name, email, password);
      applySession(session);
      return session;
    },
    [applySession],
  );

  return (
    <div className="relative h-[100dvh] min-h-screen w-screen overflow-hidden bg-black">
      <Home
        start={start}
        setStart={setStart}
        openSettings={() => setShowSettings(true)}
        isOrbReady={isOrbReady}
        setIsOrbReady={setIsOrbReady}
        authStatus={authState.status}
        authUser={authState.user}
        authToken={authState.accessToken}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
