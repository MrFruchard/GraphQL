// Ces variables contiennent les URLs des API que nous allons utiliser
const API_URL = "https://zone01normandie.org/api/graphql-engine/v1/graphql"; // URL de l'API GraphQL
const AUTH_URL = "https://zone01normandie.org/api/auth/signin"; // URL pour se connecter

// Cette fonction configure le formulaire de connexion
function setupLoginForm() {
  // On récupère le formulaire et le message d'erreur depuis la page HTML
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  // On ajoute un "écouteur d'événement" qui s'active quand le formulaire est soumis
  loginForm.addEventListener("submit", async function (e) {
    // On empêche le comportement par défaut du formulaire (rechargement de la page)
    e.preventDefault();

    // On récupère les valeurs entrées par l'utilisateur dans les champs username et password
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      // On convertit "username:password" en format Base64 (exigé par l'API)
      const credentials = btoa(`${username}:${password}`);

      // On envoie une requête au serveur pour se connecter
      const response = await fetch(AUTH_URL, {
        method: "POST", // Méthode HTTP
        headers: {
          Authorization: `Basic ${credentials}`, // On ajoute les identifiants dans l'en-tête
        },
      });

      // Si la réponse n'est pas "ok" (statut différent de 200-299)
      if (!response.ok) {
        throw new Error("Échec de l'authentification"); // On lance une erreur
      }

      // On extrait le token de la réponse (conversion de JSON en objet JavaScript)
      const token = await response.json();

      // On stocke le token dans le "localStorage" du navigateur (comme un mini-disque dur)
      localStorage.setItem("authToken", token);

      // On redirige l'utilisateur vers la page de profil
      window.location.href = "profile.html";
    } catch (error) {
      // En cas d'erreur, on affiche le message d'erreur
      errorMessage.style.display = "block";
      // Et on affiche l'erreur dans la console pour le débogage
      console.error("Erreur de connexion:", error);
    }
  });
}

// Cette fonction charge les données du profil de l'utilisateur
async function loadUserProfile() {
  // On récupère le token d'authentification stocké
  const token = localStorage.getItem("authToken");

  // Si pas de token, l'utilisateur n'est pas connecté, on le renvoie à la page de connexion
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    // On définit la requête GraphQL pour obtenir les informations de l'utilisateur
    // Cette syntaxe est spécifique à GraphQL, c'est comme demander : "donne-moi ces champs précis"
    const userInfoQuery = `
            query {
                user {
                    id
                    login
                    firstName
                    lastName
                    email
                }
            }
        `;

    // Requête GraphQL pour obtenir toutes les transactions de type "xp"
    const xpQuery = `
            query {
                transaction(
                    where: { type: { _eq: "xp" } }
                ) {
                    amount
                }
            }
        `;

    // On envoie les requêtes GraphQL pour obtenir les données
    const userInfo = await fetchGraphQL(userInfoQuery, token);
    const xpInfo = await fetchGraphQL(xpQuery, token);

    // On affiche les informations de l'utilisateur sur la page
    displayUserInfo(userInfo.data.user[0]);

    // On calcule le total des XP et on l'affiche
    const totalXP = calculateTotalXP(xpInfo.data.transaction);
    displayXPInfo(totalXP);
  } catch (error) {
    // En cas d'erreur, on affiche un message d'erreur sur la page
    console.error("Erreur lors du chargement des données:", error);
    document.getElementById(
      "user-data"
    ).innerHTML = `<div class="error">Erreur lors du chargement des données: ${error.message}</div>`;
    document.getElementById(
      "xp-data"
    ).innerHTML = `<div class="error">Erreur lors du chargement des données: ${error.message}</div>`;
  }
}

// Cette fonction envoie une requête GraphQL au serveur
async function fetchGraphQL(query, token) {
  // On envoie la requête à l'API GraphQL
  const response = await fetch(API_URL, {
    method: "POST", // Méthode HTTP
    headers: {
      "Content-Type": "application/json", // Format des données envoyées
      Authorization: `Bearer ${token}`, // Token d'authentification
    },
    body: JSON.stringify({ query }), // On convertit la requête GraphQL en JSON
  });

  // Si la réponse n'est pas "ok", on lance une erreur
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur GraphQL: ${errorText}`);
  }

  // On retourne la réponse convertie en objet JavaScript
  return response.json();
}

// Cette fonction affiche les informations de l'utilisateur sur la page
function displayUserInfo(user) {
  // On récupère l'élément HTML où afficher les données
  const userDataElement = document.getElementById("user-data");

  // Si aucun utilisateur n'est trouvé, on affiche un message d'erreur
  if (!user) {
    userDataElement.innerHTML =
      '<div class="error">Aucune donnée utilisateur trouvée</div>';
    return;
  }

  // On insère le HTML avec les informations de l'utilisateur
  userDataElement.innerHTML = `
        <p><strong>Login:</strong> ${user.login}</p>
        <p><strong>Prénom:</strong> ${user.firstName}</p>
        <p><strong>Nom:</strong> ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
    `;
}

// Cette fonction calcule le total des XP à partir des transactions
function calculateTotalXP(transactions) {
  // Si pas de transactions, on retourne 0
  if (!transactions || transactions.length === 0) return 0;

  // On utilise reduce pour additionner tous les montants
  // C'est comme une boucle qui fait une somme
  return transactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);
}

// Cette fonction affiche le total des XP sur la page
function displayXPInfo(totalXP) {
  // On récupère l'élément HTML où afficher les données
  const xpDataElement = document.getElementById("xp-data");

  // On insère le HTML avec le total des XP
  xpDataElement.innerHTML = `
        <p><strong>XP Total:</strong> ${Math.round(
          totalXP
        ).toLocaleString()} points</p>
    `;
}
