import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/users/${id}`
      );
      const data = await res.json();
      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `https://render-pfyp.onrender.com/api/users/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }
    );

    const result = await res.json();

    if (result.success) {
      setMessage("✅ Utilisateur mis à jour !");
      setTimeout(() => navigate("/admin"), 1000);
    } else {
      setMessage("❌ " + result.error);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Modifier l'utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur</label>
        <input
          type="text"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
        />

        <label>Mot de passe (laisser vide si inchangé)</label>
        <input
          type="password"
          placeholder="******"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          ✅ Sauvegarder
        </button>
      </form>

      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
