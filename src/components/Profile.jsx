import { useState, useEffect } from "react";
import {
  getUserProfile,
  getUserXP,
  getUserProgress,
  getUserResults,
  getUserAudits,
} from "../graphqlService";
import XpChart from "./XpChart";
import ProjectsChart from "./ProjectsChart";
import UserInfo from "./UserInfo";
import SkillsRadar from "./SkillsRadar";
import AuditRatio from "./AuditRatio";
import "./Profile.css";

const Profile = ({ token, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [xpData, setXpData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileData = await getUserProfile(token);
        setUserData(profileData.user[0]);

        // Use the user ID to fetch additional data
        const userId = profileData.user[0].id;

        // Fetch XP data
        const xpResult = await getUserXP(userId, token);
        setXpData(xpResult.transaction);

        // Fetch progress data
        const progressResult = await getUserProgress(userId, token);
        setProgressData(progressResult.progress);

        // Fetch results data
        const resultsResult = await getUserResults(userId, token);
        setResultsData(resultsResult.result);

        // Fetch audit data
        const auditResult = await getUserAudits(userId, token);
        setAuditData(auditResult.transaction);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    onLogout();
  };

  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Zone01 Profile</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="profile-nav">
        <ul>
          <li className={activeTab === "profile" ? "active" : ""}>
            <button onClick={() => setActiveTab("profile")}>Profile</button>
          </li>
          <li className={activeTab === "xp" ? "active" : ""}>
            <button onClick={() => setActiveTab("xp")}>XP & Progress</button>
          </li>
          <li className={activeTab === "skills" ? "active" : ""}>
            <button onClick={() => setActiveTab("skills")}>Skills</button>
          </li>
          <li className={activeTab === "audits" ? "active" : ""}>
            <button onClick={() => setActiveTab("audits")}>Audits</button>
          </li>
        </ul>
      </nav>

      <main className="profile-content">
        {activeTab === "profile" && <UserInfo userData={userData} />}

        {activeTab === "xp" && (
          <div className="charts-container">
            <div className="chart-section">
              <h2>XP Progression Over Time</h2>
              <XpChart xpData={xpData} />
            </div>
            <div className="chart-section">
              <h2>Projects PASS/FAIL Ratio</h2>
              <ProjectsChart resultsData={resultsData} />
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="skills-container">
            <h2>Skills Overview</h2>
            <SkillsRadar
              progressData={progressData}
              resultsData={resultsData}
            />
          </div>
        )}

        {activeTab === "audits" && (
          <div className="audits-container">
            <h2>Audit Performance</h2>
            <AuditRatio auditData={auditData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
