// graphql.js - Fichier pour gérer les requêtes GraphQL

// Fonction principale pour exécuter des requêtes GraphQL
async function executeGraphQL(query, variables = {}) {
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

  const result = await response.json();

  if (result.errors) {
    console.error("Erreurs GraphQL:", result.errors);
    throw new Error("Erreur lors de l'exécution de la requête GraphQL");
  }

  return result.data;
}

// Exemples de requêtes spécifiques (à personnaliser selon vos besoins)

// Récupérer le profil de l'utilisateur
async function getUserProfile() {
  const query = `
      query {
        user {
          id
        }
      }
    `;

  return await executeGraphQL(query);
}

// Récupérer les projets de l'utilisateur
async function getUserProjects() {
  const query = `
      query {
        transaction(where: {type: {_eq: "project"}}, order_by: {createdAt: desc}) {
          id
          amount
          createdAt
          path
        }
      }
    `;

  return await executeGraphQL(query);
}

// Récupérer les transactions XP de l'utilisateur
async function getUserXP() {
  const query = `
      query {
        transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
          id
          amount
          createdAt
          path
        }
      }
    `;

  return await executeGraphQL(query);
}

// Exportez vos fonctions
window.graphql = {
  execute: executeGraphQL,
  getUserProfile,
  getUserProjects,
  getUserXP,
};
