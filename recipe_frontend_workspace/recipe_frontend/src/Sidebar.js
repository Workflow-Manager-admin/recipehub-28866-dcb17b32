import React, { useContext } from "react";
import { UserContext, RecipeContext } from "./App";

// Dummy static categories for this demo; can convert to dynamic if backend provides.
const CATEGORIES = [
  "All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snack",
];

function Sidebar({ filters, setFilters, search, setSearch }) {
  const { user } = useContext(UserContext);
  const { fetchRecipes } = useContext(RecipeContext);

  // Change filter
  const handleCategory = (cat) => {
    setFilters((f) => ({
      ...f,
      category: cat === "All" ? "" : cat,
    }));
    fetchRecipes();
  };
  return (
    <aside className="sidebar">
      <h3>Filters</h3>
      <div className="sidebar-section">
        <label>
          <b>Category</b>
        </label>
        <ul className="sidebar-categories">
          {CATEGORIES.map((cat) => (
            <li
              key={cat}
              className={filters.category === cat || (!filters.category && cat === "All") ? "active" : ""}
              onClick={() => handleCategory(cat)}
              style={{ cursor: "pointer", margin: "3px 0" }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <label>
          <b>Search</b>
        </label>
        <input
          className="sidebar-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes..."
          onKeyDown={e => {
            if (e.key === "Enter") fetchRecipes();
          }}
        />
      </div>
      {user && (
        <div className="sidebar-section" style={{ marginTop: 32 }}>
          <button
            className="btn btn-large"
            style={{ width: "100%" }}
            onClick={() => {
              // special 'new' recipe context signal
              window.dispatchEvent(new CustomEvent("openNewRecipe"));
            }}>
            + Add Recipe
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
