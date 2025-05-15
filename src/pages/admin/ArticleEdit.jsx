import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supaBaseClient";

export default function ArticleEdit() {
  const { id } = useParams();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [contenu, setContenu] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from("fil_actualite")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitre(data.titre);
        setDescription(data.description || "");
        setContenu(data.contenu);
        setImageUrl(data.image_url || "");
      }
    };

    fetchArticle();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    let finalImageUrl = imageUrl;

    // Si une nouvelle image est sélectionnée, l'uploader
    if (newImage) {
      const formData = new FormData();
      formData.append("image", newImage);

      const res = await fetch("https://render-pfyp.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        finalImageUrl = data.imageUrl;
      } else {
        console.error("Erreur upload :", data.error);
        alert("Erreur lors de l'upload de la nouvelle image");
        return;
      }
    }

    // Mise à jour Supabase
    await supabase
      .from("fil_actualite")
      .update({
        titre,
        description,
        contenu,
        image_url: finalImageUrl,
      })
      .eq("id", id);

    navigate("/admin");
  };

  return (
    <div>
      <h2>Modifier une actualité</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
        />
        <br />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <br />
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Contenu"
        />
        <br />

        {imageUrl && (
          <div>
            <p>Image actuelle :</p>
            <img src={imageUrl} alt="article" style={{ width: "200px" }} />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files[0])}
        />
        <br />

        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
