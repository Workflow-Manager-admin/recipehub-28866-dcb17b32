//
// API utility for communication with Django backend
// Minimal wrapper over fetch with standard error handling and JWT auth
//

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

function authHeaders() {
  return accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
}

// Helper to parse JSON, throw on non-2xx, return error object
async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const headers = {
    ...(opts.headers || {}),
    ...authHeaders(),
    "Content-Type": "application/json",
  };
  const resp = await fetch(url, {
    ...opts,
    headers,
  });
  let data = null;
  try {
    data = await resp.json();
  } catch (e) {
    // ignore, some responses have no body
  }
  if (!resp.ok) {
    throw data || { error: "Unexpected error" };
  }
  return data;
}

// API methods

// PUBLIC_INTERFACE
export const api = {
  // Auth
  async register({ username, email, password }) {
    return apiFetch("/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },
  async login({ email, password }) {
    return apiFetch("/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async getUser() {
    return apiFetch("/user/");
  },
  // Recipes CRUD & search
  async listRecipes({ search = "", filters = {} } = {}) {
    let params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.push(`${k}=${encodeURIComponent(v)}`);
    });
    return apiFetch(`/recipes/${params.length ? "?" + params.join("&") : ""}`);
  },
  async getRecipe(id) {
    return apiFetch(`/recipes/${id}/`);
  },
  async createRecipe(form) {
    return apiFetch("/recipes/", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },
  async updateRecipe(id, form) {
    return apiFetch(`/recipes/${id}/`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
  },
  async deleteRecipe(id) {
    return apiFetch(`/recipes/${id}/`, { method: "DELETE" });
  },
  // Favorite/bookmark
  async listFavorites() {
    return apiFetch("/favorites/");
  },
  async addFavorite(recipeId) {
    return apiFetch("/favorites/add/", {
      method: "POST",
      body: JSON.stringify({ recipe_id: recipeId }),
    });
  },
  async removeFavorite(recipeId) {
    return apiFetch(`/favorites/remove/${recipeId}/`, { method: "DELETE" });
  },
};

