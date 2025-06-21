import React, { useState } from "react";

function AuthPage({ mode, setMode, onLogin, onRegister, onClose }) {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    let res;
    if (isRegister) {
      res = await onRegister(form);
    } else {
      res = await onLogin(form);
    }
    setLoading(false);
    if (res) setErr(res);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{isRegister ? "Register" : "Login"}</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              autoFocus
              required
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            required
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            required
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button className="btn btn-large" style={{ width: "100%", marginTop: 12 }} type="submit" disabled={loading}>
            {loading ? "..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
        {err && <div className="auth-error">{err}</div>}
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn-alt" onClick={() => setMode(isRegister ? "login" : "register")}>
            {isRegister ? "Go to Login" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
