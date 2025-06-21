import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { setAccessToken, api } from "./api";
import Sidebar from "./Sidebar";
import RecipeList from "./RecipeList";
import AuthPage from "./AuthPage";
import RecipeModal from "./RecipeModal";

// -- Contexts for global state
export const UserContext = React.createContext();
export const RecipeContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user if accessToken is set
  useEffect(() => {
    const tok = localStorage.getItem("accessToken");
    if (tok) {
      setAccessToken(tok);
      api.getUser()
        .then((u) => setUser(u))
        .catch(() => setUser(null));
    }
  }, []);

  // Fetch recipes on filter/search changes
  const fetchRecipes = useCallback(() => {
    setLoading(true);
    api.listRecipes({ search, filters })
      .then((result) => setRecipes(result))
      .finally(() => setLoading(false));
  }, [search, filters]);

  useEffect(() => {
    if (user) fetchRecipes();
    // eslint-disable-next-line
  }, [user, search, filters]);

  // Auth handlers
  const handleLogin = async (data) => {
    try {
      const res = await api.login(data);
      setAccessToken(res.access);
      localStorage.setItem("accessToken", res.access);
      setUser(await api.getUser());
      setShowAuth(false);
    } catch (e) {
      return e.error || "Login failed";
    }
  };
  const handleRegister = async (data) => {
    try {
      await api.register(data);
      return await handleLogin({
        email: data.email,
        password: data.password,
      });
    } catch (e) {
      return e.error || "Registration failed";
    }
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    setAccessToken(null);
  };

  // Add/Edit/Delete handlers
  const handleRecipeSave = async (form, isEdit = false) => {
    try {
      if (isEdit) {
        await api.updateRecipe(form.id, form);
      } else {
        await api.createRecipe(form);
      }
      fetchRecipes();
      setSelectedRecipe(null);
    } catch (e) {
      alert(e.error || "Error saving recipe");
    }
  };
  const handleRecipeDelete = async (id) => {
    if (window.confirm("Delete this recipe?")) {
      await api.deleteRecipe(id);
      fetchRecipes();
      setSelectedRecipe(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RecipeContext.Provider
        value={{
          recipes,
          setRecipes,
          fetchRecipes,
          handleRecipeSave,
          handleRecipeDelete,
        }}
      >
        <div className="app">
          <nav className="navbar">
            <div className="container" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div className="logo">
                <span className="logo-symbol" style={{ color: "var(--kavia-accent, #fdcb6e)" }}>🍲</span> RecipeHub
              </div>
              <div>
                {user ? (
                  <>
                    <span className="user-name">Hi, {user.username}!</span>
                    <button className="btn" onClick={handleLogout} style={{ marginLeft: 12 }}>Logout</button>
                  </>
                ) : (
                  <button className="btn" onClick={() => setShowAuth(true)}>Login</button>
                )}
              </div>
            </div>
          </nav>

          <main className="main-layout">
            <Sidebar
              filters={filters}
              setFilters={setFilters}
              search={search}
              setSearch={setSearch}
            />
            <div className="content-section">
              {/* Auth modal */}
              {showAuth && (
                <AuthPage
                  mode={authMode}
                  setMode={setAuthMode}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onClose={() => setShowAuth(false)}
                />
              )}
              {/* Recipe Detail/Edit Modal */}
              {selectedRecipe && (
                <RecipeModal
                  recipe={selectedRecipe}
                  onClose={() => setSelectedRecipe(null)}
                  onSave={handleRecipeSave}
                  onDelete={handleRecipeDelete}
                />
              )}
              {/* Main Recipe List */}
              <RecipeList loading={loading} onSelect={setSelectedRecipe} />
            </div>
          </main>
        </div>
      </RecipeContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
