import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supaBaseClient";
import ImportCSV from "./Import";
import ImportDomaines from "./ImportDomaines";

export default function AjoutsAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vigneron");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const validatePassword = (pwd) => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const passwordValid = validatePassword(password);
  const isPasswordValid = Object.values(passwordValid).every(Boolean);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token;

        const res = await fetch("https://render-pfyp.onrender.com/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("❌ Erreur chargement utilisateurs :", data?.error);
        }
      } catch (err) {
        console.error("❌ Erreur réseau utilisateurs :", err.message);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch(
        "https://render-pfyp.onrender.com/api/create-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role, username }),
        }
      );

      const result = await res.json();

      if (result.error) {
        setMessage("❌ " + result.error);
      } else {
        setMessage("✅ Utilisateur créé avec succès !");
        setEmail("");
        setPassword("");
        setRole("vigneron");
        setUsername("");
      }
    } catch (err) {
      setMessage("❌ Erreur de connexion à l'API");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/users/${id}`,
        {
          method: "DELETE",
        }
      );
      const result = await res.json();

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const submitEdit = async () => {
    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: editingUser.username,
            email: editingUser.email,
          }),
        }
      );

      const result = await res.json();

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? editingUser : u))
        );
        setEditingUser(null);
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (err) {
      console.error("Erreur édition :", err);
    }
  };

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div>
      <h2>👥 Gestion des utilisateurs</h2>

      <h3>➕ Créer un nouvel utilisateur</h3>
      <form onSubmit={handleCreateUser} style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <div style={{ fontSize: "0.9em", marginBottom: "10px" }}>
          <p style={{ margin: 0 }}>
            {passwordValid.length ? "✅" : "❌"} Au moins 6 caractères
          </p>
          <p style={{ margin: 0 }}>
            {passwordValid.upper ? "✅" : "❌"} Une majuscule
          </p>
          <p style={{ margin: 0 }}>
            {passwordValid.number ? "✅" : "❌"} Un chiffre
          </p>
          <p style={{ margin: 0 }}>
            {passwordValid.special ? "✅" : "❌"} Un caractère spécial
          </p>
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        >
          <option value="vigneron">Vigneron</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={!isPasswordValid}>
          Créer l'utilisateur
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.startsWith("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}

      <hr style={{ margin: "40px 0" }} />

      <div>
        <h3>📥 Importer des utilisateurs</h3>
        <ImportCSV />
      </div>
      <hr style={{ margin: "40px 0" }} />
      <div>
        <h1>Import de domaines</h1>
        <ImportDomaines />
      </div>
      <hr style={{ margin: "40px 0" }} />

      <h3>📋 Liste des utilisateurs</h3>
      <label style={{ marginBottom: "10px", display: "block" }}>
        Filtrer par rôle :
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="all">Tous</option>
          <option value="vigneron">Vigneron</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          marginBottom: "20px",
          display: "block",
          padding: "8px",
          width: "40%",
        }}
      />

      {filteredUsers.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .filter(
                (u) =>
                  u.username
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {editingUser && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h4>✏️ Modifier l'utilisateur</h4>
          <input
            type="text"
            value={editingUser.username}
            onChange={(e) =>
              setEditingUser({ ...editingUser, username: e.target.value })
            }
            style={{ display: "block", marginBottom: "10px" }}
          />
          <input
            type="email"
            value={editingUser.email}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            style={{ display: "block", marginBottom: "10px" }}
          />
          <button onClick={submitEdit}>✅ Valider</button>
          <button
            onClick={() => setEditingUser(null)}
            style={{ marginLeft: "10px" }}
          >
            ❌ Annuler
          </button>
        </div>
      )}
    </div>
  );
}
