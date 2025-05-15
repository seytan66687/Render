import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import EditEvenement from "./pages/admin/EditEvenements";
import EditDocument from "./pages/admin/EditDocuments";
import Histoire from "./components/Histoire";

import Accueil from "./pages/Accueil";
import Login from "./pages/Login";
import FilActualite from "./pages/FilActualite";
import EspacePro from "./pages/EspacePro";
import AdminPanel from "./pages/admin/AdminPanel";
import ArticleNew from "./pages/admin/ArticleNew";
import ArticleEdit from "./pages/admin/ArticleEdit";
import ArticleDetail from "./pages/ArticleDetail"; // ✅ nouveau
import Docs from "./pages/Docs";
import AjoutsAdmin from "./pages/admin/AjoutsAdmin"; // adapte si besoin
import EditUser from "./pages/admin/EditUser"; // adapte le chemin si besoin
import AddDocument from "./pages/admin/AddDocument";
import AddEvenement from "./pages/admin/AddEvenement";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fil" element={<FilActualite />} />
          <Route path="/article/:id" element={<ArticleDetail />} />{" "}
          {/* ✅ ajout */}
          <Route path="/histoire" element={<Histoire />} />
          <Route
            path="/espace-pro"
            element={
              <PrivateRoute>
                <EspacePro />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <AdminRoute>
                <ArticleNew />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <ArticleEdit />
              </AdminRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <PrivateRoute>
                <Docs />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/edit/:id"
            element={
              <AdminRoute>
                <EditUser />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/evenements/edit/:id"
            element={
              <AdminRoute>
                <EditEvenement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/documents/edit/:id"
            element={
              <AdminRoute>
                {" "}
                {/* ou PrivateRoute si tu veux simplement restreindre l'accès */}
                <EditDocument />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/ajouts"
            element={
              <AdminRoute>
                <AjoutsAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/documents/add"
            element={
              <AdminRoute>
                <AddDocument />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/evenements/add"
            element={
              <AdminRoute>
                <AddEvenement />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
