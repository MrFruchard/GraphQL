// skills-display.js - Gestion de l'affichage des compétences

document.addEventListener("DOMContentLoaded", function () {
    // Charger les données de compétences si l'utilisateur est connecté
    if (localStorage.getItem("zone01_token")) {
        loadSkillsData();
    }
});

// Chargement des données de compétences
async function loadSkillsData() {
    try {
        // Vérifier si l'élément existe
        const skillsContentElement = document.getElementById("skills-content");

        if (!skillsContentElement) {
            console.error("Élément skills-content non trouvé");
            return;
        }

        // Afficher un message de chargement
        skillsContentElement.innerHTML = `
      <div class="skills-loading">
        <div class="skills-loader"></div>
        <p>Analyse de vos compétences en cours...</p>
      </div>
    `;

        // Récupérer les données de compétences
        const skillsData = await window.skillsServices.getSkillsData();

        // Afficher les compétences
        displaySkills(skillsData, skillsContentElement);

    } catch (error) {
        console.error("Erreur lors du chargement des données de compétences:", error);
        const skillsContentElement = document.getElementById("skills-content");
        if (skillsContentElement) {
            skillsContentElement.innerHTML = `
        <div class="skills-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Erreur lors du chargement des compétences</p>
        </div>
      `;
        }
    }
}

// Affichage des compétences
function displaySkills(skillsData, container) {
    // Vérifier si des compétences sont disponibles
    if (!skillsData || skillsData.length === 0) {
        container.innerHTML = `
      <div class="skills-empty">
        <i class="fas fa-code"></i>
        <p>Aucune compétence détectée pour le moment.<br>Continuez à travailler sur des projets pour développer vos compétences!</p>
      </div>
    `;
        return;
    }

    // Préparer le contenu HTML
    let html = `<div class="skills-container">`;

    // Ajouter une carte résumée
    html += `
    <div class="skills-summary">
      <h3 class="skills-summary-title">Vue d'ensemble</h3>
      <div class="skills-summary-content">
        <div class="skills-radar-chart" id="skills-radar-container">
          <!-- Le graphique radar sera ajouté ici par SVG -->
        </div>
        <div class="skills-stats">
          <div class="skills-stat-item">
            <span class="skills-stat-value">${getTotalSkillsCount(skillsData)}</span>
            <span class="skills-stat-label">Compétences</span>
          </div>
          <div class="skills-stat-item">
            <span class="skills-stat-value">${getTopSkillLevel(skillsData)}</span>
            <span class="skills-stat-label">Niveau max</span>
          </div>
          <div class="skills-stat-item">
            <span class="skills-stat-value">${skillsData.length}</span>
            <span class="skills-stat-label">Catégories</span>
          </div>
        </div>
      </div>
    </div>
  `;

    // Ajouter chaque catégorie de compétences
    skillsData.forEach(category => {
        html += `
      <div class="skills-category" data-category="${category.id}">
        <h3 class="skills-category-title">
          <i class="fas ${category.icon}"></i> ${category.title}
        </h3>
        <div class="skills-grid">
    `;

        // Ajouter chaque compétence
        category.skills.forEach(skill => {
            html += `
        <div class="skill-card" data-skill="${skill.name.toLowerCase()}">
          <div class="skill-header">
            <h4 class="skill-name">${skill.name}</h4>
            <div class="skill-level">
              ${generateStars(skill.level)}
            </div>
          </div>
          <div class="skill-info">
            <div class="skill-progress">
              <div class="skill-progress-bar" style="width: ${skill.level * 20}%"></div>
            </div>
            <div class="skill-xp">XP: ${skill.xp.toLocaleString('fr-FR')}</div>
            <div class="skill-projects">
              <span class="skill-projects-count">${skill.projects.length} projet${skill.projects.length > 1 ? 's' : ''}</span>
              <div class="skill-projects-list">
                ${skill.projects.slice(0, 3).map(project => `<span class="skill-project-badge">${formatProjectName(project)}</span>`).join('')}
                ${skill.projects.length > 3 ? `<span class="skill-project-badge skill-more-projects">+${skill.projects.length - 3}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
        });

        html += `
        </div>
      </div>
    `;
    });

    html += `</div>`;

    // Ajouter le HTML au conteneur
    container.innerHTML = html;

    // Générer le graphique radar
    setTimeout(() => {
        generateRadarChart(skillsData);
    }, 100);

    // Ajouter des écouteurs d'événements pour les cartes de compétences
    addSkillCardListeners();
}

// Fonction pour générer les étoiles de niveau
function generateStars(level) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= level) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Fonction pour formater le nom du projet
function formatProjectName(name) {
    // Limiter la longueur et ajouter des ellipses si nécessaire
    if (name.length > 15) {
        return name.substring(0, 12) + '...';
    }
    return name;
}

// Fonction pour obtenir le nombre total de compétences
function getTotalSkillsCount(skillsData) {
    return skillsData.reduce((total, category) => total + category.skills.length, 0);
}

// Fonction pour obtenir le niveau de compétence le plus élevé
function getTopSkillLevel(skillsData) {
    let maxLevel = 0;
    skillsData.forEach(category => {
        category.skills.forEach(skill => {
            if (skill.level > maxLevel) {
                maxLevel = skill.level;
            }
        });
    });
    return maxLevel;
}

