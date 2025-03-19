// Génération des graphiques SVG pour le profil
// Ce fichier contient les graphiques SVG requis

// Fonction principale pour générer les graphiques
function generateGraphs(user) {
    if (!user) return;

    // Préparer les données pour les graphiques
    const xpData = {
        transaction: user.xp || []
    };

    // Pour le graphique de projets, on utilise finished_projects
    const projectsData = {
        progress: user.finished_projects || []
    };

    // Générer le graphique d'XP par mois
    generateXPByMonthGraph(xpData);

    // Générer le graphique des projets réussis/échoués
    generateProjectsRatioGraph(projectsData);

    // Générer le camembert pour le ratio d'audit
    generateAuditRatioGraph(user);
}

// ===============================================
// GRAPHIQUE 1: XP par mois (ligne/histogramme)
// ===============================================
function generateXPByMonthGraph(xpData) {
    const container = document.getElementById('xp-month-graph');

    if (!container || !xpData || !xpData.transaction || xpData.transaction.length === 0) {
        if (container) container.innerHTML = '<div class="empty-graph">Pas de données XP disponibles</div>';
        return;
    }

    // Grouper les transactions par mois
    const xpByMonth = groupXPByMonth(xpData.transaction);

    // Définir la taille du SVG
    const width = 450;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Trouver les valeurs maximales
    const months = Object.keys(xpByMonth);
    const maxXP = Math.max(...Object.values(xpByMonth));

    // Créer les échelles
    const barWidth = innerWidth / months.length;

    // Générer le SVG
    let svg = `
    <svg width="100%" height="300" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3498db" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#2980b9" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#2ecc71" stop-opacity="1"/>
          <stop offset="100%" stop-color="#27ae60" stop-opacity="1"/>
        </linearGradient>
      </defs>
      
      <!-- Groupe principal avec transformation pour les marges -->
      <g transform="translate(${margin.left}, ${margin.top})">
  `;

    // Ajouter l'axe Y (vertical)
    svg += `
    <!-- Axe Y -->
    <line x1="0" y1="0" x2="0" y2="${innerHeight}" stroke="#ccc" stroke-width="1"/>
  `;

    // Ajouter des graduations sur l'axe Y
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
        const y = innerHeight - (i / yTickCount) * innerHeight;
        const value = Math.round((i / yTickCount) * maxXP);

        svg += `
      <!-- Graduation Y -->
      <line x1="-5" y1="${y}" x2="0" y2="${y}" stroke="#ccc" stroke-width="1"/>
      <text x="-10" y="${y + 5}" text-anchor="end" font-size="12">${value}</text>
      <line x1="0" y1="${y}" x2="${innerWidth}" y2="${y}" stroke="#eee" stroke-width="0.5" stroke-dasharray="3,3"/>
    `;
    }

    // Ajouter l'axe X (horizontal)
    svg += `
    <!-- Axe X -->
    <line x1="0" y1="${innerHeight}" x2="${innerWidth}" y2="${innerHeight}" stroke="#ccc" stroke-width="1"/>
  `;

    // Ajouter les barres et les graduations sur l'axe X
    let xPos = 0;
    let linePath = '';
    let previousY = null;

    months.forEach((month, index) => {
        const xpAmount = xpByMonth[month];
        const barHeight = (xpAmount / maxXP) * innerHeight;
        const barX = xPos + barWidth * 0.1; // Ajouter un peu d'espace entre les barres
        const barY = innerHeight - barHeight;
        const barW = barWidth * 0.8; // Barre plus étroite pour l'espace

        // Ajouter la barre
        svg += `
      <!-- Barre pour ${month} -->
      <rect 
        x="${barX}" 
        y="${barY}" 
        width="${barW}" 
        height="${barHeight}" 
        fill="url(#barGradient)" 
        rx="3" 
        ry="3"
        data-month="${month}"
        data-xp="${xpAmount}"
      />
    `;

        // Ajouter l'étiquette du mois
        svg += `
      <text 
        x="${barX + barW/2}" 
        y="${innerHeight + 20}" 
        text-anchor="middle" 
        font-size="12"
      >${month}</text>
    `;

        // Ajouter un point pour la ligne de tendance
        const lineX = barX + barW/2;
        const lineY = barY;

        if (previousY !== null) {
            linePath += ` L ${lineX},${lineY}`;
        } else {
            linePath = `M ${lineX},${lineY}`;
        }
        previousY = lineY;

        // Ajouter un cercle au point
        svg += `
      <circle 
        cx="${lineX}" 
        cy="${lineY}" 
        r="4" 
        fill="#27ae60" 
        stroke="white" 
        stroke-width="1" 
      />
    `;

        xPos += barWidth;
    });

    // Ajouter la ligne de tendance
    svg += `
    <!-- Ligne de tendance -->
    <path 
      d="${linePath}" 
      fill="none" 
      stroke="url(#lineGradient)" 
      stroke-width="3" 
      stroke-linejoin="round" 
      stroke-linecap="round"
    />
  `;

    // Fermer les groupes et le SVG
    svg += `
      </g>
    </svg>
  `;

    // Ajouter le SVG au conteneur
    container.innerHTML = svg;
}

