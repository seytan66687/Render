import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../src/supaBaseClient";
import { useAuth } from "../context/AuthContext";
import "../style/scss/login.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirige automatiquement si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate("/espace-pro");
    }
  }, [user, loading, navigate]);

  // ✅ Gère le formulaire de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialise l'erreur

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants incorrects");
    }

    // ✅ On laisse le useEffect faire la redirection
  };

  // ✅ Affiche une page temporaire si le contexte n'est pas prêt
  if (loading) return <p>Chargement...</p>;

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <h2>Connexion à l’espace pro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />

      <button type="submit">Connexion</button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </form>
  );
}
