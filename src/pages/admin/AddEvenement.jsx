import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddEvenement() {
  const [formData, setFormData] = useState({
    titre: "",
    lieu: "",
    date_evenement: "",
    description: "",
    type: "",
    lien: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://render-pfyp.onrender.com/api/evenements",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (result.success) {
        setMessage("✅ Événement ajouté !");
        // 🔥 Rediriger après succès
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        setMessage("❌ " + result.error);
      }
    } catch (err) {
      console.error("Erreur création événement :", err);
      setMessage("❌ Une erreur s'est produite.");
    }
  };

  return (
    <div>
      <h2>📅 Ajouter un événement</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <input
          type="text"
          placeholder="Titre"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Lieu"
          value={formData.lieu}
          onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
          required
        />
        <input
          type="date"
          value={formData.date_evenement}
          onChange={(e) =>
            setFormData({ ...formData, date_evenement: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
        >
          <option value="">-- Type d'événement --</option>
          <option value="Viticole">Viticole</option>
          <option value="Bio">Bio</option>
          <option value="Dégustation">Dégustation</option>
          <option value="Formation">Formation</option>
        </select>

        <input
          type="url"
          placeholder="Lien officiel (facultatif)"
          value={formData.lien}
          onChange={(e) => setFormData({ ...formData, lien: e.target.value })}
          style={{ display: "block", marginTop: "10px" }}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          ➕ Ajouter
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
    </div>
  );
}
