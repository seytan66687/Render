import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";

export default function Header() {
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header>
      <nav>
        <Link to="/">Accueil</Link>
        {user ? (
          <>
            <Link to="/espace-pro">Espace pro</Link>
            {profile?.role === "admin" && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </nav>
    </header>
  );
}
