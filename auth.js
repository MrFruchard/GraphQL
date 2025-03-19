// Gestion de l'authentification

// Fonction pour se connecter à Zone01
async function login(username, password) {
  const auth_URL = "https://zone01normandie.org/api/auth/signin";
  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials);

  try {
    const response = await fetch(auth_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Identifiants invalides ou problème de connexion");
    }

    // Récupérer directement le texte brut qui est le token
    const token = await response.text();

    // Enlever les guillemets si présents
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }

    if (cleanToken && cleanToken.length > 0) {
      // Stocker le token
      localStorage.setItem("zone01_token", cleanToken);
      return { success: true, token: cleanToken };
    } else {
      throw new Error("Pas de token dans la réponse");
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return { success: false, error: error.message };
  }
}

// Fonction pour déconnecter l'utilisateur
function logout() {
  localStorage.removeItem("zone01_token");
  showLoginSection();
  return true;
}

// Fonction pour vérifier si l'utilisateur est connecté
function isLoggedIn() {
  return !!localStorage.getItem("zone01_token");
}

// Extraire l'ID utilisateur du JWT
function getUserIdFromToken() {
  const token = localStorage.getItem("zone01_token");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
}

// Afficher la section de connexion
function showLoginSection() {
  const loginSection = document.getElementById("login-section");
  const profileSection = document.getElementById("profile-section");

  if (loginSection) loginSection.style.display = "block";
  if (profileSection) profileSection.style.display = "none";
}

// Afficher la section profil
function showProfileSection() {
  const loginSection = document.getElementById("login-section");
  const profileSection = document.getElementById("profile-section");

  if (loginSection) loginSection.style.display = "none";
  if (profileSection) profileSection.style.display = "block";
}

// Gestion des événements lors du chargement
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si un token existe déjà
  if (isLoggedIn()) {
    showProfileSection();
    // Charger les données du profil (défini dans profile.js)
    if (typeof loadProfileData === "function") {
      loadProfileData();
    }
  }

  // Gestionnaire pour le formulaire de connexion
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const loginResult = document.getElementById("login-result");

      // Vérification basique des champs
      if (!usernameInput.value || !passwordInput.value) {
        loginResult.textContent = "Veuillez remplir tous les champs";
        loginResult.className = "result error";
        return;
      }

      // Afficher le message de tentative
      loginResult.textContent = "Tentative de connexion...";
      loginResult.className = "result";

      // Tenter la connexion
      const result = await login(usernameInput.value, passwordInput.value);

      if (result.success) {
        loginResult.textContent = "Connexion réussie!";
        loginResult.className = "result success";
        showProfileSection();

        // Charger les données du profil
        if (typeof loadProfileData === "function") {
          loadProfileData();
        }
      } else {
        loginResult.textContent = `Erreur: ${result.error}`;
        loginResult.className = "result error";
      }
    });
  }

  // Gestion du bouton de déconnexion
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      logout();
      const loginResult = document.getElementById("login-result");
      if (loginResult) {
        loginResult.textContent = "Vous avez été déconnecté.";
        loginResult.className = "result";
      }
    });
  }
});