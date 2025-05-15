import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../../src/supaBaseClient";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("fil_actualite")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setArticle(data);
      }
    };

    fetchArticle();
  }, [id]);

  if (!article) return <p>Chargement...</p>;

  return (
    <div className="article-detail">
      <h2>{article.titre}</h2>

      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.titre}
          className="article-image"
          style={{ width: "100%", maxWidth: "600px", marginBottom: "1rem" }}
        />
      )}

      <p>{article.contenu}</p>
      <small>
        Publié le : {new Date(article.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}