// Fonction pour ajouter des écouteurs d'événements aux cartes de compétences
function addSkillCardListeners() {
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('skill-card-hover');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('skill-card-hover');
        });

        // Afficher les détails des projets au clic
        card.addEventListener('click', () => {
            // Implémentation future pour afficher plus de détails
            console.log(`Détails pour la compétence: ${card.dataset.skill}`);
        });
    });
}

// Fonction pour générer un graphique radar des compétences
function generateRadarChart(skillsData) {
    const container = document.getElementById('skills-radar-container');
    if (!container) return;

    // Sélectionner les meilleures compétences pour le graphique radar (maximum 8)
    const topSkills = [];

    // Sélectionner les 1-2 meilleures compétences de chaque catégorie
    skillsData.forEach(category => {
        const categoryTopSkills = category.skills
            .sort((a, b) => b.level - a.level)
            .slice(0, 2);

        topSkills.push(...categoryTopSkills);
    });

    // Limiter à 8 compétences maximum et trier par niveau
    const finalSkills = topSkills
        .sort((a, b) => b.level - a.level)
        .slice(0, 8);

    // Définir les dimensions du graphique
    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 30;

    // Calculer les positions des axes
    const numSkills = finalSkills.length;
    const angleStep = (Math.PI * 2) / numSkills;

    // Générer les coordonnées des axes
    const axes = finalSkills.map((skill, i) => {
        const angle = i * angleStep - Math.PI / 2; // Commencer à midi
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);
        return {
            name: skill.name,
            level: skill.level,
            angle: angle,
            endX: endX,
            endY: endY
        };
    });

    // Générer les points du polygone de compétences
    const points = axes.map(axis => {
        const distance = (axis.level / 5) * radius;
        const x = centerX + distance * Math.cos(axis.angle);
        const y = centerY + distance * Math.sin(axis.angle);
        return { x, y };
    });

    // Construire le chemin du polygone
    let polygonPath = '';
    points.forEach((point, i) => {
        polygonPath += (i === 0 ? 'M' : 'L') + `${point.x},${point.y}`;
    });
    polygonPath += 'Z'; // Fermer le chemin

    // Générer le SVG
    const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Cercles concentriques -->
      ${[0.2, 0.4, 0.6, 0.8, 1].map(factor => `
        <circle 
          cx="${centerX}" 
          cy="${centerY}" 
          r="${radius * factor}" 
          fill="none" 
          stroke="#ddd" 
          stroke-width="1" 
          stroke-dasharray="${factor < 1 ? '3 3' : ''}"/>
      `).join('')}
      
      <!-- Axes -->
      ${axes.map(axis => `
        <line 
          x1="${centerX}" 
          y1="${centerY}" 
          x2="${axis.endX}" 
          y2="${axis.endY}" 
          stroke="#ccc" 
          stroke-width="1"/>
      `).join('')}
      
      <!-- Labels des axes -->
      ${axes.map(axis => {
        // Positionner les labels à l'extérieur
        const labelDistance = radius + 20;
        const x = centerX + labelDistance * Math.cos(axis.angle);
        const y = centerY + labelDistance * Math.sin(axis.angle);

        // Ajuster l'ancrage du texte selon la position
        let textAnchor = "middle";
        if (x < centerX - radius/2) textAnchor = "end";
        else if (x > centerX + radius/2) textAnchor = "start";

        // Ajuster la position verticale
        let dy = "0.3em";
        if (y < centerY - radius/2) dy = "0em";
        else if (y > centerY + radius/2) dy = "0.6em";

        return `
          <text 
            x="${x}" 
            y="${y}" 
            text-anchor="${textAnchor}" 
            dy="${dy}" 
            font-size="11px" 
            fill="#555">
            ${axis.name}
          </text>
        `;
    }).join('')}
      
      <!-- Polygone des compétences -->
      <path 
        d="${polygonPath}" 
        fill="rgba(51, 102, 204, 0.3)" 
        stroke="#3366cc" 
        stroke-width="2"/>
        
      <!-- Points sur le polygone -->
      ${points.map((point, i) => `
        <circle 
          cx="${point.x}" 
          cy="${point.y}" 
          r="4" 
          fill="#3366cc" 
          stroke="white" 
          stroke-width="1">
          <title>${finalSkills[i].name}: Niveau ${finalSkills[i].level}/5</title>
        </circle>
      `).join('')}
      
      <!-- Niveau aux extrémités des axes -->
      ${axes.map(axis => {
        const levels = [1, 2, 3, 4, 5];
        return levels.map(level => {
            const distance = (level / 5) * radius;
            const x = centerX + distance * Math.cos(axis.angle);
            const y = centerY + distance * Math.sin(axis.angle);

            // N'afficher le chiffre que sur le premier axe
            return axis === axes[0] ? `
            <text 
              x="${x}" 
              y="${y}" 
              text-anchor="middle" 
              dy="0.3em" 
              font-size="9px" 
              fill="#888">
              ${level}
            </text>
          ` : '';
        }).join('');
    }).join('')}
    </svg>
  `;

    // Insérer le SVG dans le conteneur
    container.innerHTML = svg;
}