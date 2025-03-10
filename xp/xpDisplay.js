// xpDisplay.js - Gestion de l'affichage des données XP

// Définir la fonction showProfileSection globalement
function showProfileSection() {
  const loginSection = document.getElementById("login-section");
  const profileSection = document.getElementById("profile-section");

  if (loginSection) loginSection.style.display = "none";
  if (profileSection) profileSection.style.display = "block";
}

// Fonction pour afficher la section de connexion
function showLoginSection() {
  const loginSection = document.getElementById("login-section");
  const profileSection = document.getElementById("profile-section");

  if (loginSection) loginSection.style.display = "block";
  if (profileSection) profileSection.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  // On vérifie si l'utilisateur est connecté au chargement de la page
  if (localStorage.getItem("zone01_token")) {
    showProfileSection();
    loadXPData();
  }

  // Gestion du bouton de déconnexion
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      logout(); // Fonction existante dans log.js
      showLoginSection();
    });
  }
});

// Chargement des données XP
async function loadXPData() {
  try {
    // Vérifier si les éléments existent
    const xpTotalElement = document.getElementById("xp-total");
    const xpHistoryElement = document.getElementById("xp-history");

    if (!xpTotalElement) {
      console.error("Élément xp-total non trouvé");
      return;
    }

    // Afficher un message de chargement
    xpTotalElement.textContent = "Chargement des données XP...";
    if (xpHistoryElement) xpHistoryElement.innerHTML = "";

    // Récupérer les données XP
    const xpData = await window.graphql.getUserXP();

    // Calculer le total d'XP
    const totalXP = xpData.transaction.reduce((sum, tx) => sum + tx.amount, 0);

    // Afficher le total
    xpTotalElement.innerHTML = `
        <div class="xp-counter">
          <span class="xp-value">${totalXP.toLocaleString("fr-FR")}</span>
          <span class="xp-label">points d'expérience</span>
        </div>
      `;

    // Afficher l'historique si l'élément existe
    if (xpHistoryElement && xpData.transaction.length > 0) {
      displayXPHistory(xpData.transaction, xpHistoryElement);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données XP:", error);
    const xpTotalElement = document.getElementById("xp-total");
    if (xpTotalElement) {
      xpTotalElement.textContent = "Erreur lors du chargement des données XP";
    }
  }
}

// Afficher l'historique des XP
function displayXPHistory(transactions, container) {
  // Limiter à 10 entrées
  const limitedHistory = transactions.slice(0, 10);

  let tableHTML = `
      <h3>Dernières XP gagnées</h3>
      <table class="xp-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Projet</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
    `;

  limitedHistory.forEach((xp) => {
    const date = new Date(xp.createdAt).toLocaleDateString("fr-FR");

    // Extraire le nom du projet depuis le chemin
    let projectName = xp.path.split("/").pop();
    if (!projectName) {
      projectName = xp.path.split("/").slice(-2, -1)[0];
    }

    tableHTML += `
        <tr>
          <td>${date}</td>
          <td>${projectName}</td>
          <td class="xp-amount">${xp.amount}</td>
        </tr>
      `;
  });

  tableHTML += `
        </tbody>
      </table>
    `;

  container.innerHTML = tableHTML;
}
