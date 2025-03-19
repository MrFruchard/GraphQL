// Fonctions pour l'API GraphQL
// Ce fichier contient des exemples des trois types de requêtes demandés:
// - Requête normale
// - Requête imbriquée
// - Requête avec arguments

// Fonction principale pour exécuter des requêtes GraphQL
async function executeGraphQL(query, variables = {}) {
  const token = localStorage.getItem("zone01_token");

  if (!token) {
    throw new Error("Non connecté. Veuillez vous connecter d'abord.");
  }

  try {
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

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("Erreurs GraphQL:", result.errors);
      throw new Error("Erreur lors de l'exécution de la requête GraphQL");
    }

    return result.data;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}

// Récupérer toutes les données utilisateur en une seule requête
async function getUserAllData() {
  const query = `
query {
  user {
    id
    login
    firstName
    lastName
    email
    campus
    auditRatio
    totalUp
    totalDown
    xpTotal: transactions_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 303}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
    skills: transactions(
      order_by: {type: asc, amount: desc}
      distinct_on: [type]
      where: {eventId: {_eq: 303}, type: {_like: "skill%"}}
    ) {
      type
      amount
    }
    events(where: {eventId: {_eq: 303}}) {
      level
    }
    xp: transactions(
      order_by: {createdAt: asc}
      where: {type: {_eq: "xp"}, eventId: {_eq: 303}}
    ) {
      createdAt
      amount
      path
    }
    finished_projects: groups(where: {group: {status: {_eq: finished}}}) {
      group {
        path
        status
        createdAt
      }
    }
  }
}
  `;

  return await executeGraphQL(query);
}