// Fonction pour grouper les XP par mois
function groupXPByMonth(transactions) {
    const months = {};

    transactions.forEach(tx => {
        const date = new Date(tx.createdAt);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

        if (!months[monthKey]) {
            months[monthKey] = 0;
        }

        months[monthKey] += tx.amount;
    });

    return months;
}

// ===============================================
// GRAPHIQUE 2: Projets réussis/échoués (camembert)
// ===============================================
function generateProjectsRatioGraph(projectsData) {
    const container = document.getElementById('projects-ratio-graph');

    if (!container || !projectsData || !projectsData.progress || projectsData.progress.length === 0) {
        if (container) container.innerHTML = '<div class="empty-graph">Pas de données de projets disponibles</div>';
        return;
    }

    // Pour les projets finis, on suppose qu'ils sont tous réussis
    const successProjects = projectsData.progress.length;
    const failedProjects = 0; // Par défaut, on suppose que tous les projets terminés sont réussis
    const totalProjects = successProjects + failedProjects;

    // Si aucun projet, afficher un message
    if (totalProjects === 0) {
        container.innerHTML = '<div class="empty-graph">Aucun projet à afficher</div>';
        return;
    }

    // Calculer les pourcentages et angles pour le camembert
    const successPercent = Math.round((successProjects / totalProjects) * 100);
    const failedPercent = 100 - successPercent;

    const successAngle = (successPercent / 100) * 360;
    const failedAngle = 360 - successAngle;

    // Définir la taille du SVG
    const width = 450;
    const height = 300;
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    // Générer les chemins SVG pour les secteurs du camembert
    const successPath = getArcPath(centerX, centerY, radius, 0, successAngle);
    const failedPath = getArcPath(centerX, centerY, radius, successAngle, 360);

    // Générer le SVG
    const svg = `
    <svg width="100%" height="300" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Camembert -->
      <g transform="translate(${centerX}, ${centerY})">
        <!-- Secteur des projets réussis -->
        <path 
          d="${successPath}" 
          fill="#27ae60" 
          stroke="white" 
          stroke-width="2"
          transform="translate(-${radius}, -${radius})"
        >
          <title>Projets réussis: ${successProjects} (${successPercent}%)</title>
        </path>
        
        <!-- Secteur des projets échoués -->
        <path 
          d="${failedPath}" 
          fill="#e74c3c" 
          stroke="white" 
          stroke-width="2"
          transform="translate(-${radius}, -${radius})"
        >
          <title>Projets échoués: ${failedProjects} (${failedPercent}%)</title>
        </path>
        
        <!-- Cercle intérieur pour effet donut -->
        <circle 
          cx="0" 
          cy="0" 
          r="${radius * 0.6}" 
          fill="white"
        />
        
        <!-- Texte au centre -->
        <text 
          x="0" 
          y="-10" 
          text-anchor="middle" 
          font-size="24" 
          font-weight="bold" 
          fill="#2c3e50"
        >${successPercent}%</text>
        <text 
          x="0" 
          y="20" 
          text-anchor="middle" 
          font-size="14" 
          fill="#7f8c8d"
        >Taux de réussite</text>
      </g>
      
      <!-- Légende -->
      <g transform="translate(${width * 0.7}, ${height * 0.75})">
        <!-- Réussis -->
        <rect x="0" y="0" width="20" height="20" fill="#27ae60" rx="3" ry="3" />
        <text x="30" y="15" font-size="14">Réussis (${successProjects})</text>
        
        <!-- Échoués -->
        <rect x="0" y="30" width="20" height="20" fill="#e74c3c" rx="3" ry="3" />
        <text x="30" y="45" font-size="14">Échoués (${failedProjects})</text>
      </g>
    </svg>
  `;

    // Ajouter le SVG au conteneur
    container.innerHTML = svg;
}

