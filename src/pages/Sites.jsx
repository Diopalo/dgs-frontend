import { useEffect, useState, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import { 
  getSites, 
  createSite, 
  updateSite, 
  deleteSite 
} from "../services/siteService";

const EMPTY_FORM = { nom: "", url: "" };

function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // États pour la gestion du formulaire (Création / Édition)
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fonction de récupération globale des sites enveloppée dans un useCallback
  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSites();
      setSites(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des sites :", err);
      setError("Impossible de charger les sites. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cycle de vie initial
  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchSites();
    return () => {
      isMounted = false;
    };
  }, [fetchSites]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  // Activer le mode édition pour un site
  const handleEditClick = (site) => {
    setForm({ nom: site.nom, url: site.url });
    setEditingId(site.id);
    setShowForm(true);
  };

  // Soumission (Création & Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.url.trim()) {
      setError("Le nom et l'URL du site sont obligatoires.");
      return;
    }

    const payload = {
      nom: form.nom.trim(),
      url: form.url.trim(),
    };

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        // UPDATE
        const response = await updateSite(editingId, payload);
        const updatedSite = response.data || response;
        setSites((prev) =>
          prev.map((s) => (s.id === editingId ? updatedSite : s))
        );
      } else {
        // CREATE
        const response = await createSite(payload);
        const newSite = response.data || response;
        setSites((prev) => [...prev, newSite]);
      }
      resetForm();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du site :", err);
      setError("L'enregistrement a échoué. Veuillez vérifier les informations.");
    } finally {
      setSaving(false);
    }
  };

  // Suppression d'un site (DELETE)
  const handleDeleteSite = async (id, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le site "${nom}" ?`)) {
      return;
    }

    setError(null);
    try {
      await deleteSite(id);
      // Supprime immédiatement de l'affichage local si l'API répond OK
      setSites((prev) => prev.filter((site) => site.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression du site :", err);
      setError("La suppression a échoué. Veuillez réessayer.");
    }
  };

  return (
    <MainLayout>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Gestion des Sites</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors"
          >
            + Créer un nouveau site
          </button>
        )}
      </div>

      {/* Alertes erreurs */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Formulaire Inline dynamique (Création / Édition) */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow border border-slate-200 rounded p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end transition-all"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nom du Site</label>
            <input
              type="text"
              value={form.nom}
              placeholder="Ex: Mon Blog"
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">URL du Site</label>
            <input
              type="url"
              value={form.url}
              placeholder="https://example.com"
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      )}

      {/* Tableau des sites */}
      <div className="bg-white shadow rounded overflow-hidden border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-700 uppercase text-xs font-semibold tracking-wider border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Nom</th>
              <th className="p-3">URL</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  Chargement des sites internet...
                </td>
              </tr>
            ) : sites.length > 0 ? (
              sites.map((site) => (
                <tr key={site.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono">{site.id}</td>
                  <td className="p-3 font-medium text-slate-900">{site.nom}</td>
                  <td className="p-3">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {site.url}
                    </a>
                  </td>
                  {/* Actions CRUD intégrées */}
                  <td className="p-3 flex gap-2 justify-center items-center">
                    <button
                      onClick={() => handleEditClick(site)}
                      className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-all"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteSite(site.id, site.nom)}
                      className="text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-all"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Aucun site trouvé. Passez à l'action en en ajoutant un !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Sites;