import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProjects,
  deleteProject,
  updateProject,
} from "../services/projectService";
import MainLayout from "../layouts/MainLayout";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // État pour le modal de modification
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  // Ouvre le modal avec les données du projet sélectionné
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditName(project.name || project.nom || "");
    setEditDescription(project.description || "");
  };

  // Ferme le modal sans sauvegarder
  const handleCloseEdit = () => {
    setEditingProject(null);
    setEditName("");
    setEditDescription("");
  };

  // Sauvegarde les modifications
  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateProject(editingProject.id, {
        nom: editName,
        description: editDescription,
      });
      // Met à jour la liste locale sans recharger
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: editName, nom: editName, description: editDescription }
            : p
        )
      );
      handleCloseEdit();
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
      alert("Impossible de modifier ce projet. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // Supprime un projet
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Impossible de supprimer ce projet. Réessayez.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800">Mes projets</h2>
          <Link
            to="/projects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Nouveau projet
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-slate-500 font-medium animate-pulse">
              Chargement des projets...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
            <p className="text-slate-500 mb-4">Aucun projet trouvé.</p>
            <Link
              to="/projects/create"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Créer votre premier projet
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 truncate">
                    {project.name || project.nom}
                  </h4>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    {project.description || "Aucune description fournie."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">
                    ID: #{project.id}
                  </span>
                  <div className="flex gap-3">
                    {/* Bouton Modifier */}
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                    >
                      Modifier
                    </button>
                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === project.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de modification ── */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-5">
              Modifier le projet
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du projet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Description (optionnelle)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Projects;