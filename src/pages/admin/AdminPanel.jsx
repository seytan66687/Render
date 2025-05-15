import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supaBaseClient";
import Evenements from "./Evenements"; // adapte le chemin si besoin
import ListeDocuments from "./ListeDocuments";

export default function AdminPanel() {
  const handleEditUser = (user) => {
    setEditingUser({ ...user }); // clone pour édition locale
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
  const [actus, setActus] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vigneron");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");

  const [newDoc, setNewDoc] = useState({
    titre: "",
    description: "",
    date_publication: "",
  });
  const [docMessage, setDocMessage] = useState("");

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
    const fetchActus = async () => {
      const { data, error } = await supabase
        .from("fil_actualite")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setActus(data);
    };

    fetchActus();
  }, []);

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

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("fil_actualite")
      .delete()
      .eq("id", id);

    if (!error) {
      setActus((prev) => prev.filter((a) => a.id !== id));
    }
  };

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

  return (
    <div>
      <h2>🛠️ Espace Administration</h2>
      <button
        onClick={() => navigate("/admin/new")}
        style={{ marginBottom: "20px" }}
      >
        ➕ Ajouter un article
      </button>
      {actus.length === 0 ? (
        <p>Aucune actualité pour le moment.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {actus.map((a) => (
            <li
              key={a.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <h3>{a.titre}</h3>
              <p>
                <strong>Description :</strong> {a.description}
              </p>
              <p>
                <strong>Contenu :</strong> {a.contenu}
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => navigate(`/admin/edit/${a.id}`)}>
                  ✏️ Modifier
                </button>
                <button onClick={() => handleDelete(a.id)}>🗑️ Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <hr style={{ margin: "40px 0" }} />
      <div>
        {/* ... ton contenu d'admin existant ... */}

        <hr style={{ margin: "40px 0" }} />
        <h2>📅 Gestion des événements</h2>
        <Evenements />
      </div>
      <div>
        {/* autres blocs d'admin... */}

        <hr style={{ margin: "40px 0" }} />
        <ListeDocuments />
      </div>
    </div>
  );
}
