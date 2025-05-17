import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supaBaseClient";
import Evenements from "./Evenements";
import ListeDocuments from "./ListeDocuments";

export default function AdminPanel() {
  // Gestion des actualités
  const [actus, setActus] = useState([]);
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("fil_actualite")
      .delete()
      .eq("id", id);

    if (!error) {
      setActus((prev) => prev.filter((a) => a.id !== id));
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
        <hr style={{ margin: "40px 0" }} />
        <h2>📅 Gestion des événements</h2>
        <Evenements />
      </div>
      <div>
        <hr style={{ margin: "40px 0" }} />
        <ListeDocuments />
      </div>
    </div>
  );
}
