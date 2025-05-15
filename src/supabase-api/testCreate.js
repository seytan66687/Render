const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "testuser987@example.com",
    password: "Test123!",
  });

  if (error) {
    console.error("❌ Erreur test createUser:", error.message);
  } else {
    console.log("✅ Utilisateur créé avec succès :", data.user.id);
  }
})();
