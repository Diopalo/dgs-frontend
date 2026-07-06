import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/projectService";
import MainLayout from "../layouts/MainLayout";

function CreateProject() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom) return;

    try {
      setLoading(true);
      setError("");

     
      await createProject({
        nom,
        description,
      });

      // Redirection immédiate vers la liste des projets après succès
      navigate("/projects");
    } catch (err) {
      console.error("Erreur lors de la création du projet :", err);
      setError(
        err.response?.data?.message || 
        "Une erreur est survenue lors de la création du projet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Créer un projet
      </h2>

      {/* Gestion des erreurs de l'API sans bloquer le navigateur */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 text-sm rounded font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Nom du projet
          </label>
          <input
            type="text"
            placeholder="Ex: Refonte du site vitrine"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Description (optionnelle)
          </label>
          <textarea
            placeholder="Détails, objectifs ou notes concernant le projet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex gap-4 pt-2">
          {/* Bouton Annuler pour améliorer l'expérience utilisateur */}
          <button
            type="button"
            onClick={() => navigate("/projects")}
            disabled={loading}
            className="w-1/2 p-3 border border-slate-300 rounded font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading || !nom}
            className={`w-1/2 p-3 rounded font-medium text-white transition-colors ${
              loading || !nom
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </div>
    </MainLayout>
  );
}

export default CreateProject;