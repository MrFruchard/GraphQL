import { useState, useEffect } from "react";
import Login from "./components/Login";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si le token est présent au démarrage
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("jwt", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("jwt");
  };

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="app">
      {token ? (
        <Profile token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
