import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- il faut l'importer

export default function AddDocument() {
  const [newDoc, setNewDoc] = useState({
    titre: "",
    description: "",
    date_publication: "",
  });
  const [file, setFile] = useState(null);
  const [docMessage, setDocMessage] = useState("");
  const navigate = useNavigate(); // <-- initialise useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDocMessage("⏳ Upload et enregistrement...");

    if (!file || !newDoc.titre || !newDoc.date_publication) {
      setDocMessage("❌ Tous les champs sont requis");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("titre", newDoc.titre);
      formData.append("description", newDoc.description);
      formData.append("date_publication", newDoc.date_publication);

      const res = await fetch(
        "https://render-pfyp.onrender.com/api/add-document",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur serveur: ${res.status} - ${errorText}`);
      }

      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setDocMessage("✅ Document enregistré avec succès !");

      // 🎯 Redirige après succès (petite pause pour voir le message, optionnel)
      setTimeout(() => {
        navigate("/admin"); // redirige vers admin après succès
      }, 1000); // attends 1s pour laisser le message apparaître
    } catch (err) {
      console.error("❌ Erreur :", err.message);
      setDocMessage("❌ " + err.message);
    }
  };

  return (
    <div>
      <h2>➕ Ajouter un document technique</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Titre"
          value={newDoc.titre}
          onChange={(e) => setNewDoc({ ...newDoc, titre: e.target.value })}
          style={{ display: "block", marginBottom: "10px" }}
          required
        />

        <textarea
          placeholder="Description"
          value={newDoc.description}
          onChange={(e) =>
            setNewDoc({ ...newDoc, description: e.target.value })
          }
          rows={3}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <input
          type="date"
          value={newDoc.date_publication}
          onChange={(e) =>
            setNewDoc({ ...newDoc, date_publication: e.target.value })
          }
          style={{ display: "block", marginBottom: "10px" }}
          required
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "block", marginBottom: "10px" }}
          required
        />

        <button type="submit">Enregistrer</button>
      </form>

      {docMessage && (
        <p
          style={{
            marginTop: "10px",
            color: docMessage.startsWith("✅") ? "green" : "red",
          }}
        >
          {docMessage}
        </p>
      )}
    </div>
  );
}
