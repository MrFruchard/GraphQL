// Service to handle GraphQL queries
const GRAPHQL_ENDPOINT =
  "https://zone01normandie.org/api/graphql-engine/v1/graphql";

/**
 * Execute a GraphQL query
 * @param {string} query - GraphQL query string
 * @param {object} variables - Variables for the query
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Promise with the query results
 */
export const executeQuery = async (query, variables = {}, token) => {
  if (!token) {
    throw new Error("No authentication token provided");
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error("GraphQL query error:", error);
    throw error;
  }
};

/**
 * Get user profile information
 * @param {string} token - JWT token
 * @returns {Promise} - User profile data
 */
export const getUserProfile = async (token) => {
  const query = `{
    user {
      id
      login
      firstName
      lastName
      attrs
    }
  }`;

  return executeQuery(query, {}, token);
};

/**
 * Get user XP transactions
 * @param {number} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise} - XP transaction data
 */
export const getUserXP = async (userId, token) => {
  const query = `{
    transaction(
      where: {
        userId: { _eq: ${userId} },
        type: { _eq: "xp" }
      },
      order_by: { createdAt: asc }
    ) {
      id
      type
      amount
      createdAt
      path
    }
  }`;

  return executeQuery(query, {}, token);
};

/**
 * Get user progress data
 * @param {number} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise} - Progress data
 */
export const getUserProgress = async (userId, token) => {
  const query = `{
    progress(
      where: { userId: { _eq: ${userId} } }
    ) {
      id
      grade
      createdAt
      updatedAt
      path
      object {
        id
        name
        type
      }
    }
  }`;

  return executeQuery(query, {}, token);
};

/**
 * Get user results
 * @param {number} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise} - Results data
 */
export const getUserResults = async (userId, token) => {
  const query = `{
    result(
      where: { userId: { _eq: ${userId} } }
    ) {
      id
      grade
      createdAt
      updatedAt
      path
      object {
        id
        name
        type
      }
    }
  }`;

  return executeQuery(query, {}, token);
};

/**
 * Get user audit data
 * @param {number} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise} - Audit data
 */
export const getUserAudits = async (userId, token) => {
  const query = `{
    transaction(
      where: {
        userId: { _eq: ${userId} },
        type: { _in: ["up", "down"] }
      }
    ) {
      id
      type
      amount
      createdAt
      path
    }
  }`;

  return executeQuery(query, {}, token);
};

/**
 * Get project information
 * @param {number} objectId - Object ID
 * @param {string} token - JWT token
 * @returns {Promise} - Object data
 */
export const getObjectInfo = async (objectId, token) => {
  const query = `{
    object(
      where: { id: { _eq: ${objectId} } }
    ) {
      id
      name
      type
      attrs
    }
  }`;

  return executeQuery(query, {}, token);
};
