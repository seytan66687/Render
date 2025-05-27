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

const supabase1 = createClient(
  "https://vvsagimqstdsgpxqhmyo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2c2FnaW1xc3Rkc2dweHFobXlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAyMjcwNCwiZXhwIjoyMDU5NTk4NzA0fQ.2SOGnY4QcWNfXPjRKxHEVd3PAcooe3VdFG7zMkBVVkc" // ⚠️ Utilise la clé de service côté serveur (plus de droits)
);

const checkUserAndAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "accès refusé" });

  const { data: userInfo, error: userError } = await supabase.auth.getUser(
    token
  );
  if (userError || !userInfo?.user?.id) {
    return res.status(401).json({ error: "Token invalide" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userInfo.user.id)
    .single();

  if (profileError) {
    return res
      .status(500)
      .json({ error: "Erreur lors de la vérification du rôle" });
  }

  if (profile.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  req.user = userInfo.user;
  next();
};

module.exports = { checkUserAndAdmin };

const checkAuth = (req, res, next) => {
  console.log("Auth header reçu :", req.headers.authorization);

  // Ajoute ce log pour mieux diagnostiquer
  if (!req.headers.authorization) {
    console.warn("⚠️ Aucun header Authorization reçu !");
  }

  if (
    !req.headers.authorization ||
    req.headers.authorization !== `Bearer ${process.env.API_SECRET}`
  ) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 📁 Servir les fichiers localement
// app.use("/uploads", checkAuth, express.static(path.join(__dirname, "uploads")));

// 📤 Config upload local
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, file.originalname), // <-- supprime les chiffres devant
});
const upload = multer({ storage });

