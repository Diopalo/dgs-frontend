import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
} from "../services/keywordService";

const PRIORITES = ["BASSE", "MOYENNE", "HAUTE"];

// Ajout de site_id_form dans l'état initial du formulaire
const EMPTY_FORM = {
  site_id_form: "", 
  expression: "",
  categorie: "",
  volume_estime: "",
  priorite: "MOYENNE",
};

const PRIORITY_STYLES = {
  HAUTE: "bg-red-100 text-red-700",
  MOYENNE: "bg-amber-100 text-amber-700",
  BASSE: "bg-emerald-100 text-emerald-700",
};

function Keywords() {
  // siteId venant de l'URL (optionnel si vous préférez tout piloter par le formulaire)
  const { siteId } = useParams();

  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [priorityFilter, setPriorityFilter] = useState("TOUTES");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Utilise l'ID de l'URL s'il existe, sinon l'ID saisi dans le formulaire
  const activeSiteId = siteId || form.site_id_form;

  const fetchKeywords = useCallback(async () => {
    if (!activeSiteId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getKeywords(activeSiteId);
      setKeywords(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des mots-clés :", err);
      setError("Impossible de charger les mots-clés pour ce site.");
    } finally {
      setLoading(false);
    }
  }, [activeSiteId]);

  useEffect(() => {
    if (siteId) {
      setForm(f => ({ ...f, site_id_form: siteId }));
    }
  }, [siteId]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted && activeSiteId) await fetchKeywords();
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchKeywords, activeSiteId]);

  // --- Filtrage local ---
  const filteredKeywords = useMemo(() => {
    return keywords.filter((k) => {
      const matchesPriority =
        priorityFilter === "TOUTES" || k.priorite === priorityFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        k.expression?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.categorie?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [keywords, priorityFilter, searchTerm]);

  // --- Statistiques ---
  const stats = useMemo(() => {
    const total = keywords.length;
    const volumeTotal = keywords.reduce(
      (sum, k) => sum + (Number(k.volume_estime) || 0),
      0
    );
    const parPriorite = PRIORITES.reduce((acc, p) => {
      acc[p] = keywords.filter((k) => k.priorite === p).length;
      return acc;
    }, {});
    return { total, volumeTotal, parPriorite };
  }, [keywords]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, site_id_form: siteId || "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (keyword) => {
    setForm({
      site_id_form: activeSiteId,
      expression: keyword.expression || "",
      categorie: keyword.categorie || "",
      volume_estime: keyword.volume_estime ?? "",
      priorite: keyword.priorite || "MOYENNE",
    });
    setEditingId(keyword.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification stricte de la présence de l'ID du site
    if (!activeSiteId) {
      setError("L'identifiant du site est obligatoire pour soumettre.");
      return;
    }

    if (!form.expression.trim() || !form.categorie.trim()) {
      setError("L'expression et la catégorie sont obligatoires.");
      return;
    }

    // Le corps du JSON envoyé (Option A : Pas de site_id à l'intérieur)
    const payload = {
      expression: form.expression.trim(),
      categorie: form.categorie.trim(),
      volume_estime: Number(form.volume_estime) || 0,
      priorite: form.priorite,
    };

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        // Envoi à l'URL dynamique : /api/sites/:activeSiteId/keywords/:editingId
        const updated = await updateKeyword(activeSiteId, editingId, payload);
        const updatedKeyword = updated.data || updated;
        setKeywords((prev) =>
          prev.map((k) => (k.id === editingId ? updatedKeyword : k))
        );
      } else {
        // Envoi à l'URL dynamique comme sur Postman : /api/sites/:activeSiteId/keywords
        const created = await createKeyword(activeSiteId, payload);
        const newKeyword = created.data || created;
        setKeywords((prev) => [...prev, newKeyword]);
      }
      resetForm();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      setError("L'enregistrement a échoué. Vérifiez l'ID du site et réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement ce mot-clé ?") || !activeSiteId) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteKeyword(activeSiteId, id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("La suppression a échoué.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Mots-clés</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors"
        >
          + Nouveau mot-clé
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* --- Cartes de statistiques --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total mots-clés" value={stats.total} />
        <StatCard
          label="Volume estimé cumulé"
          value={stats.volumeTotal.toLocaleString("fr-FR")}
        />
        {PRIORITES.map((p) => (
          <StatCard
            key={p}
            label={`Priorité ${p.toLowerCase()}`}
            value={stats.parPriorite[p] || 0}
            badgeClass={PRIORITY_STYLES[p]}
          />
        ))}
      </div>

      {/* --- Filtres et Sélection du Site principal (si pas dans l'URL) --- */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {!siteId && (
          <input
            type="text"
            placeholder="ID du site à charger..."
            value={form.site_id_form}
            onChange={(e) => setForm(f => ({ ...f, site_id_form: e.target.value }))}
            className="border border-blue-300 rounded px-3 py-2 bg-blue-50 font-medium w-[180px]"
          />
        )}
        <input
          type="text"
          placeholder="Rechercher une expression ou catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 flex-1 min-w-[220px]"
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="TOUTES">Toutes les priorités</option>
          {PRIORITES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* --- Formulaire création / édition --- */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 items-end border-t-4 border-slate-900"
        >
          {/* Nouveau champ : ID du Site */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ID du Site *
            </label>
            <input
              type="text"
              placeholder="Ex: 12"
              value={form.site_id_form}
              onChange={(e) =>
                setForm((f) => ({ ...f, site_id_form: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full bg-slate-50 font-mono text-center"
              disabled={!!siteId || !!editingId} // Bloqué si l'ID vient déjà de la route ou en mode édition
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Expression
            </label>
            <input
              type="text"
              value={form.expression}
              onChange={(e) =>
                setForm((f) => ({ ...f, expression: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              value={form.categorie}
              onChange={(e) =>
                setForm((f) => ({ ...f, categorie: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Volume estimé
            </label>
            <input
              type="number"
              min="0"
              value={form.volume_estime}
              onChange={(e) =>
                setForm((f) => ({ ...f, volume_estime: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Priorité
            </label>
            <select
              value={form.priorite}
              onChange={(e) =>
                setForm((f) => ({ ...f, priorite: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full"
            >
              {PRIORITES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-6 flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded border hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      )}

      {/* --- Tableau des mots-clés --- */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-200 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Expression</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Volume estimé</th>
              <th className="p-3">Priorité</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  {activeSiteId ? "Chargement des mots-clés..." : "Veuillez spécifier ou saisir un ID de site pour charger les données."}
                </td>
              </tr>
            ) : filteredKeywords.length > 0 ? (
              filteredKeywords.map((keyword) => (
                <tr
                  key={keyword.id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3">{keyword.id}</td>
                  <td className="p-3">{keyword.expression}</td>
                  <td className="p-3">{keyword.categorie}</td>
                  <td className="p-3">
                    {Number(keyword.volume_estime || 0).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        PRIORITY_STYLES[keyword.priorite] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {keyword.priorite}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(keyword)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(keyword.id)}
                      disabled={deletingId === keyword.id}
                      className="text-red-600 hover:underline text-sm disabled:opacity-50"
                    >
                      {deletingId === keyword.id ? "..." : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Aucun mot-clé trouvé pour ce site.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, badgeClass }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          badgeClass ? "inline-block px-2 py-0.5 rounded " + badgeClass : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Keywords;