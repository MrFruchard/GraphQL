// xpDisplay.js - Version améliorée pour la gestion de l'affichage des données XP

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
    xpTotalElement.innerHTML = `
      <div class="xp-counter loading">
        <div class="xp-loader"></div>
        <span class="xp-label">Chargement des données...</span>
      </div>
    `;
    if (xpHistoryElement) xpHistoryElement.innerHTML = "";

    // Récupérer les données XP
    const xpData = await window.graphql.getUserXP();

    // Récupérer les données utilisateur pour le nom
    const userData = await window.graphql.getUserProfile();
    const userId = userData.user[0].id;

    // Récupérer des statistiques supplémentaires
    // Requête GraphQL pour obtenir tous les XP par projet
    const projectsXPQuery = `
      query {
        transaction(
          where: {
            type: {_eq: "xp"},
            userId: {_eq: ${userId}}
          }
        ) {
          id
          amount
          path
          createdAt
        }
      }
    `;

    const projectsXPData = await window.graphql.execute(projectsXPQuery);

    // Calculer le total d'XP
    const totalXP = xpData.transaction.reduce((sum, tx) => sum + tx.amount, 0);

    // Niveau approximatif (estimation)
    const level = Math.floor(Math.sqrt(totalXP / 100));

    // Calculer la progression vers le niveau suivant
    const currentLevelXP = Math.pow(level, 2) * 100;
    const nextLevelXP = Math.pow(level + 1, 2) * 100;
    const progressToNextLevel = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    // Afficher le total
    xpTotalElement.innerHTML = `
      <div class="xp-counter">
        <span class="xp-value">${totalXP.toLocaleString("fr-FR")}</span>
        <span class="xp-label">points d'expérience</span>
        <div class="xp-badge">
          <span class="xp-badge-label">
            <i class="fas fa-star"></i>Niveau ${level}
          </span>
        </div>
      </div>
      
      <div class="xp-progress-container">
        <div class="xp-progress-title">Progression vers le niveau ${level + 1}</div>
        <div class="xp-progress-bar">
          <div class="xp-progress-fill" style="--progress-width: ${progressToNextLevel}%"></div>
        </div>
        <div class="xp-progress-stats">
          <span>${totalXP.toLocaleString("fr-FR")} XP</span>
          <span>${nextLevelXP.toLocaleString("fr-FR")} XP</span>
        </div>
      </div>
    `;

    // Afficher l'historique si l'élément existe
    if (xpHistoryElement && xpData.transaction.length > 0) {
      displayXPHistory(xpData.transaction, xpHistoryElement);
    }

    // Ajouter le graphique XP dans le temps
    addXPTimeChart(projectsXPData.transaction);

  } catch (error) {
    console.error("Erreur lors du chargement des données XP:", error);
    const xpTotalElement = document.getElementById("xp-total");
    if (xpTotalElement) {
      xpTotalElement.innerHTML = `
        <div class="xp-counter error">
          <span class="xp-value">Erreur</span>
          <span class="xp-label">Impossible de charger les données XP</span>
        </div>
      `;
    }
  }
}

