import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./App";

const FIELDS = [
  { label: "Title", name: "title", required: true },
  { label: "Description", name: "description", required: true, textarea: true },
  { label: "Tags (comma separated)", name: "tags" },
  { label: "Category", name: "category" },
];

function RecipeModal({ recipe, onClose, onSave, onDelete }) {
  const editing = !recipe.id || recipe.editMode;
  const { user } = useContext(UserContext);
  const [form, setForm] = useState({
    id: recipe.id,
    title: recipe.title || "",
    description: recipe.description || "",
    tags: Array.isArray(recipe.tags) ? recipe.tags.join(", ") : (recipe.tags || ""),
    category: recipe.category || "",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    setForm({
      id: recipe.id,
      title: recipe.title || "",
      description: recipe.description || "",
      tags: Array.isArray(recipe.tags) ? recipe.tags.join(", ") : (recipe.tags || ""),
      category: recipe.category || "",
    });
    setErr("");
  }, [recipe]);

  const handleChange = (fld, val) => setForm(f => ({ ...f, [fld]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return setErr("Title and description are required.");
    // tags -> array
    let submitForm = {
      ...form,
      tags: form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(t => !!t)
        : [],
    };
    onSave(submitForm, !!form.id);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal recipe-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        {editing && (
          <form onSubmit={handleSubmit}>
            <h3>{form.id ? "Edit Recipe" : "New Recipe"}</h3>
            {FIELDS.map((fld) =>
              fld.textarea ? (
                <textarea
                  key={fld.name}
                  placeholder={fld.label}
                  required={fld.required}
                  value={form[fld.name]}
                  onChange={e => handleChange(fld.name, e.target.value)}
                  rows={6}
                />
              ) : (
                <input
                  key={fld.name}
                  type="text"
                  placeholder={fld.label}
                  required={fld.required}
                  value={form[fld.name]}
                  onChange={e => handleChange(fld.name, e.target.value)}
                />
              )
            )}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button className="btn btn-large" type="submit">{form.id ? "Save" : "Create"}</button>
              {form.id && user && (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ background: "#c0392b" }}
                  onClick={() => onDelete(form.id)}>
                  Delete
                </button>
              )}
            </div>
            {err && <div className="auth-error">{err}</div>}
          </form>
        )}
        {!editing && (
          <div>
            <h3>{recipe.title}</h3>
            <p><b>Description:</b> {recipe.description}</p>
            <p>
              <b>Tags:</b> {Array.isArray(recipe.tags) ? recipe.tags.join(", ") : recipe.tags}
              {recipe.category && <> | <b>Category: </b>{recipe.category}</>}
            </p>
            <div style={{ textAlign: "right" }}>
              {user && user.username === recipe.author && (
                <button
                  className="btn"
                  onClick={() => setForm(f => ({ ...f, editMode: true }))}>
                  Edit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeModal;
