import React, { useContext, useEffect } from "react";
import { RecipeContext, UserContext } from "./App";
import { api } from "./api";

function RecipeCard({ recipe, onSelect, onFavorite }) {
  const { user } = useContext(UserContext);

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!user) return;
    onFavorite(recipe);
  };

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <div className="recipe-header">
        <h4>{recipe.title}</h4>
        {user && (
          <span className="recipe-favorite-icon" onClick={handleFavorite}>
            {recipe.is_favorited ? "★" : "☆"}
          </span>
        )}
      </div>
      <div className="recipe-meta">
        <span>By {recipe.author}</span>
        <span className="recipe-tags">{Array.isArray(recipe.tags) && recipe.tags.join(", ")}</span>
      </div>
      <p className="recipe-desc">{recipe.description?.slice(0, 72)}{recipe.description && recipe.description.length > 72 ? "..." : ""}</p>
    </div>
  );
}

function RecipeList({ loading, onSelect }) {
  const { recipes, fetchRecipes, setRecipes } = useContext(RecipeContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const handler = () => onSelect({ id: null, title: "", description: "", tags: [], category: "" }); // open new form
    window.addEventListener("openNewRecipe", handler);
    return () => window.removeEventListener("openNewRecipe", handler);
  }, [onSelect]);

  // ---- Favorite/bookmark feature
  const handleFavorite = async (recipe) => {
    try {
      if (recipe.is_favorited) {
        await api.removeFavorite(recipe.id);
      } else {
        await api.addFavorite(recipe.id);
      }
      fetchRecipes();
    } catch (e) {
      alert("Favorite failed!");
    }
  };

  if (loading) return <div style={{ padding: 32, textAlign: "center" }}>Loading...</div>;
  if (!recipes.length) return <div style={{ padding: 32, textAlign: "center" }}>No recipes found.</div>;

  return (
    <div className="recipe-list">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          onFavorite={handleFavorite}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default RecipeList;
