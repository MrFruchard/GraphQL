import React from "react";
import "./UserInfo.css";

const UserInfo = ({ userData }) => {
  if (!userData) {
    return <div className="loading">Loading user data...</div>;
  }

  // Extraire les attributs utilisateur (qui pourraient être dans un format JSON)
  const userAttrs =
    typeof userData.attrs === "string"
      ? JSON.parse(userData.attrs || "{}")
      : userData.attrs || {};

  return (
    <div className="user-info-container">
      <div className="user-avatar">
        <div className="avatar-circle">
          {userData.firstName && userData.lastName
            ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
            : userData.login.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="user-details">
        <h2 className="user-name">
          {userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : userData.login}
        </h2>
        <p className="user-login">@{userData.login}</p>

        <div className="user-meta">
          <div className="meta-item">
            <span className="meta-label">User ID</span>
            <span className="meta-value">{userData.id}</span>
          </div>

          {userAttrs.email && (
            <div className="meta-item">
              <span className="meta-label">Email</span>
              <span className="meta-value">{userAttrs.email}</span>
            </div>
          )}

          {userAttrs.nationality && (
            <div className="meta-item">
              <span className="meta-label">Nationality</span>
              <span className="meta-value">{userAttrs.nationality}</span>
            </div>
          )}

          {userAttrs.campus && (
            <div className="meta-item">
              <span className="meta-label">Campus</span>
              <span className="meta-value">{userAttrs.campus}</span>
            </div>
          )}
        </div>
      </div>

      <div className="user-info-footer">
        <p className="info-note">
          Ces données sont récupérées via l'API GraphQL de Zone01. Explorez les
          autres onglets pour voir vos statistiques détaillées.
        </p>
      </div>
    </div>
  );
};

export default UserInfo;
