// skills-services.js - Services pour récupérer et traiter les données de compétences

// Récupération des compétences depuis les transactions et résultats
async function getSkillsData() {
    try {
        // Récupérer l'ID de l'utilisateur
        const userData = await window.graphql.getUserProfile();
        const userId = userData.user[0].id;

        // Requête pour obtenir toutes les transactions avec leurs chemins
        const transactionsQuery = `
      query {
        transaction(
          where: {
            userId: {_eq: ${userId}},
            type: {_eq: "xp"}
          }
        ) {
          id
          amount
          path
          createdAt
        }
      }
    `;

        // Requête pour obtenir tous les résultats de projets
        const resultsQuery = `
      query {
        result(
          where: {
            userId: {_eq: ${userId}}
          }
        ) {
          id
          grade
          path
          createdAt
        }
      }
    `;

        // Exécuter les requêtes en parallèle
        const [transactionsData, resultsData] = await Promise.all([
            window.graphql.execute(transactionsQuery),
            window.graphql.execute(resultsQuery)
        ]);

        // Traiter les données pour extraire les compétences
        return processSkillsData(transactionsData.transaction, resultsData.result);
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences:", error);
        throw error;
    }
}

// Traitement des données pour extraire les compétences
function processSkillsData(transactions, results) {
    // Map des catégories de compétences
    const skillCategories = {
        programmingLanguages: {
            title: "Langages de programmation",
            icon: "fa-code",
            skills: {}
        },
        frameworks: {
            title: "Frameworks & Libraries",
            icon: "fa-layer-group",
            skills: {}
        },
        concepts: {
            title: "Concepts & Algorithmes",
            icon: "fa-lightbulb",
            skills: {}
        },
        tools: {
            title: "Outils & Technologies",
            icon: "fa-tools",
            skills: {}
        }
    };

    // Keywords pour catégoriser les compétences
    const keywordMapping = {
        // Langages
        "go": "programmingLanguages",
        "golang": "programmingLanguages",
        "js": "programmingLanguages",
        "javascript": "programmingLanguages",
        "html": "programmingLanguages",
        "css": "programmingLanguages",
        "php": "programmingLanguages",
        "sql": "programmingLanguages",
        "python": "programmingLanguages",

        // Frameworks
        "react": "frameworks",
        "vue": "frameworks",
        "node": "frameworks",
        "express": "frameworks",
        "svelte": "frameworks",
        "bootstrap": "frameworks",
        "tailwind": "frameworks",

        // Concepts
        "algo": "concepts",
        "algorithm": "concepts",
        "data-structure": "concepts",
        "structure": "concepts",
        "recursion": "concepts",
        "sorting": "concepts",
        "search": "concepts",
        "linked-list": "concepts",
        "hash": "concepts",
        "tree": "concepts",
        "graph": "concepts",

        // Outils
        "docker": "tools",
        "git": "tools",
        "graphql": "tools",
        "api": "tools",
        "rest": "tools",
        "database": "tools",
        "sql": "tools",
        "mongodb": "tools",
        "web": "tools"
    };

    // Compétences spécifiques basées sur le nom du projet
    const specificSkills = {
        "graphql": {
            name: "GraphQL",
            category: "tools",
            level: 0,
            xp: 0,
            projects: []
        },
        "ascii-art": {
            name: "ASCII Art",
            category: "concepts",
            level: 0,
            xp: 0,
            projects: []
        },
        "groupie-tracker": {
            name: "API Integration",
            category: "tools",
            level: 0,
            xp: 0,
            projects: []
        },
        "forum": {
            name: "Full-Stack Development",
            category: "concepts",
            level: 0,
            xp: 0,
            projects: []
        },
        "social-network": {
            name: "Full-Stack Development",
            category: "concepts",
            level: 0,
            xp: 0,
            projects: []
        },
        "piscine-js": {
            name: "JavaScript",
            category: "programmingLanguages",
            level: 0,
            xp: 0,
            projects: []
        },
        "piscine-go": {
            name: "Go",
            category: "programmingLanguages",
            level: 0,
            xp: 0,
            projects: []
        },
        "blockchain": {
            name: "Blockchain",
            category: "concepts",
            level: 0,
            xp: 0,
            projects: []
        }
    };

    // Analyser les transactions pour extraire les compétences
    transactions.forEach(tx => {
        // Extraire le nom du projet du chemin
        const pathParts = tx.path.split('/');
        let projectName = pathParts[pathParts.length - 1];
        if (!projectName) {
            projectName = pathParts[pathParts.length - 2];
        }

        // Recherche de mots-clés dans le nom du projet
        const lowerCaseProjectName = projectName.toLowerCase();

        // Vérifier les compétences spécifiques
        for (const [keyword, skill] of Object.entries(specificSkills)) {
            if (lowerCaseProjectName.includes(keyword)) {
                if (!skillCategories[skill.category].skills[skill.name]) {
                    skillCategories[skill.category].skills[skill.name] = {
                        name: skill.name,
                        level: 0,
                        xp: 0,
                        projects: []
                    };
                }

                skillCategories[skill.category].skills[skill.name].xp += tx.amount;

                // Éviter les doublons de projets
                if (!skillCategories[skill.category].skills[skill.name].projects.includes(projectName)) {
                    skillCategories[skill.category].skills[skill.name].projects.push(projectName);
                }
            }
        }

        // Vérifier les mots-clés génériques
        for (const [keyword, category] of Object.entries(keywordMapping)) {
            if (lowerCaseProjectName.includes(keyword)) {
                // Créer un nom de compétence à partir du mot-clé (première lettre en majuscule)
                const skillName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

                if (!skillCategories[category].skills[skillName]) {
                    skillCategories[category].skills[skillName] = {
                        name: skillName,
                        level: 0,
                        xp: 0,
                        projects: []
                    };
                }

                skillCategories[category].skills[skillName].xp += tx.amount;

                // Éviter les doublons de projets
                if (!skillCategories[category].skills[skillName].projects.includes(projectName)) {
                    skillCategories[category].skills[skillName].projects.push(projectName);
                }
            }
        }

        // Compétences générales par division
        if (pathParts.length >= 3) {
            const division = pathParts[1]; // ex: div-01, piscine-js, etc.

            let skillName = division.charAt(0).toUpperCase() + division.slice(1);
            let category = "concepts";

            // Déterminer la catégorie en fonction de la division
            if (division.includes("go")) {
                skillName = "Go";
                category = "programmingLanguages";
            } else if (division.includes("js")) {
                skillName = "JavaScript";
                category = "programmingLanguages";
            } else if (division.includes("web")) {
                skillName = "Web Development";
                category = "concepts";
            }

            if (!skillCategories[category].skills[skillName]) {
                skillCategories[category].skills[skillName] = {
                    name: skillName,
                    level: 0,
                    xp: 0,
                    projects: []
                };
            }

            skillCategories[category].skills[skillName].xp += tx.amount;

            // Éviter les doublons de projets
            if (!skillCategories[category].skills[skillName].projects.includes(projectName)) {
                skillCategories[category].skills[skillName].projects.push(projectName);
            }
        }
    });

    // Intégrer les résultats de projet pour améliorer les niveaux
    results.forEach(result => {
        // Parcourir toutes les catégories et compétences
        Object.values(skillCategories).forEach(category => {
            Object.values(category.skills).forEach(skill => {
                // Vérifier si ce résultat concerne un projet associé à cette compétence
                const pathParts = result.path.split('/');
                let projectName = pathParts[pathParts.length - 1];
                if (!projectName) {
                    projectName = pathParts[pathParts.length - 2];
                }

                if (skill.projects.includes(projectName) && result.grade > 0) {
                    // Incrémenter le niveau en fonction de la réussite du projet
                    skill.level += 1;
                }
            });
        });
    });

    // Calculer les niveaux finaux en fonction de l'XP et des résultats
    Object.values(skillCategories).forEach(category => {
        Object.values(category.skills).forEach(skill => {
            // Calcul de niveau basé sur l'XP
            const xpLevel = Math.min(5, Math.floor(skill.xp / 500));

            // Niveau final est une combinaison du niveau basé sur l'XP et des réussites de projets
            skill.level = Math.min(5, Math.max(xpLevel, skill.level));

            // S'assurer que le niveau minimum est 1 si la compétence existe
            if (skill.level < 1 && skill.xp > 0) {
                skill.level = 1;
            }
        });
    });

    // Transformer en tableau pour faciliter l'affichage
    const result = [];

    for (const [categoryKey, category] of Object.entries(skillCategories)) {
        // Convertir les compétences en tableau et trier par niveau
        const skillsArray = Object.values(category.skills)
            .filter(skill => skill.level > 0) // Ne garder que les compétences avec un niveau > 0
            .sort((a, b) => b.level - a.level);

        if (skillsArray.length > 0) {
            result.push({
                id: categoryKey,
                title: category.title,
                icon: category.icon,
                skills: skillsArray
            });
        }
    }

    return result;
}

// Exporter les fonctions
window.skillsServices = {
    getSkillsData
};