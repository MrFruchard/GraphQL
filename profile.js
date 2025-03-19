// Gestion du chargement et de l'affichage des données du profil

// Fonction principale pour charger toutes les données
async function loadProfileData() {
    try {
        // Afficher l'animation de chargement dans toutes les sections
        document.getElementById("xp-content").innerHTML = '<div class="loading">Chargement...</div>';
        document.getElementById("progress-content").innerHTML = '<div class="loading">Chargement...</div>';
        document.getElementById("audits-content").innerHTML = '<div class="loading">Chargement...</div>';

        // Récupérer toutes les données en une seule requête pour optimiser
        const userData = await getUserAllData();

        // Extraire les données pertinentes
        if (userData && userData.user && userData.user.length > 0) {
            const user = userData.user[0];

            // Afficher les informations utilisateur
            displayUserInfo(user);

            // Afficher les données XP avec cercle de niveau
            displayXPData(user);

            // Afficher les données de progression
            displayProgressData(user.finished_projects);

            // Afficher les données d'audit
            displayAuditData(user);

            // Générer les graphiques
            generateGraphs(user);
        } else {
            throw new Error("Données utilisateur non disponibles");
        }

    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        displayError("Une erreur s'est produite lors du chargement des données.");
    }
}

// Afficher les informations de l'utilisateur
function displayUserInfo(user) {
    const userInfoElement = document.getElementById("user-info");

    if (!userInfoElement || !user) {
        return;
    }

    let displayName = user.login;

    if (user.firstName && user.lastName) {
        displayName = `${user.firstName} ${user.lastName}`;
    }

    userInfoElement.textContent = `Profil de ${displayName}`;
}

// Afficher les données XP avec cercle de niveau
function displayXPData(user) {
    const xpContentElement = document.getElementById("xp-content");

    if (!xpContentElement || !user) {
        return;
    }

    // Prendre le total depuis la requête agrégée
    const totalXP = user.xpTotal?.aggregate?.sum?.amount || 0;

    // Déterminer le niveau actuel à partir des événements
    let currentLevel = 0;
    if (user.events && user.events.length > 0) {
        // Trouver le niveau le plus élevé
        user.events.forEach(event => {
            if (event.level > currentLevel) {
                currentLevel = event.level;
            }
        });
    }

    // Créer le cercle de niveau SVG
    const levelSVG = generateLevelCircle(currentLevel, totalXP);

    // Assembler le contenu
    xpContentElement.innerHTML = `
    <div class="level-xp-container">
        <div class="level-circle">
            ${levelSVG}
        </div>
        <div class="xp-summary">
            <div class="stat-item">
                <div class="stat-value">${totalXP.toLocaleString()}</div>
                <div class="stat-label">XP Totale</div>
            </div>
        </div>
    </div>
  `;
}

// Fonction pour générer le cercle de niveau SVG
function generateLevelCircle(level, totalXP) {
    // Couleurs pour le dégradé en fonction du niveau
    const getGradientColors = (level) => {
        if (level < 5) return { start: "#3498db", end: "#2980b9" }; // Bleu
        if (level < 10) return { start: "#2ecc71", end: "#27ae60" }; // Vert
        if (level < 15) return { start: "#f1c40f", end: "#f39c12" }; // Jaune/Orange
        if (level < 20) return { start: "#e74c3c", end: "#c0392b" }; // Rouge
        return { start: "#9b59b6", end: "#8e44ad" }; // Violet pour niveaux élevés
    };

    const colors = getGradientColors(level);

    // Taille et paramètres du SVG
    const size = 200;
    const radius = 80;
    const strokeWidth = 10;
    const centerX = size / 2;
    const centerY = size / 2;

    // Calculer le progrès vers le prochain niveau (simulation)
    const progressToNextLevel = Math.min(0.75, (totalXP % 10000) / 10000); // Exemple: 10000 XP par niveau
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference * progressToNextLevel;

    return `
    <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">
        <defs>
            <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${colors.start}" />
                <stop offset="100%" stop-color="${colors.end}" />
            </linearGradient>
        </defs>
        
        <!-- Cercle de fond -->
        <circle 
            cx="${centerX}" 
            cy="${centerY}" 
            r="${radius}" 
            fill="none" 
            stroke="#e6e6e6" 
            stroke-width="${strokeWidth}"
        />
        
        <!-- Cercle de progression -->
        <circle 
            cx="${centerX}" 
            cy="${centerY}" 
            r="${radius}" 
            fill="none" 
            stroke="url(#levelGradient)" 
            stroke-width="${strokeWidth}"
            stroke-dasharray="${dashArray} ${circumference}"
            stroke-dashoffset="0"
            transform="rotate(-90 ${centerX} ${centerY})"
        />
        
        <!-- Niveau central -->
        <text 
            x="${centerX}" 
            y="${centerY - 10}" 
            text-anchor="middle" 
            font-size="40" 
            font-weight="bold" 
            fill="#2c3e50"
        >${level}</text>
        <text 
            x="${centerX}" 
            y="${centerY + 20}" 
            text-anchor="middle" 
            font-size="16" 
            fill="#7f8c8d"
        >NIVEAU</text>
        
        <!-- Texte XP -->
        <text 
            x="${centerX}" 
            y="${centerY + 60}" 
            text-anchor="middle" 
            font-size="14" 
            fill="#95a5a6"
        >${Math.round(progressToNextLevel * 100)}% du lvl ${level + 1}</text>
    </svg>
    `;
}