// ✅ Créer un utilisateur unique
app.post("/api/create-user", async (req, res) => {
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
app.post("/api/import-users", async (req, res) => {
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

app.get("/api/users", checkUserAndAdmin, async (req, res) => {
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

app.delete("/api/users/:id", checkUserAndAdmin, async (req, res) => {
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
app.put("/api/users/:id", async (req, res) => {
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

app.get("/api/users/:id", checkUserAndAdmin, async (req, res) => {
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

// Supprime l'ancienne route locale d'ajout de document
// app.post("/api/add-document", upload.single("file"), async (req, res) => {
//   ...ancienne logique locale...
// });

// Nouvelle route pour créer un document avec upload dans Supabase Storage (bucket "documents")
app.post("/api/upload-document", upload.single("file"), async (req, res) => {
  const { titre, description, date_publication, categorie } = req.body;
  const file = req.file;

  if (!titre || !date_publication || !categorie || !file) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  // Lis le fichier temporaire créé par multer
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(file.path);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Erreur lecture fichier temporaire." });
  }

  const fileName = `${Date.now()}-${file.originalname}`;

  try {
    // Upload dans Supabase Storage (bucket "documents")
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur Supabase upload :", uploadError.message);
      return res.status(500).json({ error: uploadError.message });
    }

    // Récupère l'URL publique du fichier
    const { publicUrl } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName).data;

    // Nettoyage du fichier temporaire local après upload
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      // ignore
    }

    // Ajoute le document dans la table "documents"
    const { error: dbError } = await supabase.from("documents").insert([
      {
        titre,
        description,
        date_publication,
        file_url: publicUrl,
        categorie,
      },
    ]);

    if (dbError) {
      console.error("❌ Erreur insert document :", dbError.message);
      return res.status(500).json({ error: dbError.message });
    }

    res.json({ success: true, file_url: publicUrl });
  } catch (err) {
    console.error("❌ Erreur serveur API /api/upload-document :", err.message);
    res.status(500).json({ error: err.message });
  }
});

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

app.get("/download/:filename", (req, res) => {
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
          competence: row.competence || null, // <-- ajout du champ compétence
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

// PUT pour modifier un document (fichier, catégorie, lien, etc.)
app.put("/api/documents/:id", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  let { titre, description, date_publication, categorie, file_url } = req.body;
  let newFileUrl = file_url;

  // Si un fichier est envoyé, on l'upload dans Supabase Storage et on remplace l'ancien lien
  if (req.file) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Erreur Supabase upload :", uploadError.message);
        return res.status(500).json({ error: uploadError.message });
      }

      const { publicUrl } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName).data;

      newFileUrl = publicUrl;

      // Nettoyage du fichier temporaire local après upload
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // ignore
      }
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Erreur upload fichier : " + err.message });
    }
  }

  // Si file_url est un lien externe (inputType "link"), il sera déjà dans req.body.file_url
  // Si file_url est vide et pas de fichier, on ne modifie pas le champ

  // Prépare l'objet de mise à jour
  const updateObj = {
    titre,
    description,
    date_publication,
    categorie,
  };
  if (newFileUrl) updateObj.file_url = newFileUrl;

  // Retire les champs vides pour éviter d'écraser par null
  Object.keys(updateObj).forEach(
    (key) =>
      (updateObj[key] === undefined || updateObj[key] === "") &&
      delete updateObj[key]
  );

  const { error } = await supabase
    .from("documents")
    .update(updateObj)
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

// uploads

// Supprime la route locale (inutile avec Supabase Storage)
// app.use("/uploads", checkAuth, express.static(path.join(__dirname, "uploads")));

// 🔧 ROUTE POUR L'UPLOAD VERS SUPABASE
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Aucun fichier envoyé." });
  }

  // Lis le fichier temporaire créé par multer
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(file.path);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Erreur lecture fichier temporaire." });
  }

  const fileName = `${Date.now()}-${file.originalname}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur Supabase upload :", uploadError.message);
      return res.status(500).json({ error: uploadError.message });
    }

    const { publicUrl } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName).data;

    // Nettoyage du fichier temporaire local après upload
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      // ignore
    }

    res.json({ url: publicUrl });
  } catch (err) {
    console.error("Erreur serveur :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// articles

app.post("/api/articles", upload.single("image"), async (req, res) => {
  const { titre, description, contenu } = req.body;
  const file = req.file;

  if (!titre || !description || !contenu || !file) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const fileName = `${Date.now()}-${file.originalname}`;

  try {
    // 📤 Upload dans Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Erreur upload image :", uploadError.message);
      return res.status(500).json({ error: "Erreur upload image Supabase." });
    }

    // 🌐 Récupération de l’URL publique de l’image
    const { publicUrl } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName).data;

    // 🗃️ Insertion de l’article dans la base de données
    const { error: dbError } = await supabase.from("fil_actualite").insert([
      {
        titre,
        description,
        contenu,
        image_url: publicUrl, // ⚠️ Assure-toi que la colonne s’appelle bien "image_url"
      },
    ]);

    if (dbError) {
      console.error("❌ Erreur insertion actualité :", dbError.message);
      return res.status(500).json({ error: dbError.message });
    }

    res.json({ success: true, image_url: publicUrl });
  } catch (err) {
    console.error("❌ Erreur serveur :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ajoute la route pour récupérer les catégories distinctes des documents
app.get("/api/categories", async (req, res) => {
  try {
    // Récupère toutes les catégories distinctes de la colonne "categorie" de la table "documents"
    const { data, error } = await supabase
      .from("documents")
      .select("categorie")
      .neq("categorie", null);

    if (error) throw error;

    // Filtre les catégories uniques et non vides
    const uniqueCats = Array.from(
      new Set((data || []).map((d) => d.categorie).filter(Boolean))
    ).map((cat) => ({
      id: cat,
      nom: cat,
    }));

    res.json(uniqueCats);
  } catch (err) {
    console.error("Erreur récupération catégories :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Lancer le serveur
app.listen(3001, () => {
  console.log("🚀 API démarrée sur https://render-pfyp.onrender.com/");
});
