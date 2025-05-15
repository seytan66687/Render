import { useEffect, useState } from "react";
import supabase from "../../src/supaBaseClient";

export default function FilActualite() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("fil_actualite")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data));
  }, []);

  return (
    <div>
      <h2>Fil d’actualité</h2>
      {posts.map((p) => (
        <div key={p.id}>
          <h3>{p.titre}</h3>
          <p>{p.contenu}</p>
        </div>
      ))}
    </div>
  );
}