// ===============================================
// GRAPHIQUE 3: Ratio d'audit (camembert)
// ===============================================
function generateAuditRatioGraph(user) {
    const container = document.getElementById('audit-ratio-graph');

    if (!container || !user) {
        if (container) container.innerHTML = '<div class="empty-graph">Pas de données d\'audit disponibles</div>';
        return;
    }

    // Récupérer les données d'audit
    const totalUp = user.totalUp || 0;
    const totalDown = user.totalDown || 0;
    const auditRatio = user.auditRatio || 0;

    // Si aucune donnée d'audit, afficher un message
    if (totalUp === 0 && totalDown === 0) {
        container.innerHTML = '<div class="empty-graph">Aucune donnée d\'audit à afficher</div>';
        return;
    }

    // Calculer les pourcentages pour le camembert
    const upPercent = totalUp + totalDown > 0 ? Math.round((totalUp / (totalUp + totalDown)) * 100) : 50;
    const downPercent = 100 - upPercent;

    const upAngle = (upPercent / 100) * 360;
    const downAngle = 360 - upAngle;

    // Définir la taille du SVG
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    // Générer les chemins SVG pour les secteurs du camembert
    const upPath = getArcPath(centerX, centerY, radius, 0, upAngle);
    const downPath = getArcPath(centerX, centerY, radius, upAngle, 360);

    // Générer le SVG
    const svg = `
    <svg width="100%" height="300" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"> 
      <!-- Camembert -->
      <g transform="translate(${centerX}, ${centerY})">
        <!-- Secteur des points donnés -->
        <path 
          d="${upPath}" 
          fill="#3498db" 
          stroke="white" 
          stroke-width="2"
          transform="translate(-${radius}, -${radius})"
        >
          <title>Points donnés: ${totalUp} (${upPercent}%)</title>
        </path>
        
        <!-- Secteur des points reçus -->
        <path 
          d="${downPath}" 
          fill="#9b59b6" 
          stroke="white" 
          stroke-width="2"
          transform="translate(-${radius}, -${radius})"
        >
          <title>Points reçus: ${totalDown} (${downPercent}%)</title>
        </path>
        
        <!-- Cercle intérieur pour effet donut -->
        <circle 
          cx="0" 
          cy="0" 
          r="${radius * 0.6}" 
          fill="white"
        />
        
        <!-- Texte au centre -->
        <text 
          x="0" 
          y="-10" 
          text-anchor="middle" 
          font-size="24" 
          font-weight="bold" 
          fill="#2c3e50"
        >${auditRatio.toFixed(1)}</text>
        <text 
          x="0" 
          y="20" 
          text-anchor="middle" 
          font-size="14" 
          fill="#7f8c8d"
        >Ratio d'audit</text>
      </g>
      
      <!-- Légende -->
      <g transform="translate(${width * 0.5}, ${height * 0.8})">
        <!-- Points donnés -->
        <rect x="-120" y="0" width="20" height="20" fill="#3498db" rx="3" ry="3" />
        <text x="-90" y="15" font-size="14">Donnés (${totalUp})</text>
        
        <!-- Points reçus -->
        <rect x="20" y="0" width="20" height="20" fill="#9b59b6" rx="3" ry="3" />
        <text x="50" y="15" font-size="14">Reçus (${totalDown})</text>
      </g>
    </svg>
  `;

    // Ajouter le SVG au conteneur
    container.innerHTML = svg;
}

// Fonction pour calculer le chemin d'arc pour un secteur de camembert
function getArcPath(centerX, centerY, radius, startAngle, endAngle) {
    // Convertir les angles en radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Calculer les points de départ et d'arrivée
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);

    // Déterminer si l'arc est grand ou petit
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    // Générer le chemin SVG
    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
}