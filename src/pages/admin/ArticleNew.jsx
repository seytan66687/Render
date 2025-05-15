import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ArticleNew() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [contenu, setContenu] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre || !description || !contenu || !image) {
      alert("Tous les champs sont requis.");
      return;
    }

    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("contenu", contenu);
    formData.append("image", image);

    try {
      const response = await fetch(
        "https://render-pfyp.onrender.com/api/articles",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/admin");
      } else {
        console.error("Erreur serveur :", data.error);
        alert("Erreur lors de la publication.");
      }
    } catch (err) {
      console.error("Erreur réseau :", err.message);
      alert("Erreur de connexion.");
    }
  };

  return (
    <div className="article-form">
      <h2>Ajouter une actualité</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />
        <br />
        <input
          type="text"
          placeholder="Courte description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Contenu complet"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          required
        />
        <br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <br />
        <button type="submit">Publier</button>
      </form>
    </div>
  );
}
