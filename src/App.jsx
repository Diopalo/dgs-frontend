import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sites"
          element={
            <ProtectedRoute>
              <Sites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/keywords"
          element={
            <ProtectedRoute>
              <Keywords />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Login />}
        />

        <Route
          path="/inscription"
          element={<Register />}
        />

        <Route path="/projects" element={<Projects />} 
        />

        <Route path="/projects/create" element={<CreateProject />} 
        />

        <Route path="/sites/create" element={<CreateSite />} 
        />

        <Route path="/audit" element={<AuditPage />} 
        />

        <Route path="/sites/:id/audit" element={<AuditResults />} 
        />

        <Route path="/recommendations" element={<Recommendations />}
        />

        <Route
          path="/recommendations/summary"
          element={<RecommendationSummary />}
        />
        
        {/* 1. Liste des contenus et calendrier d'un site spécifié */}
        <Route 
          path="/sites/:siteId/contenus" 
          element={<Contents />} 
        />

        {/* 2. Formulaire de création d'un contenu pour un site */}
        <Route 
          path="/sites/:siteId/contenus/creer" 
          element={<CreateContent />} 
        />

      </Routes>

          

    </BrowserRouter>
  );
}

export default App;