// Afficher les données de progression
function displayProgressData(projectsData) {
    const progressContentElement = document.getElementById("progress-content");

    if (!progressContentElement || !projectsData) {
        return;
    }

    const finishedProjects = projectsData || [];

    // Calculer les statistiques
    const totalProjects = finishedProjects.length;

    // Trier les projets par date (du plus récent au plus ancien)
    const sortedProjects = [...finishedProjects].sort((a, b) => {
        return new Date(b.group.createdAt) - new Date(a.group.createdAt);
    });

// Et utilisation de sortedProjects au lieu de finishedProjects
    const recentProjects = sortedProjects.slice(0, 5);

    // Préparer l'affichage des derniers projets
    let projectsHTML = '';

    if (recentProjects.length > 0) {
        projectsHTML = `
      <table>
        <thead>
          <tr>
            <th>Projet</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${recentProjects.map(p => {
            const date = new Date(p.group.createdAt).toLocaleDateString();
            const status = p.group.status === 'finished' ?
                '<span class="badge badge-success">Terminé</span>' :
                '<span class="badge badge-danger">Échoué</span>';
            const pathParts = p.group.path.split('/');
            const projectName = pathParts[pathParts.length - 1] || p.group.path;

            return `
              <tr>
                <td>${projectName}</td>
                <td>${status}</td>
                <td>${date}</td>
              </tr>
            `;
        }).join('')}
        </tbody>
      </table>
    `;
    } else {
        projectsHTML = '<p>Aucun projet trouvé.</p>';
    }

    // Assembler le contenu
    progressContentElement.innerHTML = `
    <div class="progress-summary">
      <div class="stat-item">
        <div class="stat-value">${totalProjects}</div>
        <div class="stat-label">Projets terminés</div>
      </div>
    </div>
    ${projectsHTML}
  `;
}

// Afficher les données d'audit
function displayAuditData(user) {
    const auditsContentElement = document.getElementById("audits-content");

    if (!auditsContentElement || !user) {
        return;
    }

    // Récupérer les données d'audit
    const totalUp = user.totalUp || 0;
    const totalDown = user.totalDown || 0;
    const auditRatio = user.auditRatio || 0;

    // Assembler le contenu
    auditsContentElement.innerHTML = `
    <div class="audits-summary">
      <div class="stat-item">
        <div class="stat-value">${totalUp}</div>
        <div class="stat-label">Points donnés</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${totalDown}</div>
        <div class="stat-label">Points reçus</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${auditRatio.toFixed(1)}</div>
        <div class="stat-label">Ratio d'audit</div>
      </div>
    </div>
    <div class="audit-details">
      <p>Votre ratio d'audit est de <strong>${auditRatio.toFixed(1)}</strong>.</p>
      <p>Vous avez donné <strong>${totalUp}</strong> points et reçu <strong>${totalDown}</strong> points en audit.</p>
    </div>
  `;
}

// Fonction pour générer les graphiques avec les données optimisées
function generateGraphs(user) {
    if (!user) return;

    // Appeler la fonction de génération des graphiques
    if (typeof generateGraphs === "function") {
        generateGraphs(user);
    } else if (typeof window.generateGraphs === "function") {
        window.generateGraphs(user);
    }
}

// Afficher un message d'erreur
function displayError(message) {
    const sections = ["xp-content", "progress-content", "audits-content"];

    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.innerHTML = `<div class="error-message">${message}</div>`;
        }
    });
}

// Afficher l'animation de chargement
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80px;
      color: #999;
      font-size: 14px;
    }
    
    .error-message {
      color: #e74c3c;
      padding: 10px;
      background-color: #fee;
      border-radius: 6px;
      text-align: center;
      font-size: 14px;
    }
    
    .audit-details {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      font-size: 14px;
    }
    
    .level-xp-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px;
    }
    
    .level-circle {
      width: 200px;
      height: 200px;
      margin-bottom: 15px;
    }
  `;
    document.head.appendChild(style);
});