// Afficher l'historique des XP
function displayXPHistory(transactions, container) {
  // Limiter à 10 entrées
  const limitedHistory = transactions.slice(0, 10);

  let tableHTML = `
    <h3 class="xp-history-title">Dernières XP gagnées</h3>
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
        <td>
          <div class="xp-project-name">
            <span class="xp-project-icon">📂</span>
            ${projectName}
          </div>
        </td>
        <td class="xp-amount">+${xp.amount.toLocaleString("fr-FR")}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;

  // Animation d'apparition
  setTimeout(() => {
    const rows = container.querySelectorAll("tr");
    rows.forEach((row, index) => {
      row.style.animation = `fadeIn 0.3s ease-out ${0.05 * index}s forwards`;
      row.style.opacity = "0";
    });
  }, 100);
}

// Fonction pour ajouter un graphique XP au fil du temps avec SVG
function addXPTimeChart(transactions) {
  // Trier les transactions par date
  const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Calculer le cumul d'XP au fil du temps
  let cumulativeXP = 0;
  const dataPoints = sortedTransactions.map(tx => {
    cumulativeXP += tx.amount;
    return {
      date: new Date(tx.createdAt),
      cumulative: cumulativeXP
    };
  });

  // Si pas de données, ne pas créer de graphique
  if (dataPoints.length === 0) return;

  // Créer un conteneur pour le graphique si nécessaire
  let chartContainer = document.getElementById("xp-time-chart");
  if (!chartContainer) {
    chartContainer = document.createElement("div");
    chartContainer.id = "xp-time-chart";
    chartContainer.className = "xp-chart-container";

    // Ajouter un titre
    const title = document.createElement("h3");
    title.className = "xp-history-title";
    title.textContent = "Évolution de vos XP";

    // Trouver où insérer le graphique (après l'historique XP)
    const xpHistoryElement = document.getElementById("xp-history");
    if (xpHistoryElement && xpHistoryElement.parentNode) {
      xpHistoryElement.parentNode.insertBefore(title, xpHistoryElement.nextSibling);
      xpHistoryElement.parentNode.insertBefore(chartContainer, title.nextSibling);
    }
  }

  // Dimensions du graphique
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculer les échelles
  const xMin = dataPoints[0].date;
  const xMax = dataPoints[dataPoints.length - 1].date;
  const yMax = dataPoints[dataPoints.length - 1].cumulative;

  // Fonction pour convertir les dates en position X
  const getX = (date) => {
    return margin.left + ((date - xMin) / (xMax - xMin)) * innerWidth;
  };

  // Fonction pour convertir les valeurs XP en position Y
  const getY = (value) => {
    return margin.top + innerHeight - (value / yMax) * innerHeight;
  };

  // Créer des points de données pour la courbe
  let pathData = `M ${getX(dataPoints[0].date)} ${getY(dataPoints[0].cumulative)}`;

  dataPoints.forEach((point, i) => {
    if (i > 0) {
      pathData += ` L ${getX(point.date)} ${getY(point.cumulative)}`;
    }
  });

  // Générer les axes et les graduations
  // Axe X - Dates
  const xAxisY = margin.top + innerHeight;
  let xAxisTicks = '';

  // Calculer le nombre de mois entre la première et la dernière date
  const monthDiff = (xMax.getFullYear() - xMin.getFullYear()) * 12 + xMax.getMonth() - xMin.getMonth();

  // Déterminer un intervalle raisonnable pour les ticks (1, 2, 3 ou 6 mois)
  let monthInterval = 1;
  if (monthDiff > 24) {
    monthInterval = 6;
  } else if (monthDiff > 12) {
    monthInterval = 3;
  } else if (monthDiff > 6) {
    monthInterval = 2;
  }

  // Générer des ticks pour chaque mois selon l'intervalle
  let currentDate = new Date(xMin);
  while (currentDate <= xMax) {
    const x = getX(currentDate);
    const month = currentDate.toLocaleDateString('fr-FR', { month: 'short' });
    const year = currentDate.getFullYear();

    xAxisTicks += `
      <g class="tick" transform="translate(${x}, ${xAxisY})">
        <line y2="6" stroke="#888"></line>
        <text y="20" text-anchor="middle" fill="#666" font-size="12">${month}</text>
        ${currentDate.getMonth() === 0 ? `<text y="36" text-anchor="middle" fill="#666" font-size="12">${year}</text>` : ''}
      </g>
    `;

    // Avancer au prochain mois selon l'intervalle
    currentDate.setMonth(currentDate.getMonth() + monthInterval);
  }

  // Axe Y - XP
  const yAxisX = margin.left;
  let yAxisTicks = '';

  // Nombre de graduations sur l'axe Y
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const yValue = (yMax / numYTicks) * i;
    const y = getY(yValue);

    yAxisTicks += `
      <g class="tick" transform="translate(${yAxisX}, ${y})">
        <line x2="-6" stroke="#888"></line>
        <text x="-10" dy="0.32em" text-anchor="end" fill="#666" font-size="12">${Math.round(yValue).toLocaleString('fr-FR')}</text>
      </g>
    `;
  }

  // Créer le SVG
  const svg = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Lignes de grille -->
      <g class="grid-lines">
        ${Array(numYTicks + 1).fill().map((_, i) => {
    const y = getY((yMax / numYTicks) * i);
    return `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#eee" stroke-width="1" />`;
  }).join('')}
      </g>
      
      <!-- Axes -->
      <g class="axes">
        <!-- Axe X -->
        <line 
          x1="${margin.left}" 
          y1="${xAxisY}" 
          x2="${width - margin.right}" 
          y2="${xAxisY}" 
          stroke="#888" 
          stroke-width="1"
        />
        ${xAxisTicks}
        
        <!-- Axe Y -->
        <line 
          x1="${yAxisX}" 
          y1="${margin.top}" 
          x2="${yAxisX}" 
          y2="${margin.top + innerHeight}" 
          stroke="#888" 
          stroke-width="1"
        />
        ${yAxisTicks}
        
        <!-- Labels des axes -->
        <text 
          x="${margin.left + innerWidth / 2}" 
          y="${height - 5}" 
          text-anchor="middle" 
          fill="#666"
          font-size="14"
        >
          Date
        </text>
        
        <text 
          transform="rotate(-90)" 
          x="${-(margin.top + innerHeight / 2)}" 
          y="20" 
          text-anchor="middle" 
          fill="#666"
          font-size="14"
        >
          XP cumulées
        </text>
      </g>
      
      <!-- Ligne de progression XP -->
      <path 
        d="${pathData}" 
        fill="none" 
        stroke="#3366cc" 
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      
      <!-- Gradient pour l'aire sous la courbe -->
      <defs>
        <linearGradient id="xpAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3366cc" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#3366cc" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      
      <!-- Aire sous la courbe -->
      <path 
        d="${pathData} L ${getX(dataPoints[dataPoints.length - 1].date)} ${xAxisY} L ${getX(dataPoints[0].date)} ${xAxisY} Z" 
        fill="url(#xpAreaGradient)"
      />
      
      <!-- Points de données avec infobulle au survol -->
      ${dataPoints.filter((_, i) => i % Math.ceil(dataPoints.length / 20) === 0 || i === dataPoints.length - 1).map(point => `
        <circle 
          cx="${getX(point.date)}" 
          cy="${getY(point.cumulative)}" 
          r="4" 
          fill="#3366cc"
          stroke="white"
          stroke-width="2"
          class="data-point"
          data-date="${point.date.toLocaleDateString('fr-FR')}"
          data-xp="${point.cumulative.toLocaleString('fr-FR')}"
        />
      `).join('')}
    </svg>
  `;

  // Insérer le SVG dans le conteneur
  chartContainer.innerHTML = svg;
}