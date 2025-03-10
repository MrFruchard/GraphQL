// Fonction pour se connecter à Zone01
async function loginZone() {
  const auth_URL = "https://zone01normandie.org/api/auth/signin";

  const login = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const credentials = `${login}:${password}`;
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

    // Récupérer directement le texte brut qui est le token
    const token = await response.text();

    // Enlever les guillemets si présents
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }

    console.log("Token brut:", token);
    console.log("Token nettoyé:", cleanToken);

    if (cleanToken && cleanToken.length > 0) {
      localStorage.setItem("zone01_token", cleanToken);

      // Affichage de la section profile
      if (typeof showProfileSection === "function") {
        showProfileSection();
      } else {
        // Fallback si la fonction n'est pas définie
        const loginSection = document.getElementById("login-section");
        const profileSection = document.getElementById("profile-section");

        if (loginSection) loginSection.style.display = "none";
        if (profileSection) profileSection.style.display = "block";
      }

      return cleanToken;
    } else {
      throw new Error("Pas de token dans la réponse");
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
}

// Fonction pour utiliser le token JWT dans les requêtes GraphQL
async function faireRequeteGraphQL(query, variables = {}) {
  const token = localStorage.getItem("zone01_token");

  if (!token) {
    throw new Error("Non connecté. Veuillez vous connecter d'abord.");
  }

  const response = await fetch(
    "https://zone01normandie.org/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }
  );

  return await response.json();
}

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem("zone01_token");

  // Afficher la section de connexion
  if (typeof showLoginSection === "function") {
    showLoginSection();
  } else {
    // Fallback si la fonction n'est pas définie
    const loginSection = document.getElementById("login-section");
    const profileSection = document.getElementById("profile-section");

    if (loginSection) loginSection.style.display = "block";
    if (profileSection) profileSection.style.display = "none";
  }
}

// Fonction pour extraire l'ID utilisateur du JWT
function getUserIdFromToken() {
  const token = localStorage.getItem("zone01_token");

  if (!token) {
    return null;
  }

  // Le JWT est composé de 3 parties séparées par des points
  // La deuxième partie contient les données (payload)
  try {
    const payload = token.split(".")[1];
    // Décoder la partie payload qui est en base64
    const decodedPayload = JSON.parse(atob(payload));
    // Retourner l'ID utilisateur (le nom exact de la propriété peut varier)
    return decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
}

// Gestionnaire d'événement pour le formulaire de connexion
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si un token existe déjà
  if (localStorage.getItem("zone01_token")) {
    // Afficher la section profile si l'utilisateur est déjà connecté
    if (typeof showProfileSection === "function") {
      showProfileSection();
    } else {
      const loginSection = document.getElementById("login-section");
      const profileSection = document.getElementById("profile-section");

      if (loginSection) loginSection.style.display = "none";
      if (profileSection) profileSection.style.display = "block";
    }
  }

  // Gestionnaire pour le formulaire de connexion
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Empêcher le formulaire de se soumettre normalement

      const loginResult = document.getElementById("login-result");
      if (loginResult) {
        loginResult.textContent = "Tentative de connexion...";
      }

      try {
        const token = await loginZone();

        if (loginResult) {
          loginResult.textContent = `Connexion réussie ! Token : ${token.substring(
            0,
            15
          )}...`;

          // Optionnel : afficher l'ID utilisateur
          const userId = getUserIdFromToken();
          if (userId) {
            loginResult.textContent += `\nID utilisateur : ${userId}`;
          }
        }
      } catch (error) {
        if (loginResult) {
          loginResult.textContent = `Erreur : ${error.message}`;
        }
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
        loginResult.textContent = "Déconnecté avec succès.";
      }
    });
  }
});
