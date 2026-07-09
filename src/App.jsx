import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import Keywords from "./pages/Keywords";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import CreateSite from "./pages/CreateSite";
import AuditPage from "./pages/AuditPage";
import AuditResults from "./pages/AuditResults";
import Recommendations from "./pages/Recommendations";
import RecommendationSummary from "./pages/RecommendationSummary";
import Contents from "./pages/Contents";
import CreateContent from "./pages/CreateContent";
import EditContent from "./pages/EditContent";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Register />} />

        {/* Routes protégées */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sites" element={<ProtectedRoute><Sites /></ProtectedRoute>} />
        <Route path="/sites/create" element={<ProtectedRoute><CreateSite /></ProtectedRoute>} />
        <Route path="/sites/:id/audit" element={<ProtectedRoute><AuditResults /></ProtectedRoute>} />
        <Route path="/keywords" element={<ProtectedRoute><Keywords /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/recommendations/summary" element={<ProtectedRoute><RecommendationSummary /></ProtectedRoute>} />

        {/* Contenus — route accessible depuis le menu sans siteId */}
        <Route path="/contenus" element={<ProtectedRoute><Contents /></ProtectedRoute>} />
        <Route path="/sites/:siteId/contenus" element={<ProtectedRoute><Contents /></ProtectedRoute>} />
        <Route path="/sites/:siteId/contenus/creer" element={<ProtectedRoute><CreateContent /></ProtectedRoute>} />
        <Route path="/sites/:siteId/contenus/editer/:id" element={<ProtectedRoute><EditContent /></ProtectedRoute>} />
        {/* Fallback — redirige vers login si route inconnue */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;