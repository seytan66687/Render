const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const checkAuth = (req, res, next) => {
  console.log("Auth header reçu :", req.headers.authorization);

  if (
    !req.headers.authorization ||
    req.headers.authorization !== `Bearer ${process.env.API_SECRET}`
  ) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

app.use(
  cors({
    origin: "https://render-front-6lwn.onrender.com", // ou "*" en dev
    allowedHeaders: ["Content-Type", "Authorization"], // autorise Authorization ici
  })
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 📁 Servir les fichiers localement
app.use("/uploads", checkAuth, express.static(path.join(__dirname, "uploads")));

// 📤 Config upload local
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Créer un utilisateur unique
app.post("/api/create-user", checkAuth, async (req, res) => {
  const { email, password, role, username } = req.body;

  console.log("📥 Données reçues :", { email, password, role, username });

  if (!email || !password || !role || !username) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("❌ Erreur Auth :", error.message);
    return res.status(400).json({ error: error.message });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: user.user.id, email, username, role }]);

  if (profileError) {
    console.error("❌ Erreur profil :", profileError.message);
    return res.status(400).json({ error: profileError.message });
  }

  console.log("✅ Utilisateur créé :", user.user.id);
  res.json({ success: true });
});

// 🔄 Supprimer les vignerons absents du fichier
app.post("/api/sync-vignerons", checkAuth, async (req, res) => {
  const { emailsToKeep } = req.body;

  if (!Array.isArray(emailsToKeep)) {
    return res
      .status(400)
      .json({ error: "emailsToKeep doit être un tableau." });
  }

  try {
    const { data: existingVignerons, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "vigneron");

    if (error) {
      console.error("❌ Erreur récupération profils :", error.message);
      return res.status(500).json({ error: error.message });
    }

    const toDelete = existingVignerons.filter(
      (user) => !emailsToKeep.includes(user.email)
    );

    if (toDelete.length === 0) {
      return res.json({ success: true, deleted: [] });
    }

    for (const user of toDelete) {
      // Supprimer dans Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) {
        console.error(
          `❌ Erreur Auth delete (${user.email}) :`,
          authError.message
        );
        return res.status(500).json({ error: authError.message });
      }

      // Supprimer dans profils
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.error(
          `❌ Erreur profil delete (${user.email}) :`,
          profileError.message
        );
        return res.status(500).json({ error: profileError.message });
      }
    }

    res.json({ success: true, deleted: toDelete.map((u) => u.email) });
  } catch (err) {
    console.error("❌ Erreur interne :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🧩 Import de masse + synchronisation
app.post("/api/import-users", checkAuth, async (req, res) => {
  const { users, emailsToKeep } = req.body;

  if (!Array.isArray(users) || !Array.isArray(emailsToKeep)) {
    return res.status(400).json({ error: "Format de données invalide." });
  }

  const created = [];
  const failed = [];

  // Création utilisateurs
  for (const user of users) {
    const { email, password, role, username } = user;

    if (!email || !password || !role || !username) {
      failed.push({ email, error: "Champs manquants" });
      continue;
    }

    try {
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        failed.push({ email, error: authError.message });
        continue;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: authUser.user.id, email, username, role }]);

      if (profileError) {
        failed.push({ email, error: profileError.message });
      } else {
        created.push(email);
      }
    } catch (err) {
      failed.push({ email, error: err.message });
    }
  }

  // Synchronisation : suppression des vignerons absents
  try {
    const { data: existingVignerons, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "vigneron");

    if (error) {
      console.error("❌ Erreur récupération vignerons :", error.message);
      return res.status(500).json({ error: error.message });
    }

    const toDelete = existingVignerons.filter(
      (user) => !emailsToKeep.includes(user.email)
    );

    for (const user of toDelete) {
      // Supprimer dans Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) {
        console.error(
          `❌ Erreur Auth delete (${user.email}) :`,
          authError.message
        );
        return res.status(500).json({ error: authError.message });
      }

      // Supprimer dans profils
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.error(
          `❌ Erreur profil delete (${user.email}) :`,
          profileError.message
        );
        return res.status(500).json({ error: profileError.message });
      }
    }

    res.json({
      success: true,
      created,
      failed,
      deleted: toDelete.map((u) => u.email),
    });
  } catch (err) {
    console.error("❌ Erreur finale :", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", checkAuth, async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const { data: userInfo, error: userError } = await supabase.auth.getUser(
      accessToken
    );

    if (userError || !userInfo?.user?.id) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const userId = userInfo.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Accès réservé aux administrateurs" });
    }

    // ✅ Autorisé, on récupère les utilisateurs
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, role");

    if (error) {
      console.error("❌ Erreur récupération utilisateurs :", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Erreur interne /api/users :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// suppr un user

app.delete("/api/users/:id", checkAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Supprimer dans Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw new Error(authError.message);

    // Supprimer dans la table `profiles`
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw new Error(profileError.message);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur suppression utilisateur :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// modif un user

// MODIFIE UN UTILISATEUR
app.put("/api/users/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  const updates = { username, email };

  if (password && password.trim() !== "") {
    // en prod tu devrais hasher ici
    updates.password = password;
  }

  const { error } = await supabase
    .from("profiles") // ✅ correction ici
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("❌ PUT utilisateur :", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });
});

app.get("/api/users/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  console.log("🔍 ID reçu:", id);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, email, role")
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Erreur Supabase :", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ajouter des doc tech

app.post(
  "/api/add-document",
  checkAuth,
  upload.single("file"),
  async (req, res) => {
    const { titre, description, date_publication } = req.body;
    const file = req.file;

    if (!titre || !date_publication || !file) {
      return res.status(400).json({ error: "Champs requis manquants." });
    }

    // 🔗 Lien local vers le fichier
    const file_url = `https://render-pfyp.onrender.com/uploads/${file.filename}`;

    try {
      const { error } = await supabase.from("documents").insert([
        {
          titre,
          description,
          date_publication,
          file_url, // ✅ On garde le nom correct de la colonne
        },
      ]);

      if (error) {
        console.error("❌ Erreur insert document :", error.message);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Erreur serveur API /api/add-document :", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/documents", checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("documents") // ou documents_techniques selon ta table
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erreur fetch documents :", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Erreur serveur GET /api/documents :", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/download/:filename", checkAuth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    return res.download(filePath); // 📥 Force le téléchargement
  } else {
    return res.status(404).send("Fichier introuvable");
  }
});

app.post("/api/import-domaines", upload.single("file"), async (req, res) => {
  try {
    console.log("Fichier reçu :", req.file);

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const domaines = xlsx.utils.sheet_to_json(sheet);

    console.log("Données extraites du fichier :", domaines);

    // Formatage et normalisation
    const formatted = domaines
      .map((row) => {
        const nom = row.nom?.trim().toLowerCase(); // clé unique normalisée
        return {
          nom: nom || null,
          description: row.description || null,
          adresse: row.adresse || null,
          certification: row.certification || null,
          ville: row.ville || null,
          lat: row.lat ? parseFloat(row.lat) : null,
          lon: row.lon ? parseFloat(row.lon) : null,
          telephone: row.telephone || null,
          email: row.email || null,
          appellation: row.appellation || null,
          commune: row.commune || null,
          type_vigne: row.type_vigne || null,
          variete: row.variete || null,
          nature_vin: row.nature_vin || null,
        };
      })
      .filter((row) =>
        Object.values(row).some((value) => value !== null && value !== "")
      ) // éliminer les lignes vides
      .filter((row) => row.nom); // éliminer les lignes sans nom

    // Suppression des doublons (nom unique)
    const uniquesParNom = Array.from(
      new Map(formatted.map((d) => [d.nom, d])).values()
    );

    console.log("Données après nettoyage :", uniquesParNom);

    // Upsert dans Supabase
    const { error: upsertError } = await supabase
      .from("domaines_viticoles")
      .upsert(uniquesParNom, { onConflict: ["nom"] });

    if (upsertError) {
      console.error("Erreur lors de l'upsert :", upsertError);
      throw new Error(upsertError.message);
    }

    // Récupérer tous les noms existants dans Supabase
    const { data: allDomaines, error: fetchError } = await supabase
      .from("domaines_viticoles")
      .select("nom");

    if (fetchError) {
      console.error("Erreur lors de la récupération :", fetchError);
      throw new Error(fetchError.message);
    }

    // Identifier les noms à supprimer
    const nomsDansFichier = uniquesParNom.map((d) => d.nom);
    const nomsDansBase = allDomaines.map((d) => d.nom);
    const nomsASupprimer = nomsDansBase.filter(
      (nom) => !nomsDansFichier.includes(nom)
    );

    if (nomsASupprimer.length > 0) {
      const { error: deleteError } = await supabase
        .from("domaines_viticoles")
        .delete()
        .in("nom", nomsASupprimer);

      if (deleteError) {
        console.error("Erreur lors de la suppression :", deleteError);
        throw new Error(deleteError.message);
      }
    }

    res.json({
      success: true,
      imported: uniquesParNom.length,
      deleted: nomsASupprimer.length,
    });
  } catch (err) {
    console.error("Erreur serveur :", err.message);
    res.status(500).json({ error: "Erreur lors de l'import : " + err.message });
  } finally {
    try {
      fs.unlinkSync(req.file.path); // Suppression fichier temporaire
    } catch (err) {
      console.warn("⚠️ Impossible de supprimer le fichier :", err.message);
    }
  }
});

// 📌 Lister tous les événements
app.get("/api/evenements", async (req, res) => {
  const { data, error } = await supabase
    .from("evenements")
    .select("*")
    .order("date_evenement", { ascending: true });

  if (error) {
    console.error("❌ Erreur récupération événements :", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// 📌 Récupérer un événement par ID
app.get("/api/evenements/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("evenements")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("❌ Erreur récupération événement :", error?.message);
    return res.status(404).json({ error: "Événement non trouvé" });
  }

  res.json(data);
});

// 📌 Ajouter un événement (avec lien)
app.post("/api/evenements", async (req, res) => {
  const { titre, lieu, date_evenement, description, type, lien } = req.body;

  const { data, error } = await supabase
    .from("evenements")
    .insert([{ titre, lieu, date_evenement, description, type, lien }])
    .select()
    .single();

  if (error) {
    console.error("❌ Erreur ajout événement :", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, event: data });
});

// 📌 Modifier un événement existant (avec lien)
app.put("/api/evenements/:id", async (req, res) => {
  const { id } = req.params;
  const { titre, lieu, date_evenement, description, type, lien } = req.body;

  const { error } = await supabase
    .from("evenements")
    .update({ titre, lieu, date_evenement, description, type, lien })
    .eq("id", id);

  if (error) {
    console.error("❌ Erreur mise à jour événement :", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });
});

// 📌 Supprimer un événement
app.delete("/api/evenements/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("evenements").delete().eq("id", id);

  if (error) {
    console.error("❌ Erreur suppression événement :", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });
});

// 📌 Liste des domaines viticoles
app.get("/api/domaines", checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("domaines_viticoles")
      .select("*")
      .order("nom", { ascending: true });

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    console.error("❌ Erreur /api/domaines :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// modifier un document le suppr etc

// GET un document par ID
app.get("/api/documents/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Document non trouvé" });
  }

  res.json(data);
});

// PUT pour modifier un document (ajout du type)
app.put("/api/documents/:id", async (req, res) => {
  const { id } = req.params;
  const { titre, description, date_publication, type } = req.body;

  const { error } = await supabase
    .from("documents")
    .update({ titre, description, date_publication, type })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });
});

// DELETE un document
app.delete("/api/documents/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });
});

// 📌 Ajouter une actualité avec image
app.post(
  "/api/articles",
  checkAuth,
  upload.single("image"),
  async (req, res) => {
    const { titre, description, contenu } = req.body;
    const file = req.file;

    if (!titre || !description || !contenu || !file) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // Chemin d'accès à l'image stockée localement
    const image_url = `https://render-pfyp.onrender.com/uploads/${file.filename}`;

    try {
      const { error } = await supabase.from("fil_actualite").insert([
        {
          titre,
          description,
          contenu,
          image_url,
        },
      ]);

      if (error) {
        console.error("❌ Erreur insertion actualité :", error.message);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Erreur serveur /api/articles :", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  const imageUrl = `https://render-pfyp.onrender.com/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// 🚀 Lancer le serveur
app.listen(3001, () => {
  console.log("🚀 API démarrée sur https://render-pfyp.onrender.com");
});
